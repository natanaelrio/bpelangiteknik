import { STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from './constants';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function AdvancedFilters({
    statusFilter,
    onStatusChange,
    salesNameFilter,
    onSalesNameChange,
    salesNames,
    paymentStatusFilter,
    onPaymentStatusChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange
}) {
    return (
        <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
                <label>Status</label>
                <select
                    value={statusFilter}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">Semua Status</option>
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className={styles.filterGroup}>
                <label>Nama Sales</label>
                <select
                    value={salesNameFilter}
                    onChange={(e) => onSalesNameChange(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">Semua Sales</option>
                    {salesNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
            <div className={styles.filterGroup}>
                <label>Status Pembayaran</label>
                <select
                    value={paymentStatusFilter}
                    onChange={(e) => onPaymentStatusChange(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="">Semua Pembayaran</option>
                    {PAYMENT_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className={styles.filterGroup}>
                <label>Dari Tanggal</label>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => onDateFromChange(e.target.value)}
                    className={styles.filterSelect}
                />
            </div>
            <div className={styles.filterGroup}>
                <label>Sampai Tanggal</label>
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => onDateToChange(e.target.value)}
                    className={styles.filterSelect}
                />
            </div>
        </div>
    );
}
