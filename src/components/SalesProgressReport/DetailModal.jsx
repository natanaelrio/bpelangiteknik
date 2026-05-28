import { FaEdit } from 'react-icons/fa';
import { formatRupiah, formatDate } from './utils';
import { STATUS_STYLES } from './constants';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function DetailModal({ detailData, show, onClose, onEdit }) {
    if (!show || !detailData) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Detail Data</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalContent}>
                    {/* Informasi Dasar */}
                    <div className={styles.section}>
                        <h4>Informasi Dasar</h4>
                        <div className={styles.sectionContent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <p><strong>Nama:</strong> {detailData.nama || '-'}</p>
                                <p><strong>Sales:</strong> {detailData.salesName || '-'}</p>
                                <p><strong>No HP:</strong> {detailData.nomorHp || '-'}</p>
                                <p><strong>Alamat Kota:</strong> {detailData.alamatKota || '-'}</p>
                            </div>
                            <div>
                                <p><strong>Alamat Lengkap:</strong> {detailData.alamatLengkap || '-'}</p>
                                <p><strong>Status:</strong> <span className={styles.statusBadge} style={{ backgroundColor: STATUS_STYLES[detailData.status] || '#6B7280' }}>{detailData.status || '-'}</span></p>
                                <p><strong>Sumber:</strong> {detailData.sumber || '-'}</p>
                                {detailData.statusCatatan && (
                                    <p className={styles.bigNote}><strong>Catatan:</strong> {detailData.statusCatatan}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Produk */}
                    {detailData.items && detailData.items.length > 0 && (
                        <div className={styles.section}>
                            <h4>Informasi Produk ({detailData.items.length} item)</h4>
                            <div className={styles.sectionContent}>
                                {detailData.items.map((itemProduct, idx) => (
                                    <div key={idx} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: idx < detailData.items.length - 1 ? '1px solid #e7e7e9' : 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <p><strong>Brand:</strong> {itemProduct.brand || '-'}</p>
                                            <p><strong>Nama Barang:</strong> {itemProduct.namaBarang || '-'}</p>
                                            <p><strong>Kategori:</strong> {itemProduct.kategoriBarang === 'sparepart' ? 'Sparepart' : 'Unit'}</p>
                                        </div>
                                        <div>
                                            <p><strong>Kode Barang:</strong> {itemProduct.kodeBarang ? (
                                                <a href={`/s/${itemProduct.kodeBarang}`} target="_blank" rel="noreferrer" style={{ color: '#c8302f' }}>{itemProduct.kodeBarang}</a>
                                            ) : '-'}</p>
                                            <p><strong>Qty:</strong> {itemProduct.qty || 0}</p>
                                            <p><strong>Harga Unit:</strong> {formatRupiah(itemProduct.hargaUnit)}</p>
                                            <p><strong>Harga Deal:</strong> {formatRupiah(itemProduct.hargaDeal)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Harga & Total */}
                    <div className={styles.section}>
                        <h4>Harga & Total</h4>
                        <div className={styles.sectionContent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <p><strong>Total Unit ( Harga OCT ):</strong> {formatRupiah(detailData.totalUnit)}</p>
                                <p><strong>Total Deal:</strong> <span style={{ color: '#c8302f', fontWeight: 'bold' }}>{formatRupiah(detailData.totalDeal)}</span></p>
                            </div>
                            <div>
                                <p><strong>DPP:</strong> {formatRupiah(detailData.dpp)}</p>
                                <p><strong>PPN:</strong> {formatRupiah(detailData.ppn)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Lain */}
                    <div className={styles.section}>
                        <h4>Informasi Lain</h4>
                        <div className={styles.sectionContent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                {detailData.nomorInvoice && <p><strong>Nomor Invoice:</strong> {detailData.nomorInvoice}</p>}
                                {detailData.fakturPajak && <p><strong>Faktur Pajak:</strong> {detailData.fakturPajak}</p>}
                                {detailData.crosscheck !== undefined && <p><strong>Crosscheck:</strong> {detailData.crosscheck ? 'Ya' : 'Tidak'}</p>}
                            </div>
                            <div>
                                {detailData.remarks && <p><strong>Catatan Umum:</strong> {detailData.remarks}</p>}
                                {detailData.remarksPajak && <p><strong>Catatan Pajak:</strong> {detailData.remarksPajak}</p>}
                                <p><strong>Dibuat:</strong> {formatDate(detailData.createdAt)}</p>
                                <p><strong>Diupdate:</strong> {formatDate(detailData.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btnEdit} onClick={onEdit}>
                        <FaEdit /> Edit
                    </button>
                    <button className={styles.btnCancel} onClick={onClose}>
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
