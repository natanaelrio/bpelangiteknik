'use client'
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import 'moment/locale/id'
import styles from './SalesPenawarkanList.module.css';
import { useRouter } from "next/navigation";
import { FaTrashCan } from "react-icons/fa6";
import { HandleDeleteSalesPenawaran } from '@/service/handleSalesPenawaran';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function SalesPenawarkanList({ userSales, session }) {

    const spv = session?.user?.email === 'rio@pelangiteknik.com'

    // const userSalesNew = ['Sifa', 'Ina', 'Alma']
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    // Modal states
    const [updateInvModal, setUpdateInvModal] = useState({ show: false, id: null, invoiceNumber: '' });
    const [updatingInv, setUpdatingInv] = useState(false);
    const [statsModalOpen, setStatsModalOpen] = useState(false);
    const [productsModalOpen, setProductsModalOpen] = useState(false);
    const [productsFilterInv, setProductsFilterInv] = useState('all');
    const [popularModalOpen, setPopularModalOpen] = useState(false);
    const [chartModalOpen, setChartModalOpen] = useState(false);
    const [popularInvFilter, setPopularInvFilter] = useState('all');

    // Filter states
    const [salesNameFilter, setSalesNameFilter] = useState('');
    const [salesNameOptions, setSalesNameOptions] = useState(false);
    const [ppnFilter, setPpnFilter] = useState('all');
    const [qtyFilter, setQtyFilter] = useState({ min: '', max: '' });
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
    const [invFilter, setInvFilter] = useState('all');

    console.log(invFilter);


    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get unique sales names for dropdown
    const userSalesNew = userSales.map((item) => item.name)

    const dataSales = new Set(data.map(item => item.salesName));

    const uniqueSalesNames = userSalesNew.filter(
        name => dataSales.has(name) || userSalesNew.includes(name)
    );

    // Filtered data
    const filteredData = data.filter(item => {
        // Filter by sales name
        if (salesNameFilter && item.salesName !== salesNameFilter) return false;

        // Filter by PPN status
        if (ppnFilter === 'ppn' && !item.includePPN) return false;
        if (ppnFilter === 'non-ppn' && item.includePPN) return false;

        // Filter by INV status
        if (invFilter === 'has-inv' && !item.invoiceNumber) return false;
        if (invFilter === 'no-inv' && item.invoiceNumber) return false;

        // Filter by qty range
        if (qtyFilter.min && item.totalQty < parseInt(qtyFilter.min)) return false;
        if (qtyFilter.max && item.totalQty > parseInt(qtyFilter.max)) return false;

        // Filter by date range
        if (dateFilter.start) {
            const itemDate = new Date(item.createdAt);
            const startDate = new Date(dateFilter.start);
            startDate.setHours(0, 0, 0, 0);
            if (itemDate < startDate) return false;
        }
        if (dateFilter.end) {
            const itemDate = new Date(item.createdAt);
            const endDate = new Date(dateFilter.end);
            endDate.setHours(23, 59, 59, 999);
            if (itemDate > endDate) return false;
        }

        return true;
    });

    // Per-sales counts and totals (used for charts)
    const salesCounts = filteredData.reduce((acc, curr) => {
        acc[curr.salesName] = (acc[curr.salesName] || 0) + 1;
        return acc;
    }, {});
    const salesTotals = filteredData.reduce((acc, curr) => {
        acc[curr.salesName] = (acc[curr.salesName] || 0) + Number(curr.grandTotal);
        return acc;
    }, {});
    const totalFiltered = filteredData.length;
    const grandTotalAll = filteredData.reduce((acc, curr) => acc + Number(curr.grandTotal), 0);
    const salesPerformance = Object.keys(salesCounts)
        .map(name => ({
            name,
            count: salesCounts[name],
            total: salesTotals[name],
            percent: totalFiltered ? Math.round((salesCounts[name] / totalFiltered) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

    // Data for stats charts
    const invData = [
        { name: 'Invoice', value: filteredData.filter(d => d.invoiceNumber).length, fill: '#10b981' },
        { name: 'No Invoice', value: filteredData.filter(d => !d.invoiceNumber).length, fill: '#ef4444' }
    ];

    const ppnData = [
        { name: 'Dengan PPN', value: filteredData.filter(d => d.includePPN).length, fill: '#667eea' },
        { name: 'Tanpa PPN', value: filteredData.filter(d => !d.includePPN).length, fill: '#f59e0b' }
    ];

    const summaryData = [
        {
            name: 'Total Penawaran',
            value: filteredData.length,
            fill: '#667eea'
        },
        {
            name: 'Total Qty',
            value: filteredData.reduce((acc, curr) => acc + curr.totalQty, 0),
            fill: '#f59e0b'
        }
    ];

    const totalsData = [
        {
            name: 'Total INV',
            value: filteredData.filter(d => d.invoiceNumber).reduce((acc, curr) => acc + Number(curr.grandTotal), 0) / 1000000,
            valueRaw: filteredData.filter(d => d.invoiceNumber).reduce((acc, curr) => acc + Number(curr.grandTotal), 0),
            fill: '#10b981'
        },
        {
            name: 'Total No INV',
            value: filteredData.filter(d => !d.invoiceNumber).reduce((acc, curr) => acc + Number(curr.grandTotal), 0) / 1000000,
            valueRaw: filteredData.filter(d => !d.invoiceNumber).reduce((acc, curr) => acc + Number(curr.grandTotal), 0),
            fill: '#ef4444'
        }
    ];

    // Popular Products
    const popularFilteredData = filteredData.filter(item => {
        if (popularInvFilter === 'inv') return item.invoiceNumber;
        if (popularInvFilter === 'no-inv') return !item.invoiceNumber;
        return true;
    });

    const productCounts = popularFilteredData.reduce((acc, curr) => {
        curr.items?.forEach(item => {
            const key = item.productName;

            if (!acc[key]) {
                acc[key] = {
                    name: item.productName,
                    price: Number(item.productPriceFinal),
                    kodeBarang:
                        item.relatedProducts?.[0]?.productType || '-',
                    count: 0
                };
            }

            acc[key].count += item.qty;
        });

        return acc;
    }, {});

    const popularProducts = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        fetchData();
    }, [salesNameOptions]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [salesNameFilter, ppnFilter, qtyFilter, dateFilter, invFilter]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/get/getSalesPenawaran', {
                method: 'GET',
                headers: {
                    'Authorization': process.env.NEXT_PUBLIC_SECREET
                }
            });
            const result = await response.json();
            if (result.isCreated) {
                setData(result.data);
            } else {
                toast.error('Gagal mengambil data');
            }
        } catch (error) {
            toast.error('Error Internet');
        } finally {
            setLoading(false);
        }
    };

    const DeleteData = async (id) => {
        const isConfirm = confirm("Yakin ingin menghapus data ini?");

        if (!isConfirm) return;
        try {
            console.log('delete start')

            await HandleDeleteSalesPenawaran(id)

            console.log('delete success')
            setSalesNameOptions(!salesNameOptions)
            router.refresh()

            console.log('refresh called')
        } catch (error) {
            toast.error("Error Internet");
        } finally {
            toast.success("Data berhasil dihapus");
            setLoading(false);
        }
    };


    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleUpdateINV = async (id, invoiceNumber) => {
        if (!invoiceNumber.trim()) {
            toast.error('Nomor invoice tidak boleh kosong');
            return;
        }

        setUpdatingInv(true);
        try {
            const response = await fetch('/api/c/putINVsuratpenawaran', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': process.env.NEXT_PUBLIC_SECREET
                },
                body: JSON.stringify({
                    id,
                    invoiceNumber: invoiceNumber.trim()
                })
            });

            const result = await response.json();
            if (result.isCreated) {
                toast.success('INV berhasil diupdate');
                setUpdateInvModal({ show: false, id: null, invoiceNumber: '' });
                fetchData();
            } else {
                toast.error(result.message || 'Gagal mengupdate INV');
            }
        } catch (error) {
            toast.error('Error Internet');
            console.error('Update INV error:', error);
        } finally {
            setUpdatingInv(false);
        }
    };

    // if (loading) {
    //     return (
    //         <div className={styles.container}>
    //             <div className={styles.wrapper}>
    //                 <div className={styles.card}>
    //                     <div className={styles.loading}>
    //                         <div className={styles.spinner}></div>
    //                         <p>Memuat data...</p>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.card}>
                    {/* Header */}
                    <div className={styles.header}>
                        <h2><b>{salesNameFilter}</b></h2>
                        <h1>Data Sales Penawaran {dateFilter.start ? moment(dateFilter.start).format('dddd, DD MMMM YYYY') : ''} {dateFilter.end ? ' - ' + moment(dateFilter.end).format('dddd, DD MMMM YYYY') : ''}</h1>
                        <p>Kelola dan lihat semua penawaran sales</p>
                    </div>

                    {/* Stats */}
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#667eea' }}>{filteredData.length}</div>
                            <div className={styles.statLabel}>Total Penawaran</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#359459' }}>{filteredData.filter(d => d.invoiceNumber).length}</div>
                            <div className={styles.statLabel}>Invoice</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#ea6666' }}>{filteredData.filter(d => !d.invoiceNumber).length}</div>
                            <div className={styles.statLabel}>No Invoice</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#191818' }}>
                                {filteredData.filter(d => d.includePPN).length}
                            </div>
                            <div className={styles.statLabel}>Dengan PPN</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#f59e0b' }}>
                                {filteredData.reduce((acc, curr) => acc + curr.totalQty, 0)}
                            </div>
                            <div className={styles.statLabel}>Total Qty</div>
                        </div>
                        <br />
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#10b981' }}>
                                Rp {filteredData.filter(d => d.invoiceNumber).reduce((acc, curr) => acc + Number(curr.grandTotal), 0).toLocaleString('id-ID')}
                            </div>
                            <div className={styles.statLabel}>Total INV</div>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.statValue} style={{ color: '#ef4444' }}>
                                Rp {filteredData.filter(d => !d.invoiceNumber).reduce((acc, curr) => acc + Number(curr.grandTotal), 0).toLocaleString('id-ID')}
                            </div>
                            <div className={styles.statLabel}>Total No INV</div>
                        </div>
                    </div>



                    {/* Popular Products Section */}
                    {popularModalOpen && (
                        <div
                            className={styles.modalOverlay}
                            onClick={() => setPopularModalOpen(false)}
                        >
                            <div
                                className={styles.modalContent}
                                style={{ maxWidth: 1100 }}
                                onClick={e => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h3>Top 10 Barang Populer</h3>

                                    <button
                                        className={styles.modalClose}
                                        onClick={() =>
                                            setPopularModalOpen(false)
                                        }
                                    >
                                        ×
                                    </button>
                                </div>

                                <select
                                    className={styles.filterSelect}
                                    value={popularInvFilter}
                                    onChange={e =>
                                        setPopularInvFilter(
                                            e.target.value
                                        )
                                    }
                                    style={{ marginBottom: 20 }}
                                >
                                    <option value="all">
                                        Semua
                                    </option>
                                    <option value="inv">
                                        Sudah INV
                                    </option>
                                    <option value="no-inv">
                                        Belum INV
                                    </option>
                                </select>

                                <div className={styles.popularList}>
                                    {popularProducts.map(
                                        (product, idx) => (
                                            <div
                                                key={idx}
                                                className={
                                                    styles.popularItem
                                                }
                                            >
                                                <div>
                                                    #{idx + 1}
                                                </div>

                                                <div>
                                                    <b>
                                                        {
                                                            product.name
                                                        }
                                                    </b>
                                                    <div>
                                                        {
                                                            product.kodeBarang
                                                        }
                                                    </div>
                                                </div>

                                                <div>
                                                    Qty:
                                                    {
                                                        product.count
                                                    }
                                                </div>

                                                <div>
                                                    Rp{' '}
                                                    {product.price.toLocaleString(
                                                        'id-ID'
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {chartModalOpen && (
                        <div
                            className={styles.modalOverlay}
                            onClick={() =>
                                setChartModalOpen(false)
                            }
                        >
                            <div
                                className={styles.modalContent}
                                style={{
                                    width: '95%',
                                    maxWidth: 1500
                                }}
                                onClick={e =>
                                    e.stopPropagation()
                                }
                            >
                                <div className={styles.modalHeader}>
                                    <h3>
                                        Modern Stats Charts
                                    </h3>

                                    <button
                                        className={styles.modalClose}
                                        onClick={() =>
                                            setChartModalOpen(
                                                false
                                            )
                                        }
                                    >
                                        ×
                                    </button>
                                </div>

                                <div
                                    className={
                                        styles.chartsGrid
                                    }
                                >
                                    {/* Modern Stats Charts */}
                                    <div className={styles.chartSection}>
                                        {filteredData.length > 0 && (
                                            <div className={styles.chartsGrid}>
                                                {/* Invoice Distribution Chart */}
                                                <div className={styles.chartCard}>
                                                    <h4 className={styles.cardTitle}>Invoice Distribution</h4>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <PieChart>
                                                            <Pie
                                                                data={invData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {invData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* PPN Distribution Chart */}
                                                <div className={styles.chartCard}>
                                                    <h4 className={styles.cardTitle}>PPN Distribution</h4>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <PieChart>
                                                            <Pie
                                                                data={ppnData}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {ppnData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Summary Bar Chart */}
                                                <div className={styles.chartCard}>
                                                    <h4 className={styles.cardTitle}>Summary Metrics</h4>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart
                                                            data={summaryData}
                                                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey="name"
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={80}
                                                                tick={{ fontSize: 11 }}
                                                            />
                                                            <YAxis tick={{ fontSize: 11 }} />
                                                            <Tooltip
                                                                contentStyle={{
                                                                    backgroundColor: '#ffffff',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '8px'
                                                                }}
                                                            />
                                                            <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                {/* Totals Bar Chart */}
                                                <div className={styles.chartCard}>
                                                    <h4 className={styles.cardTitle}>Grand Total Comparison (Juta Rp)</h4>
                                                    <ResponsiveContainer width="100%" height={250}>
                                                        <BarChart
                                                            data={totalsData}
                                                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                            <XAxis
                                                                dataKey="name"
                                                                angle={-45}
                                                                textAnchor="end"
                                                                height={80}
                                                                tick={{ fontSize: 11 }}
                                                            />
                                                            <YAxis tick={{ fontSize: 11 }} />
                                                            <Tooltip
                                                                formatter={(value) => `Rp ${(value * 1000000).toLocaleString('id-ID')}`}
                                                                contentStyle={{
                                                                    backgroundColor: '#ffffff',
                                                                    border: '1px solid #e5e7eb',
                                                                    borderRadius: '8px'
                                                                }}
                                                            />
                                                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                                                {totalsData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sales Performance Chart */}
                                    {filteredData.length > 0 && (
                                        <div className={styles.chartSection}>
                                            <h3 className={styles.chartTitle}>Sales Performance Overview</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={salesPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                    <XAxis
                                                        dataKey="name"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={80}
                                                        tick={{ fontSize: 12 }}
                                                    />
                                                    <YAxis
                                                        label={{ value: 'Jumlah Penawaran', angle: -90, position: 'insideLeft' }}
                                                        tick={{ fontSize: 12 }}
                                                    />
                                                    <Tooltip
                                                        formatter={(value, name) => {
                                                            if (name === 'count') return [value, 'Jumlah Penawaran'];
                                                            if (name === 'total') return [`Rp ${value.toLocaleString('id-ID')}`, 'Total Value'];
                                                            return [value, name];
                                                        }}
                                                        contentStyle={{
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                                        }}
                                                    />
                                                    <Legend
                                                        wrapperStyle={{ paddingTop: '20px' }}
                                                        formatter={(value) => {
                                                            if (value === 'count') return 'Jumlah Penawaran';
                                                            if (value === 'total') return 'Total Value (Rp)';
                                                            return value;
                                                        }}
                                                    />
                                                    <Bar dataKey="count" fill="#667eea" name="count" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className={styles.filters}>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Sales:</label>
                            <select
                                className={styles.filterSelect}
                                value={salesNameFilter}
                                onChange={(e) => setSalesNameFilter(e.target.value)}
                            >
                                <option value="">Semua Sales</option>
                                {uniqueSalesNames.map(name => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>PPN:</label>
                            <select
                                className={styles.filterSelect}
                                value={ppnFilter}
                                onChange={(e) => setPpnFilter(e.target.value)}
                            >
                                <option value="all">Semua</option>
                                <option value="ppn">Dengan PPN</option>
                                <option value="non-ppn">Tanpa PPN</option>
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>INV:</label>
                            <select
                                className={styles.filterSelect}
                                value={invFilter}
                                onChange={(e) => setInvFilter(e.target.value)}
                            >
                                <option value="all">Semua</option>
                                <option value="has-inv">Sudah Ada INV</option>
                                <option value="no-inv">Belum Ada INV</option>
                            </select>
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Qty:</label>
                            <input
                                type="number"
                                placeholder="Min"
                                className={styles.filterInput}
                                value={qtyFilter.min}
                                onChange={(e) => setQtyFilter({ ...qtyFilter, min: e.target.value })}
                            />
                            <span style={{ color: '#9ca3af' }}>-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                className={styles.filterInput}
                                value={qtyFilter.max}
                                onChange={(e) => setQtyFilter({ ...qtyFilter, max: e.target.value })}
                            />
                        </div>
                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>Tanggal:</label>
                            <input
                                type="date"
                                className={styles.filterInput}
                                value={dateFilter.start}
                                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                            />
                            <span style={{ color: '#9ca3af' }}>-</span>
                            <input
                                type="date"
                                className={styles.filterInput}
                                value={dateFilter.end}
                                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                            />
                        </div>
                        <button
                            className={styles.filterReset}
                            onClick={() => {
                                setSalesNameFilter('');
                                setPpnFilter('all');
                                setQtyFilter({ min: '', max: '' });
                                setDateFilter({ start: '', end: '' });
                            }}
                        >
                            Reset Filter
                        </button>
                        <button
                            className={styles.modalButtonSave}
                            onClick={() => setPopularModalOpen(true)}
                        >
                            🔥 Barang Populer
                        </button>

                        <button
                            className={styles.modalButtonSave}
                            onClick={() => setChartModalOpen(true)}
                        >
                            📊 Statistik
                        </button>
                    </div>

                    {/* Content */}
                    <div className={styles.content}>
                        {filteredData.length === 0 ? (
                            <div className={styles.empty}>
                                <p>Tidak ada data yang sesuai dengan filter</p>
                            </div>
                        ) : (
                            <div className={styles.list}>
                                {paginatedData.map((item, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.itemCard} ${expandedId === item.id ? styles.itemCardExpanded : ''}`}
                                    >
                                        {spv && (
                                            <div className={styles.actionButtons}>
                                                <div
                                                    className={styles.deleteButton}
                                                    onClick={() => DeleteData(item.id)}
                                                    title="Hapus"
                                                >
                                                    <FaTrashCan color='red' size={15} />
                                                </div>
                                                <button
                                                    className={styles.updateInvButton}
                                                    onClick={() => setUpdateInvModal({ show: true, id: item.id, invoiceNumber: item.invoiceNumber || '' })}
                                                    title="Update Invoice Number"
                                                >
                                                    📄
                                                </button>
                                            </div>
                                        )}
                                        {/* Main Row */}
                                        <div
                                            className={`${styles.mainRow} ${expandedId === item.id ? styles.mainRowExpanded : ''}`}
                                            onClick={() => toggleExpand(item.id)}
                                        >
                                            <div className={styles.customerInfo}>
                                                <div className={styles.customerName}>{item.customerName}</div>
                                                {item.PICcustomerName && (
                                                    <div className={styles.picInfo}>PIC: {item.PICcustomerName}</div>
                                                )}
                                                <div className={styles.customerPhone}>{'0' + item.customerPhone}</div>
                                                <div className={styles.customerMeta}>
                                                    {moment(item.createdAt).format('DD MMM YYYY')} • {moment(item.createdAt).format('HH:mm')}
                                                </div>
                                            </div>
                                            <div className={styles.salesBlock}>
                                                <div className={styles.salesMeta}>Sales: {item.salesName}</div>
                                                <div className={styles.contactInfo}>{item.salesPhone}</div>
                                                {(() => {
                                                    const percent = totalFiltered ? Math.round(((salesCounts[item.salesName] || 0) / totalFiltered) * 100) : 0;
                                                    return (
                                                        <div className={styles.salesChart}>
                                                            <div className={styles.salesChartBar} style={{ width: `${percent}%` }} />
                                                            <div className={styles.salesChartLabel}>{salesCounts[item.salesName] || 0} ({percent}%)</div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div>
                                                <div className={styles.bankInfo}>{item.selectedBank || '-'}</div>
                                            </div>
                                            <div>
                                                <div className={styles.priceBox}>
                                                    Rp {Number(item.totalHargaSatuan).toLocaleString('id-ID')}
                                                </div>
                                                <div className={styles.priceLabel}>Satuan</div>
                                            </div>
                                            <div>
                                                <div className={styles.priceBox}>
                                                    Rp {Number(item.totalKeseluruhan).toLocaleString('id-ID')}
                                                </div>
                                                <div className={styles.priceLabel}>Total</div>
                                            </div>
                                            <div>
                                                <span className={`${styles.badge} ${item.includePPN ? styles.badgePPN : styles.badgeNonPPN}`}>
                                                    {item.includePPN ? 'PPN' : 'Tanpa PPN'}
                                                </span>
                                                {item.invoiceNumber && (
                                                    <span className={`${styles.badge} ${styles.badgeINV}`}>
                                                        ✓ {item.invoiceNumber}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.grandTotal}>
                                                <div className={styles.grandTotalValue}>
                                                    Rp {Number(item.grandTotal).toLocaleString('id-ID')}
                                                </div>
                                                <div className={styles.grandTotalMeta}>Qty: {item.totalQty}</div>
                                                <div className={styles.expandToggle}>
                                                    {expandedId === item.id ? '▼ Tutup' : '▶ Lihat Items'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {expandedId === item.id && (
                                            <div className={styles.details}>
                                                <div className={styles.detailsGrid}>
                                                    <div className={styles.detailCard}>
                                                        <h4>Informasi Customer</h4>
                                                        <p><strong>Customer:</strong> {item.customerName}</p>
                                                        <p><strong>Nomor Customer:</strong> {item.customerPhone}</p>
                                                        <p><strong>PIC:</strong> {item.PICcustomerName || '-'}</p>
                                                        <p><strong>Sales:</strong> {item.salesName} ({item.salesPhone})</p>
                                                    </div>
                                                    <div className={styles.detailCard}>
                                                        <h4>Rincian Harga</h4>
                                                        <p><strong>Total Harga Satuan:</strong> Rp {Number(item.totalHargaSatuan).toLocaleString('id-ID')}</p>
                                                        <p><strong>Total Keseluruhan:</strong> Rp {Number(item.totalKeseluruhan).toLocaleString('id-ID')}</p>
                                                        <p><strong>PPN:</strong> Rp {Number(item.ppn).toLocaleString('id-ID')}</p>
                                                        <p><strong>Grand Total:</strong> <span className={styles.grandTotalHighlight}>Rp {Number(item.grandTotal).toLocaleString('id-ID')}</span></p>
                                                    </div>
                                                    {item.selectedBank && (
                                                        <div className={styles.detailCard}>
                                                            <h4>Bank</h4>
                                                            <p>{item.selectedBank}</p>
                                                        </div>
                                                    )}
                                                    {item.notes && item.notes.length > 0 && (
                                                        <div className={`${styles.detailCard} ${styles.notesCard}`}>
                                                            <h4>Notes</h4>
                                                            {item.notes.map((note, idx) => (
                                                                <div key={idx} className={styles.noteItem}>
                                                                    {note}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={styles.itemsTable}>
                                                    <h4>Items ({item.items.length})</h4>
                                                    <table className={styles.table}>
                                                        <thead>
                                                            <tr>
                                                                <th>No</th>
                                                                <th>Product Name</th>
                                                                <th>Kode Barang</th>
                                                                <th className={styles.center}>Qty</th>
                                                                <th className={styles.right}>Harga</th>
                                                                <th className={styles.right}>Subtotal</th>
                                                                <th className={styles.right}>PPN</th>
                                                                <th className={styles.right}>GrandTotal</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {item.items.map((child, idx) => {

                                                                const subtotal =
                                                                    Number(child.productPriceFinal) * Number(child.qty);

                                                                const ppn = item.includePPN
                                                                    ? (subtotal * 11) / 100
                                                                    : 0;

                                                                const grandTotal = subtotal + ppn;

                                                                const kodeBarang = child?.relatedProducts[0]?.productType

                                                                return (
                                                                    <tr key={idx}>
                                                                        <td>{idx + 1}</td>
                                                                        <td className={styles.bold}>
                                                                            {child.productName}
                                                                        </td>
                                                                        <td className={styles.bold}>
                                                                            {kodeBarang || '-'}
                                                                        </td>
                                                                        <td className={styles.center}>
                                                                            {child.qty}
                                                                        </td>
                                                                        <td className={styles.right}>
                                                                            Rp {Number(child.productPriceFinal).toLocaleString("id-ID")}
                                                                        </td>
                                                                        <td className={styles.right}>
                                                                            Rp {subtotal.toLocaleString("id-ID")}
                                                                        </td>
                                                                        <td className={styles.right}>
                                                                            Rp {ppn.toLocaleString("id-ID")}
                                                                        </td>
                                                                        <td className={styles.right}>
                                                                            Rp {grandTotal.toLocaleString("id-ID")}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredData.length > 0 && (
                            <div className={styles.pagination}>
                                <div className={styles.paginationInfo}>
                                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data
                                </div>
                                <div className={styles.paginationControls}>
                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                    >
                                        ««
                                    </button>
                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        «
                                    </button>
                                    <span className={styles.paginationPage}>
                                        Halaman {currentPage} dari {totalPages}
                                    </span>
                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        »
                                    </button>
                                    <button
                                        className={styles.paginationButton}
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                    >
                                        »»
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Update INV */}
                {updateInvModal.show && (
                    <div className={styles.modalOverlay} onClick={() => setUpdateInvModal({ show: false, id: null, invoiceNumber: '' })}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>Update Invoice Number</h3>
                                <button
                                    className={styles.modalClose}
                                    onClick={() => setUpdateInvModal({ show: false, id: null, invoiceNumber: '' })}
                                >
                                    ×
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                <label className={styles.modalLabel}>Nomor Invoice:</label>
                                <input
                                    type="text"
                                    className={styles.modalInput}
                                    value={updateInvModal.invoiceNumber}
                                    onChange={(e) => setUpdateInvModal({ ...updateInvModal, invoiceNumber: e.target.value })}
                                    placeholder="Contoh: INV-2024-001"
                                    autoFocus
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.modalButtonCancel}
                                    onClick={() => setUpdateInvModal({ show: false, id: null, invoiceNumber: '' })}
                                    disabled={updatingInv}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={styles.modalButtonSave}
                                    onClick={() => handleUpdateINV(updateInvModal.id, updateInvModal.invoiceNumber)}
                                    disabled={updatingInv}
                                >
                                    {updatingInv ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}