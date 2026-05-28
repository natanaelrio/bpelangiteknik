import { FaSearch, FaFilter } from 'react-icons/fa';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function FilterBar({ 
    searchTerm, 
    onSearchChange, 
    showFilters, 
    onToggleFilters 
}) {
    return (
        <div className={styles.filterBar}>
            <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Cari nama, nomor HP, atau brand..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.searchInput}
                />
            </div>
            <button
                className={styles.filterToggle}
                onClick={onToggleFilters}
            >
                <FaFilter /> Filter
            </button>
        </div>
    );
}
