'use client'
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import 'moment/locale/id'
import styles from './SalesPenawarkanList.module.css';
import { useRouter } from "next/navigation";
import { FaTrashCan } from "react-icons/fa6";
import { HandleDeleteSalesPenawaran } from '@/service/handleSalesPenawaran';

export default function SalesPenawarkanList({ userSales }) {

    // const userSalesNew = ['Sifa', 'Ina', 'Alma']
    const router = useRouter();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Filter states
    const [salesNameFilter, setSalesNameFilter] = useState('');
    const [salesNameOptions, setSalesNameOptions] = useState(false);
    const [ppnFilter, setPpnFilter] = useState('all');
    const [qtyFilter, setQtyFilter] = useState({ min: '', max: '' });
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });


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
    }, [salesNameFilter, ppnFilter, qtyFilter, dateFilter]);

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
                            <div className={styles.statValue} style={{ color: '#10b981' }}>
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
                    </div>

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
                                        <div className={styles.deleteButton} onClick={() => DeleteData(item.id)}>
                                            <FaTrashCan color='red' size={15} />
                                        </div>
                                        {/* Main Row */}
                                        <div
                                            className={`${styles.mainRow} ${expandedId === item.id ? styles.mainRowExpanded : ''}`}
                                            onClick={() => toggleExpand(item.id)}
                                        >
                                            <div className={styles.customerInfo}>
                                                <div className={styles.customerName}>{item.customerName}</div>
                                                <div className={styles.customerPhone}>{item.customerPhone}</div>
                                                <div className={styles.customerMeta}>
                                                    {moment(item.createdAt).format('DD MMM YYYY')} • {moment(item.createdAt).format('HH:mm')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={styles.picInfo}>PIC: {item.PICcustomerName || '-'}</div>
                                                <div className={styles.salesMeta}>Sales: {item.salesName}</div>
                                            </div>
                                            <div>
                                                <div className={styles.contactInfo}>{item.salesPhone}</div>
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

                                                                return (
                                                                    <tr key={idx}>
                                                                        <td>{idx + 1}</td>
                                                                        <td className={styles.bold}>
                                                                            {child.productName}
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
            </div>
        </div>
    )
}