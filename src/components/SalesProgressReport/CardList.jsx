import { FaEye, FaTrash, FaSpinner } from 'react-icons/fa';
import { formatRupiah, formatDateShort, formatPaymentStatus } from './utils';
import { STATUS_STYLES, PAYMENT_STATUS_STYLES } from './constants';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function CardList({ 
    items, 
    loading, 
    SPV, 
    logsLoading,
    onDetailClick, 
    onLogsClick, 
    onDeleteClick 
}) {
    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    if (!items || items.length === 0) {
        return (
            <div className={styles.empty}>
                <p>Tidak ada data</p>
            </div>
        );
    }

    return (
        <div className={styles.cardList}>
            {items.map((item) => (
                <div key={item.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <h3>{item.nama}</h3>
                            <span
                                className={styles.statusBadge}
                                style={{ backgroundColor: STATUS_STYLES[item.status] || '#6B7280' }}
                            >
                                {item.status || 'N/A'}
                            </span>
                            {item.paymentStatus && (
                                <span
                                    className={styles.statusBadge}
                                    style={{
                                        marginLeft: '4px',
                                        backgroundColor: PAYMENT_STATUS_STYLES[item.paymentStatus] || '#6B7280'
                                    }}
                                >
                                    {formatPaymentStatus(item.paymentStatus)}
                                </span>
                            )}
                        </div>
                        <div className={styles.cardHeaderActions}>
                            <button
                                className={styles.detailBtn}
                                onClick={() => onDetailClick(item)}
                            >
                                <FaEye /> Detail
                            </button>
                            <button
                                className={styles.logBtn}
                                onClick={() => onLogsClick(item.id)}
                                disabled={logsLoading}
                            >
                                {logsLoading ? <FaSpinner className={styles.spinner} /> : <FaEye />} Logs
                            </button>
                            {SPV && (
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => onDeleteClick(item.id)}
                                >
                                    <FaTrash /> Hapus
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.cardInfoCompact}>
                        <div className={styles.compactRow}>
                            <span className={styles.compactLabel}>Sales:</span>
                            <span>{item.salesName || '-'}</span>
                            <span className={styles.compactLabel}>Telp:</span>
                            <span>{item.nomorHp || '-'}</span>
                            <span className={styles.compactLabel}>Kota:</span>
                            <span>{item.alamatKota || '-'}</span>
                        </div>
                        <div className={styles.compactRow}>
                            <span className={styles.compactLabel}>Produk:</span>
                            <span className={styles.compactProducts}>
                                {item.items?.slice(0, 2).map((prod, idx) => (
                                    <span key={idx} className={styles.compactProduct}>
                                        {prod.brand || '-'}|{prod.namaBarang || '-'}|{prod.kategoriBarang === 'sparepart' ? 'S' : 'U'}|{prod.qty}x
                                    </span>
                                ))}
                                {item.items?.length > 2 && <span className={styles.compactMore}>+{item.items.length - 2}</span>}
                            </span>
                        </div>
                        <div className={styles.compactRow}>
                            <span className={styles.compactLabel}>Total Deal:</span>
                            <span className={styles.compactPrice}>{formatRupiah(item.totalDeal)}</span>
                            <span className={styles.compactLabel}>Dibuat:</span>
                            <span>{formatDateShort(item.createdAt)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
