import { formatRupiah } from './utils';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function TotalsSummary({ totals }) {
    return (
        <div className={styles.totalsSummary}>
            <div className={styles.totalsItem}>
                <div className={styles.totalsLabel}>Total Unit ( Harga OCT )</div>
                <div className={styles.totalsValue}>{formatRupiah(totals.totalUnit)}</div>
            </div>
            <div className={styles.totalsItem}>
                <div className={styles.totalsLabel}>Total Deal</div>
                <div className={styles.totalsValueDeal}>{formatRupiah(totals.totalDeal)}</div>
            </div>
            <div className={styles.totalsItem}>
                <div className={styles.totalsLabel}>DPP (totalDeal / 1.11)</div>
                <div className={styles.totalsValue}>{formatRupiah(totals.dpp)}</div>
            </div>
            <div className={styles.totalsItem}>
                <div className={styles.totalsLabel}>PPN (DPP * 11%)</div>
                <div className={styles.totalsValue}>{formatRupiah(totals.ppn)}</div>
            </div>
            <div className={styles.totalsItem}>
                <div className={styles.totalsLabel}>Total Pembayaran</div>
                <div className={styles.totalsValuePayment}>{formatRupiah(totals.totalPayment)}</div>
            </div>
            <div className={styles.totalsItem}>
                <div className={styles.totalsLabel}>Sisa Pembayaran</div>
                <div className={styles.totalsValueRemaining}>{formatRupiah(totals.sisaPayment)}</div>
            </div>
        </div>
    );
}
