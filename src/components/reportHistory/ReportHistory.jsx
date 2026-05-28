'use client'

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import 'moment/locale/id';
import { FaSearch, FaChevronLeft, FaChevronRight, FaHistory, FaFilter } from 'react-icons/fa';
import styles from './report-history.module.css';

export default function ReportHistory({ session }) {
    const API_KEY = process.env.NEXT_PUBLIC_SECREET;
    const userName = session?.username || 'User';
    const userRole = session?.role || 'SALES';

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Filters
    const [salesNameFilter, setSalesNameFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Options from API
    const [salesNames, setSalesNames] = useState([]);
    const [actions, setActions] = useState([]);

    // Build query params
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        if (salesNameFilter) params.append('salesName', salesNameFilter);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (actionFilter) params.append('action', actionFilter);
        params.append('limit', itemsPerPage.toString());
        params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
        return params.toString();
    };

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            const queryParams = buildQueryParams();
            const response = await fetch(
                `/api/get/salesLogAll?${queryParams}`,
                {
                    headers: { authorization: API_KEY }
                }
            );
            const result = await response.json();
            if (result.isSuccess) {
                setData(result.data || []);
                setTotal(result.total || 0);
                if (result.salesNames) setSalesNames(result.salesNames);
                if (result.actions) setActions(result.actions);
            } else {
                toast.error('Gagal memuat data');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, salesNameFilter, dateFrom, dateTo, actionFilter]);

    // Format currency
    const formatRupiah = (value) => {
        if (!value && value !== 0) return 'Rp 0';
        const number = parseFloat(value) || 0;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    // Get action color
    const getActionColor = (action) => {
        const colors = {
            'CREATE': '#28a745',
            'UPDATE_STATUS': '#3b82f6',
            'UPDATE_ITEM': '#8b5cf6',
            'ADD_ITEM': '#10b981',
            'REMOVE_ITEM': '#ef4444',
            'UPDATE_PRICE': '#f59e0b',
            'CROSSCHECK': '#06b6d4',
            'CREATE_INVOICE': '#6366f1',
            'APPROVE_PAYMENT': '#22c55e',
            'CANCEL': '#6b7280'
        };
        return colors[action] || '#6b7280';
    };

    // Get action label
    const getActionLabel = (action) => {
        const labels = {
            'CREATE': 'Dibuat',
            'UPDATE_STATUS': 'Update Status',
            'UPDATE_ITEM': 'Update Item',
            'ADD_ITEM': 'Tambah Item',
            'REMOVE_ITEM': 'Hapus Item',
            'UPDATE_PRICE': 'Update Harga',
            'CROSSCHECK': 'Crosscheck',
            'CREATE_INVOICE': 'Buat Invoice',
            'APPROVE_PAYMENT': 'Approve Payment',
            'CANCEL': 'Batal'
        };
        return labels[action] || action;
    };

    // Reset filters
    const resetFilters = () => {
        setSalesNameFilter('');
        setActionFilter('');
        setDateFrom('');
        setDateTo('');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <FaHistory className={styles.titleIcon} />
                        Riwayat Aktivitas Sales
                    </h1>
                    <p className={styles.subtitle}>
                        Melihat semua aktivitas dan perubahan data sales
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.filterRow}>
                    <div className={styles.filterSelectWrapper}>
                        <FaSearch className={styles.filterIcon} />
                        <select
                            value={salesNameFilter}
                            onChange={(e) => {
                                setSalesNameFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={styles.filterSelect}
                        >
                            <option value="">Semua Sales</option>
                            {salesNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={styles.filterSelect}
                    >
                        <option value="">Semua Aksi</option>
                        {actions.map((act) => (
                            <option key={act} value={act}>{getActionLabel(act)}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                            setDateFrom(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={styles.filterInput}
                        placeholder="Dari Tanggal"
                    />

                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                            setDateTo(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={styles.filterInput}
                        placeholder="Sampai Tanggal"
                    />

                    {(salesNameFilter || actionFilter || dateFrom || dateTo) && (
                        <button
                            onClick={resetFilters}
                            className={styles.resetBtn}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Aktivitas</div>
                    <div className={styles.statValue}>{total}</div>
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loading}>Memuat data...</div>
                ) : data.length === 0 ? (
                    <div className={styles.empty}>Tidak ada data</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Waktu</th>
                                    <th>Aksi</th>
                                    <th>Sales</th>
                                    <th>Customer</th>
                                    <th>Detail Perubahan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item, idx) => (
                                    <tr key={item.id} className={idx % 2 === 0 ? styles.evenRow : ''}>
                                        <td>
                                            <div className={styles.dateCell}>
                                                <span className={styles.date}>{moment(item.createdAt).format('DD MMM YYYY')}</span>
                                                <span className={styles.time}>{moment(item.createdAt).format('HH:mm:ss')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={styles.actionBadge}
                                                style={{
                                                    backgroundColor: getActionColor(item.action) + '20',
                                                    color: getActionColor(item.action)
                                                }}
                                            >
                                                {getActionLabel(item.action)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.salesCell}>
                                                <span className={styles.salesName}>{item.actorName || '-'}</span>
                                                {item.actorRole && (
                                                    <span className={styles.salesRole}>{item.actorRole}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.customerCell}>
                                                <span className={styles.customerName}>{item.salesProgress?.nama || '-'}</span>
                                                {item.salesProgress?.status && (
                                                    <span className={styles.statusBadge}>
                                                        {item.salesProgress.status}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.detailCell}>
                                                {(item.oldValue != null || item.newValue != null) && (
                                                    item.oldValue?.startsWith('[') && item.newValue?.startsWith('[') ? (
                                                        <div className={styles.logNote}>
                                                            {(() => {
                                                                try {
                                                                    const oldItems = JSON.parse(item.oldValue);
                                                                    const newItems = JSON.parse(item.newValue);

                                                                    const getOldItems = Array.isArray(oldItems)
                                                                        ? oldItems
                                                                        : (oldItems.items || []);

                                                                    const getNewItems = Array.isArray(newItems)
                                                                        ? newItems
                                                                        : (newItems.items || []);

                                                                    const renderItemsList = (items, isNew) => (
                                                                        <table
                                                                            style={{
                                                                                width: '100%',
                                                                                fontSize: '11px',
                                                                                borderCollapse: 'collapse',
                                                                                backgroundColor: isNew ? '#e8f5e9' : '#f5f5f5',
                                                                                borderRadius: '4px',
                                                                                overflow: 'hidden'
                                                                            }}
                                                                        >
                                                                            <thead>
                                                                                <tr
                                                                                    style={{
                                                                                        backgroundColor: isNew ? '#c8e6c9' : '#e0e0e0',
                                                                                        textAlign: 'left'
                                                                                    }}
                                                                                >
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Brand
                                                                                    </th>
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Nama
                                                                                    </th>
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Kode
                                                                                    </th>
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Kat
                                                                                    </th>
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Qty
                                                                                    </th>
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Harga Unit
                                                                                    </th>
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Harga Deal
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody>
                                                                                {items.map((item, idx) => (
                                                                                    <tr key={idx}>
                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.brand || '-'}
                                                                                        </td>

                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.namaBarang || '-'}
                                                                                        </td>

                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.kodeBarang || '-'}
                                                                                        </td>

                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.kategoriBarang === 'sparepart' ? 'S' : 'U'}
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '6px',
                                                                                                border: '1px solid #ddd',
                                                                                                textAlign: 'center'
                                                                                            }}
                                                                                        >
                                                                                            {item.qty || 0}
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '6px',
                                                                                                border: '1px solid #ddd',
                                                                                                textAlign: 'right'
                                                                                            }}
                                                                                        >
                                                                                            {item.hargaUnit
                                                                                                ? formatRupiah(item.hargaUnit)
                                                                                                : '-'}
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '6px',
                                                                                                border: '1px solid #ddd',
                                                                                                textAlign: 'right',
                                                                                                fontWeight: 'bold'
                                                                                            }}
                                                                                        >
                                                                                            {item.hargaDeal
                                                                                                ? formatRupiah(item.hargaDeal)
                                                                                                : '-'}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    );

                                                                    return (
                                                                        <>
                                                                            <div
                                                                                style={{
                                                                                    marginBottom: '4px',
                                                                                    marginTop: '8px'
                                                                                }}
                                                                            >
                                                                                <strong>Item Lama:</strong>
                                                                            </div>

                                                                            {renderItemsList(getOldItems, false)}

                                                                            <div
                                                                                style={{
                                                                                    marginBottom: '4px',
                                                                                    marginTop: '8px'
                                                                                }}
                                                                            >
                                                                                <strong>Item Baru:</strong>
                                                                            </div>

                                                                            {renderItemsList(getNewItems, true)}
                                                                        </>
                                                                    );
                                                                } catch (e) {
                                                                    return (
                                                                        <p className={styles.logChange}>
                                                                            {item.oldValue != null
                                                                                ? (
                                                                                    isNaN(parseFloat(item.oldValue))
                                                                                        ? item.oldValue
                                                                                        : formatRupiah(item.oldValue)
                                                                                )
                                                                                : '-'
                                                                            }

                                                                            {' → '}

                                                                            {item.newValue != null
                                                                                ? (
                                                                                    isNaN(parseFloat(item.newValue))
                                                                                        ? item.newValue
                                                                                        : formatRupiah(item.newValue)
                                                                                )
                                                                                : '-'
                                                                            }
                                                                        </p>
                                                                    );
                                                                }
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <p className={styles.logChange}>
                                                            {item.oldValue != null
                                                                ? (
                                                                    isNaN(parseFloat(item.oldValue))
                                                                        ? item.oldValue
                                                                        : formatRupiah(item.oldValue)
                                                                )
                                                                : '-'
                                                            }

                                                            {' → '}

                                                            {item.newValue != null
                                                                ? (
                                                                    isNaN(parseFloat(item.newValue))
                                                                        ? item.newValue
                                                                        : formatRupiah(item.newValue)
                                                                )
                                                                : '-'
                                                            }
                                                        </p>
                                                    )
                                                )}

                                                {item.note && (
                                                    item.note.includes('→') && item.note.startsWith('[') ? (
                                                        <div className={styles.logNote}>
                                                            {(() => {
                                                                try {
                                                                    const arrowIndex = item.note.indexOf('→');

                                                                    const oldPart = item.note
                                                                        .substring(0, arrowIndex)
                                                                        .trim();

                                                                    const newPart = item.note
                                                                        .substring(arrowIndex + 1)
                                                                        .trim();

                                                                    const oldItems = JSON.parse(oldPart);
                                                                    const newItems = JSON.parse(newPart);

                                                                    const getItems = Array.isArray(oldItems)
                                                                        ? oldItems
                                                                        : (oldItems.items || []);

                                                                    const getNewItems = Array.isArray(newItems)
                                                                        ? newItems
                                                                        : (newItems.items || []);

                                                                    const renderItemsList = (items, isNew) => (
                                                                        <table
                                                                            style={{
                                                                                width: '100%',
                                                                                fontSize: '11px',
                                                                                borderCollapse: 'collapse',
                                                                                backgroundColor: isNew ? '#e8f5e9' : '#f5f5f5',
                                                                                borderRadius: '4px',
                                                                                overflow: 'hidden'
                                                                            }}
                                                                        >
                                                                            <thead>
                                                                                <tr
                                                                                    style={{
                                                                                        backgroundColor: isNew ? '#c8e6c9' : '#e0e0e0',
                                                                                        textAlign: 'left'
                                                                                    }}
                                                                                >
                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Brand
                                                                                    </th>

                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Nama
                                                                                    </th>

                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Kode
                                                                                    </th>

                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Kat
                                                                                    </th>

                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Qty
                                                                                    </th>

                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Harga Unit
                                                                                    </th>

                                                                                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                        Harga Deal
                                                                                    </th>
                                                                                </tr>
                                                                            </thead>

                                                                            <tbody>
                                                                                {items.map((item, idx) => (
                                                                                    <tr key={idx}>
                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.brand || '-'}
                                                                                        </td>

                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.namaBarang || '-'}
                                                                                        </td>

                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.kodeBarang || '-'}
                                                                                        </td>

                                                                                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            {item.kategoriBarang === 'sparepart' ? 'S' : 'U'}
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '6px',
                                                                                                border: '1px solid #ddd',
                                                                                                textAlign: 'center'
                                                                                            }}
                                                                                        >
                                                                                            {item.qty || 0}
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '6px',
                                                                                                border: '1px solid #ddd',
                                                                                                textAlign: 'right'
                                                                                            }}
                                                                                        >
                                                                                            {item.hargaUnit
                                                                                                ? formatRupiah(item.hargaUnit)
                                                                                                : '-'}
                                                                                        </td>

                                                                                        <td
                                                                                            style={{
                                                                                                padding: '6px',
                                                                                                border: '1px solid #ddd',
                                                                                                textAlign: 'right',
                                                                                                fontWeight: 'bold'
                                                                                            }}
                                                                                        >
                                                                                            {item.hargaDeal
                                                                                                ? formatRupiah(item.hargaDeal)
                                                                                                : '-'}
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    );

                                                                    return (
                                                                        <>
                                                                            <div
                                                                                style={{
                                                                                    marginBottom: '4px',
                                                                                    marginTop: '8px'
                                                                                }}
                                                                            >
                                                                                <strong>Item Lama:</strong>
                                                                            </div>

                                                                            {renderItemsList(getItems, false)}

                                                                            <div
                                                                                style={{
                                                                                    marginBottom: '4px',
                                                                                    marginTop: '8px'
                                                                                }}
                                                                            >
                                                                                <strong>Item Baru:</strong>
                                                                            </div>

                                                                            {renderItemsList(getNewItems, true)}
                                                                        </>
                                                                    );
                                                                } catch (e) {
                                                                    console.error('Error parsing log note:', e);

                                                                    return (
                                                                        <p style={{ whiteSpace: 'pre-wrap' }}>
                                                                            {item.note}
                                                                        </p>
                                                                    );
                                                                }
                                                            })()}
                                                        </div>
                                                    ) : (
                                                        <p className={styles.logNote}>
                                                            {item.note}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Halaman {currentPage} dari {totalPages} ({total} data)
                        </div>
                        <div className={styles.paginationButtons}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={styles.paginationBtn}
                            >
                                <FaChevronLeft /> Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className={styles.paginationBtn}
                            >
                                Next <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
