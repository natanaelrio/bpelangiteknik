// List of Indonesian provinces
export const PROVINCES = [
    "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
    "Sumatera Selatan", "Bengkulu", "Lampung", "Kepulauan Bangka Belitung",
    "Kepulauan Riau", "DKI Jakarta", "Jawa Barat", "Jawa Tengah",
    "DI Yogyakarta", "Jawa Timur", "Banten", "Bali", "Nusa Tenggara Barat",
    "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
    "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara",
    "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"
];

// Status styles for badges
export const STATUS_STYLES = {
    'Prospect': '#3B82F6',
    'Follow Up': '#F59E0B',
    'Penawaran': '#8B5CF6',
    'Invoice': '#10B981',
    'Deal': '#EF4444',
    'Cancel': '#6B7280'
};

// Payment status colors
export const PAYMENT_STATUS_STYLES = {
    'LUNAS': '#28a745',
    'DP': '#f59e0b',
    'CICIL': '#8b5cf6',
    'BELUM_BAYAR': '#6b7280'
};

// WhatsApp group IDs
export const WHATSAPP_GROUPS = {
    SPV: '120363406595440008@g.us',
    SALES: '120363411343925143@g.us'
};

// Items per page
export const ITEMS_PER_PAGE = 20;

// Brand options
export const BRAND_OPTIONS = [
    { value: 'TSUZUMI', label: 'TSUZUMI' },
    { value: 'CHAMPIONS', label: 'CHAMPIONS' },
    { value: 'MONTOYA', label: 'MONTOYA' },
    { value: 'ISUZU', label: 'ISUZU' },
    { value: 'FAW-VW', label: 'FAW-VW' },
    { value: 'HIDEMITSU', label: 'HIDEMITSU' },
    { value: 'PRODUK LOCAL', label: 'PRODUK LOCAL' },
    { value: 'DLL', label: 'DLL' }
];

// Source options
export const SOURCE_OPTIONS = [
    { value: 'usaha sendiri', label: 'Usaha Sendiri' },
    { value: 'wa pa tommy', label: 'WA Pa Tommy' },
    { value: 'wa ci fenti', label: 'WA Ci Fenti' },
    { value: 'web pelangi', label: 'Web Pelangi' },
    { value: 'web tsuzumi/talk to', label: 'Web Tsuzumi/Talk To' },
    { value: 'grup sales pt', label: 'Grup Sales PT' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'walk in', label: 'Walk In' }
];

// Status options
export const STATUS_OPTIONS = [
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Follow Up', label: 'Follow Up' },
    { value: 'Penawaran', label: 'Penawaran' },
    { value: 'Negosiasi', label: 'Negosiasi' },
    { value: 'Invoice', label: 'Invoice' },
    { value: 'Cancel', label: 'Cancel' }
];

// Payment status options
export const PAYMENT_STATUS_OPTIONS = [
    { value: 'BELUM_BAYAR', label: 'Belum Bayar' },
    { value: 'DP', label: 'DP (Uang Muka)' },
    { value: 'CICIL', label: 'Cicilan' },
    { value: 'LUNAS', label: 'Lunas' }
];

// Rekening options
export const REKENING_OPTIONS = [
    { value: 'PT PELANGI TEKNIK INDONESIA', label: 'PT PELANGI TEKNIK INDONESIA' },
    { value: 'PT TSUZUMI JAPAN TECHNOLOGY', label: 'PT TSUZUMI JAPAN TECHNOLOGY' },
    { value: 'Rekening Fenti Marlina', label: 'Rekening Fenti Marlina' },
    { value: 'Rekening Tommy Admadiredja', label: 'Rekening Tommy Admadiredja' },
    { value: 'Web Pelangi Teknik', label: 'Web Pelangi Teknik' },
    { value: 'Web TsuzumiJapan', label: 'Web TsuzumiJapan' }
];

// Default item structure
export const DEFAULT_ITEM = {
    brand: '',
    namaBarang: '',
    kodeBarang: '',
    kategoriBarang: 'unit',
    qty: 1,
    hargaUnit: '',
    subtotalUnit: '',
    hargaDeal: '',
    subtotalDeal: '',
    note: ''
};

// Default form data
export const DEFAULT_FORM_DATA = (userName, perusahaan) => ({
    salesName: userName,
    salesCompany: perusahaan,
    nama: '',
    alamatLengkap: '',
    alamatKota: '',
    nomorHp: '',
    sumber: '',
    status: '',
    statusCatatan: '',
    crosscheck: false,
    fakturPajak: '',
    nomorInvoice: '',
    totalUnit: '',
    totalDeal: '',
    dpp: '',
    ppn: '',
    remarks: '',
    remarksPajak: '',
    totalPayment: '',
    sisaPayment: '',
    paymentStatus: '',
    RekeningName: '',
    items: [{ ...DEFAULT_ITEM }]
});
