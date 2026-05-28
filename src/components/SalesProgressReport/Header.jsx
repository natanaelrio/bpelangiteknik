import { FaPlus, FaSignOutAlt } from 'react-icons/fa';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function Header({ userName, randomQuote, onAddClick, onLogout }) {
    return (
        <div className={styles.header}>
            <div>
                <h1 className={styles.title}>Sales Progress Report</h1>
                <p className={styles.subtitle}>Kelola data prospek dan follow-up penjualan</p>
                <p style={{ marginTop: '8px', fontStyle: 'italic', color: '#666' }}>
                    👋 Selamat datang, <strong>{userName}</strong>! {randomQuote}
                </p>
            </div>
            <button
                className={styles.btnPrimary}
                onClick={onAddClick}
            >
                <FaPlus /> Tambah Data
            </button>
            <button
                className={styles.btnSignout}
                onClick={onLogout}
            >
                <FaSignOutAlt /> Logout
            </button>
        </div>
    );
}
