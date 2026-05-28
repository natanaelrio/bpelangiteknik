import { formatRupiah, formatDate } from './utils';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function LogsModal({ logsData, show, onClose }) {
    if (!show || !logsData) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Riwayat Perubahan</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalContent}>
                    {logsData.length === 0 ? (
                        <div className={styles.empty}>Tidak ada riwayat</div>
                    ) : (
                        <div className={styles.logsList}>
                            {logsData.map((log) => (
                                <LogItem key={log.id} log={log} />
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose}>Tutup</button>
                </div>
            </div>
        </div>
    );
}

function LogItem({ log }) {
    return (
        <div className={styles.logItem}>
            <div className={styles.logTime}>{formatDate(log.createdAt)}</div>
            <div className={styles.logContent}>
                <div className={styles.logActor}>
                    <strong>{log.actorName || 'System'}</strong>
                    {log.actorRole && <span className={styles.logRole}>{log.actorRole}</span>}
                </div>
                <p className={styles.logAction}>{log.action}</p>
                {(log.oldValue != null || log.newValue != null) && (
                    <LogChange log={log} />
                )}
                {log.note && <LogNote note={log.note} />}
            </div>
        </div>
    );
}

function LogChange({ log }) {
    if (log.oldValue?.startsWith('[') && log.newValue?.startsWith('[')) {
        return (
            <div className={styles.logNote}>
                <ItemsTable log={log} />
            </div>
        );
    }

    return (
        <p className={styles.logChange}>
            {log.oldValue != null ? (isNaN(parseFloat(log.oldValue)) ? log.oldValue : formatRupiah(log.oldValue)) : '-'}
            {' → '}
            {log.newValue != null ? (isNaN(parseFloat(log.newValue)) ? log.newValue : formatRupiah(log.newValue)) : '-'}
        </p>
    );
}

function LogNote({ note }) {
    if (note.includes('→') && note.startsWith('[')) {
        return (
            <div className={styles.logNote}>
                <ItemsTableNote note={note} />
            </div>
        );
    }

    return <p className={styles.logNote}>{note}</p>;
}

function ItemsTable({ log }) {
    try {
        const oldItems = JSON.parse(log.oldValue);
        const newItems = JSON.parse(log.newValue);
        const getOldItems = Array.isArray(oldItems) ? oldItems : (oldItems.items || []);
        const getNewItems = Array.isArray(newItems) ? newItems : (newItems.items || []);

        return (
            <>
                <div style={{ marginBottom: '4px', marginTop: '8px' }}><strong>Item Lama:</strong></div>
                {renderItemsList(getOldItems, false)}
                <div style={{ marginBottom: '4px', marginTop: '8px' }}><strong>Item Baru:</strong></div>
                {renderItemsList(getNewItems, true)}
            </>
        );
    } catch (e) {
        return null;
    }
}

function ItemsTableNote({ note }) {
    try {
        const arrowIndex = note.indexOf('→');
        const oldPart = note.substring(0, arrowIndex).trim();
        const newPart = note.substring(arrowIndex + 1).trim();
        const oldItems = JSON.parse(oldPart);
        const newItems = JSON.parse(newPart);
        const getOldItems = Array.isArray(oldItems) ? oldItems : (oldItems.items || []);
        const getNewItems = Array.isArray(newItems) ? newItems : (newItems.items || []);

        return (
            <>
                <div style={{ marginBottom: '4px', marginTop: '8px' }}><strong>Item Lama:</strong></div>
                {renderItemsList(getOldItems, false)}
                <div style={{ marginBottom: '4px', marginTop: '8px' }}><strong>Item Baru:</strong></div>
                {renderItemsList(getNewItems, true)}
            </>
        );
    } catch (e) {
        return <p style={{ whiteSpace: 'pre-wrap' }}>{note}</p>;
    }
}

function renderItemsList(items, isNew) {
    return (
        <table style={{
            width: '100%',
            fontSize: '11px',
            borderCollapse: 'collapse',
            backgroundColor: isNew ? '#e8f5e9' : '#f5f5f5',
            borderRadius: '4px',
            overflow: 'hidden'
        }}>
            <thead>
                <tr style={{ backgroundColor: isNew ? '#c8e6c9' : '#e0e0e0', textAlign: 'left' }}>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Brand</th>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Nama</th>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Kode</th>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Kat</th>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Qty</th>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Harga Unit</th>
                    <th style={{ padding: '6px', border: '1px solid #ddd' }}>Harga Deal</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item, idx) => (
                    <tr key={idx}>
                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>{item.brand || '-'}</td>
                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>{item.namaBarang || '-'}</td>
                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>{item.kodeBarang || '-'}</td>
                        <td style={{ padding: '6px', border: '1px solid #ddd' }}>{item.kategoriBarang === 'sparepart' ? 'S' : 'U'}</td>
                        <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'center' }}>{item.qty || 0}</td>
                        <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{item.hargaUnit ? formatRupiah(item.hargaUnit) : '-'}</td>
                        <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{item.hargaDeal ? formatRupiah(item.hargaDeal) : '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
