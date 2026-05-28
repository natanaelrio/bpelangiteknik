import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function Pagination({ currentPage, totalPages, totalCount, onPageChange }) {
    if (totalPages <= 1) return null;

    return (
        <div className={styles.pagination}>
            <button
                className={styles.paginationBtn}
                onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
            >
                <FaChevronLeft /> Previous
            </button>
            <span className={styles.paginationInfo}>
                Halaman {currentPage} dari {totalPages} ({totalCount} data)
            </span>
            <button
                className={styles.paginationBtn}
                onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
            >
                Next <FaChevronRight />
            </button>
        </div>
    );
}
