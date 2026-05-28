import Link from 'next/link';
import { 
    PROVINCES, 
    BRAND_OPTIONS, 
    SOURCE_OPTIONS, 
    STATUS_OPTIONS, 
    PAYMENT_STATUS_OPTIONS, 
    REKENING_OPTIONS 
} from './constants';
import { formatRupiah, formatRupiahRounded, calculateTax } from './utils';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function ModalForm({ 
    modalMode, 
    formData, 
    onInputChange, 
    onItemChange, 
    onAddItem, 
    onRemoveItem,
    onClose,
    onSave,
    onSendWhatsApp,
    isSubmitting
}) {
    const isCreateMode = modalMode === 'create';
    const showPaymentSection = formData.status === 'Invoice' || formData.status === 'Deal';
    const showEditableItems = !isCreateMode && (formData.status === 'Negosiasi' || formData.status === 'Invoice');

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{isCreateMode ? 'Tambah Data' : 'Edit Data'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalContent}>
                    {isCreateMode ? (
                        <CreateModeForm
                            formData={formData}
                            onInputChange={onInputChange}
                            onItemChange={onItemChange}
                            onAddItem={onAddItem}
                            onRemoveItem={onRemoveItem}
                            showPaymentSection={showPaymentSection}
                        />
                    ) : (
                        <EditModeForm
                            formData={formData}
                            onInputChange={onInputChange}
                            onItemChange={onItemChange}
                            onAddItem={onAddItem}
                            onRemoveItem={onRemoveItem}
                            showEditableItems={showEditableItems}
                            showPaymentSection={showPaymentSection}
                        />
                    )}
                </div>

                <div className={styles.modalFooter}>
                    <button className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </button>
                    <button className={styles.btnSave} onClick={onSave} disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : (isCreateMode ? 'Tambah Data' : 'Update Data')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Create Mode Form Component
function CreateModeForm({ formData, onInputChange, onItemChange, onAddItem, onRemoveItem, showPaymentSection }) {
    const { dpp, ppn } = calculateTax(formData.totalDeal);

    return (
        <div className={styles.formGrid}>
            {/* Basic Info */}
            <div className={styles.formSection}>
                <h3>Informasi Dasar</h3>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Nama *</label>
                        <input type="text" name="nama" value={formData.nama} onChange={onInputChange} className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nomor HP *</label>
                        <input type="text" name="nomorHp" value={formData.nomorHp} onChange={onInputChange} className={styles.input} />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Alamat Kota</label>
                        <select name="alamatKota" value={formData.alamatKota} onChange={onInputChange} className={styles.input}>
                            <option value="">Pilih Provinsi</option>
                            {PROVINCES.map((province) => (
                                <option key={province} value={province}>{province}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Alamat Lengkap</label>
                        <input type="text" name="alamatLengkap" value={formData.alamatLengkap} onChange={onInputChange} className={styles.input} />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Status *</label>
                        <select name="status" value={formData.status} onChange={onInputChange} className={styles.input}>
                            <option value="">Pilih Status</option>
                            {STATUS_OPTIONS.filter(s => s.value !== 'Negosiasi' && s.value !== 'Invoice').map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Sumber *</label>
                        <select name="sumber" value={formData.sumber} onChange={onInputChange} className={styles.input}>
                            <option value="">Pilih Sumber</option>
                            {SOURCE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Catatan Status *</label>
                        <textarea name="statusCatatan" value={formData.statusCatatan} onChange={onInputChange} className={`${styles.input} ${styles.bigNoteInput}`} rows={3} />
                    </div>
                </div>

                {/* Pricing Summary */}
                <div className={styles.formSection}>
                    <h3>Total Harga</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Total Unit ( Harga OCT )</label>
                            <input type="text" value={formatRupiah(formData.totalUnit)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Total Deal</label>
                            <input type="text" value={formatRupiah(formData.totalDeal)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                        </div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>DPP (Total Deal / 1.11)</label>
                            <input type="text" value={formatRupiahRounded(dpp)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>PPN (DPP × 11%)</label>
                            <input type="text" value={formatRupiahRounded(ppn)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                        </div>
                    </div>
                </div>

                {/* Payment Section */}
                {showPaymentSection && (
                    <PaymentSection formData={formData} onInputChange={onInputChange} />
                )}
            </div>

            {/* Product Info */}
            <ProductSection 
                items={formData.items} 
                onItemChange={onItemChange} 
                onAddItem={onAddItem} 
                onRemoveItem={onRemoveItem}
                isCreateMode={true}
            />
        </div>
    );
}

// Edit Mode Form Component
function EditModeForm({ formData, onInputChange, onItemChange, onAddItem, onRemoveItem, showEditableItems, showPaymentSection }) {
    const { dpp, ppn } = calculateTax(formData.totalDeal);

    return (
        <div className={styles.formGrid}>
            {/* Basic Info - Read Only */}
            <div className={styles.formSection}>
                <h3>Informasi Dasar</h3>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Nama</label>
                        <input type="text" value={formData.nama} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Sales Name</label>
                        <input type="text" value={formData.salesName || '-'} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Nomor HP</label>
                        <input type="text" value={formData.nomorHp || '-'} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Alamat Kota</label>
                        <select name="alamatKota" value={formData.alamatKota || ''} onChange={onInputChange} className={styles.input}>
                            <option value="">Pilih Provinsi</option>
                            {PROVINCES.map((province) => (
                                <option key={province} value={province}>{province}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Alamat Lengkap</label>
                        <input type="text" name="alamatLengkap" value={formData.alamatLengkap || ''} onChange={onInputChange} className={styles.input} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={onInputChange} className={styles.input}>
                            <option value="">Pilih Status</option>
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Sumber</label>
                        <input type="text" value={formData.sumber || '-'} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Status Catatan</label>
                        <textarea name="statusCatatan" value={formData.statusCatatan} onChange={onInputChange} className={`${styles.input} ${styles.bigNoteInput}`} rows={3} />
                    </div>
                </div>
            </div>

            {/* Product Section - Editable or Read Only */}
            {showEditableItems ? (
                <ProductSection 
                    items={formData.items} 
                    onItemChange={onItemChange} 
                    onAddItem={onAddItem} 
                    onRemoveItem={onRemoveItem}
                    isCreateMode={false}
                />
            ) : (
                <ProductReadOnly items={formData.items} />
            )}

            {/* Total Harga Section */}
            <div className={styles.formSection}>
                <h3>Total Harga</h3>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Total Unit ( Harga OCT )</label>
                        <input type="text" value={formatRupiah(formData.totalUnit)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Total Deal</label>
                        <input type="text" value={formatRupiah(formData.totalDeal)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>DPP (Total Deal / 1.11)</label>
                        <input type="text" value={formatRupiahRounded(dpp)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>PPN (DPP × 11%)</label>
                        <input type="text" value={formatRupiahRounded(ppn)} readOnly className={styles.input} style={{ backgroundColor: '#f5f5f5' }} />
                    </div>
                </div>
            </div>

            {/* Payment Section */}
            {formData.status === 'Invoice' && (
                <PaymentSection formData={formData} onInputChange={onInputChange} isEditMode={true} />
            )}
        </div>
    );
}

// Product Section Component
function ProductSection({ items, onItemChange, onAddItem, onRemoveItem, isCreateMode }) {
    return (
        <div className={styles.formSection}>
            <h3>Informasi Produk</h3>
            {items?.map((item, index) => (
                <div key={index} className={styles.itemSection}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Brand</label>
                            <select value={item.brand || ''} onChange={(e) => onItemChange(index, 'brand', e.target.value)} className={styles.input}>
                                <option value="">Pilih Brand</option>
                                {BRAND_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nama Barang</label>
                            <input type="text" value={item.namaBarang || ''} onChange={(e) => onItemChange(index, 'namaBarang', e.target.value)} className={styles.input} />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Kode Barang (<Link style={{ textDecoration: 'underline' }} href="https://docs.google.com/spreadsheets/d/1jNHhULbGyAQrReeckyEmMb6VNWMme7xvwUQDYlf6ffQ/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer">klik disini</Link>)</label>
                            <input type="text" value={item.kodeBarang || ''} onChange={(e) => onItemChange(index, 'kodeBarang', e.target.value)} className={styles.input} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Kategori</label>
                            <select value={item.kategoriBarang || 'unit'} onChange={(e) => onItemChange(index, 'kategoriBarang', e.target.value)} className={styles.input}>
                                <option value="unit">Unit</option>
                                <option value="sparepart">Sparepart</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Qty</label>
                            <input type="number" value={item.qty} onChange={(e) => onItemChange(index, 'qty', parseInt(e.target.value))} className={styles.input} />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Harga OCT (Rp)</label>
                            <input
                                type="text"
                                value={item.hargaUnit ? formatRupiah(item.hargaUnit) : ''}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                    onItemChange(index, 'hargaUnit', rawValue);
                                }}
                                placeholder="Rp 0"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Harga Deal (Rp)</label>
                            <input
                                type="text"
                                value={item.hargaDeal ? formatRupiah(item.hargaDeal) : ''}
                                onChange={(e) => {
                                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                    onItemChange(index, 'hargaDeal', rawValue);
                                }}
                                placeholder="Rp 0"
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {items.length > 1 && (
                        <button type="button" className={styles.btnRemoveItem} onClick={() => onRemoveItem(index)}>
                            Hapus Item
                        </button>
                    )}
                </div>
            ))}
            {isCreateMode && (
                <button type="button" className={styles.btnAddItem} onClick={onAddItem}>
                    + Tambah Produk
                </button>
            )}
        </div>
    );
}

// Product Read Only Component
function ProductReadOnly({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className={styles.formSection}>
            <h3>Produk ({items.length} item)</h3>
            <div className={styles.productReview}>
                {items.slice(0, 5).map((item, index) => (
                    <div key={index} className={styles.productReviewItem}>
                        <div className={styles.productReviewInfo}>
                            <span className={styles.productReviewName}>{item.brand || '-'} - {item.namaBarang || 'Produk'}</span>
                            <span className={styles.productReviewQty}>Kode: {item.kodeBarang || '-'} | Kategori: {item.kategoriBarang === 'sparepart' ? 'Sparepart' : 'Unit'} | Qty: {item.qty || 0}</span>
                        </div>
                        <div className={styles.productReviewPrices}>
                            <span className={styles.productReviewPriceUnit}>Unit: {formatRupiah(item.hargaUnit || 0)}</span>
                            <span className={styles.productReviewPrice}>Deal: {formatRupiah(item.hargaDeal || 0)}</span>
                        </div>
                    </div>
                ))}
                {items.length > 5 && (
                    <div className={styles.productReviewMore}>+{items.length - 5} produk lainnya</div>
                )}
            </div>
        </div>
    );
}

// Payment Section Component
function PaymentSection({ formData, onInputChange, isEditMode = false }) {
    return (
        <div className={styles.formSection}>
            <h3>{isEditMode ? 'Invoice & Pembayaran' : 'Pembayaran'}</h3>
            
            {!isEditMode && (
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Status Pembayaran</label>
                        <select name="paymentStatus" value={formData.paymentStatus || ''} onChange={onInputChange} className={styles.input}>
                            <option value="">Pilih Status</option>
                            {PAYMENT_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {isEditMode && (
                <div className={styles.formGroup}>
                    <label>Status Pembayaran</label>
                    <select name="paymentStatus" value={formData.paymentStatus || ''} onChange={onInputChange} className={styles.input}>
                        <option value="">Pilih Status</option>
                        {PAYMENT_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>Nomor Invoice</label>
                    <input type="text" name="nomorInvoice" value={formData.nomorInvoice} onChange={onInputChange} className={styles.input} placeholder="INV/001/2024" />
                </div>
                <div className={styles.formGroup}>
                    <label>Rekening</label>
                    <select name="RekeningName" value={formData.RekeningName || ''} onChange={onInputChange} className={styles.input}>
                        <option value="">Pilih Rekening</option>
                        {REKENING_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label>Total Pembayaran</label>
                    <input
                        type="text"
                        name="totalPayment"
                        value={formData.totalPayment ? formatRupiah(formData.totalPayment) : 'Rp 0'}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            const totalPayment = parseFloat(rawValue) || 0;
                            const totalDeal = parseFloat(formData.totalDeal) || 0;
                            const sisaPayment = totalPayment >= totalDeal ? 0 : totalDeal - totalPayment;
                            onInputChange({ target: { name: 'totalPayment', value: rawValue, type: 'text' } });
                            onInputChange({ target: { name: 'sisaPayment', value: sisaPayment.toString(), type: 'text' } });
                        }}
                        placeholder="Rp 0"
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Sisa Pembayaran (Auto)</label>
                    <input
                        type="text"
                        value={formatRupiah(Math.max(0, (parseFloat(formData.totalDeal) || 0) - (parseFloat(formData.totalPayment) || 0)))}
                        readOnly
                        className={styles.input}
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                </div>
            </div>
        </div>
    );
}
