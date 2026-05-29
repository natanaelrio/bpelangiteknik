'use client'

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment';
import 'moment/locale/id';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaDownload, FaSearch, FaChevronLeft, FaChevronRight, FaSignOutAlt } from 'react-icons/fa';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { motivationalQuotes } from '../utils/motivationalQuotes';
import Link from 'next/link';
import { signOut } from "next-auth/react"
import { SendGroupReportSales } from '../service/handleCRM';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import QRCode from 'qrcode';
import LogoAtas from './logo/logoAtas';
import TTD from './logo/ttd';
import LogoAtasTZ from './logo/logoAtasTZ';
import TTDTZ from './logo/ttdTZ';

// List of Indonesian provinces
const PROVINCES = [
    "Tidak diketahui", "Luar Negeri", "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
    "Sumatera Selatan", "Bengkulu", "Lampung", "Kepulauan Bangka Belitung",
    "Kepulauan Riau", "DKI Jakarta", "Jawa Barat", "Jawa Tengah",
    "DI Yogyakarta", "Jawa Timur", "Banten", "Bali", "Nusa Tenggara Barat",
    "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
    "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
    "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara",
    "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara",
    "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"
];

export default function SalesProgressReport({ session }) {

    const userName = session.username || 'User';
    const userRole = session.role || 'SALES';
    const perusahaan = session.perusahaan || 'PT xxxx';
    const nomerHp = session.nomerHp || '000000000000';

    const SPV = session.role === 'SPV' || false;

    const logoBase64 = LogoAtas()
    const logoTTD = TTD()
    const logoBase64TZ = LogoAtasTZ()
    const logoTTDTZ = TTDTZ()

    // Get random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [logsData, setLogsData] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);

    // Loading state for submit
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [salesNameFilter, setSalesNameFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Totals from API
    const [totals, setTotals] = useState({ totalUnit: 0, totalDeal: 0, dpp: 0, ppn: 0, totalPayment: 0, sisaPayment: 0 });

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Get unique sales names for filter
    const [salesNames, setSalesNames] = useState([]);

    // Total count from API
    const [totalCount, setTotalCount] = useState(0);

    // Form states - hidden fields: dpp, ppn, remarks, remarksPajak
    const [formData, setFormData] = useState({
        salesName: userName,
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
        // Hidden fields - auto-calculated
        dpp: '',
        ppn: '',
        remarks: '',
        remarksPajak: '',
        // Payment fields
        totalPayment: '',
        sisaPayment: '',
        paymentStatus: '',
        // Company & Bank fields
        salesCompany: perusahaan,
        RekeningName: '',
        items: [{
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
        }]
    });

    const API_KEY = process.env.NEXT_PUBLIC_SECREET;

    // Build query params for API
    const buildQueryParams = () => {
        const params = new URLSearchParams();

        // If not SPV, only show own data
        if (userRole !== 'SPV') {
            params.append('salesName', userName);
        } else if (salesNameFilter) {
            params.append('salesName', salesNameFilter);
        }

        if (statusFilter) params.append('status', statusFilter);
        if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        params.append('limit', itemsPerPage.toString());
        params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
        return params.toString();
    };

    // Fetch data with API-based filtering and pagination
    const fetchData = async () => {
        try {
            setLoading(true);
            const queryParams = buildQueryParams();
            const response = await fetch(
                `/api/get/salesProgress?${queryParams}`,
                {
                    headers: { authorization: API_KEY }
                }
            );
            const result = await response.json();
            if (result.isSuccess) {
                setData(result.data || []);
                setTotalCount(result.total || 0);
                setTotals(result.totals || { totalUnit: 0, totalDeal: 0, dpp: 0, ppn: 0, totalPayment: 0, sisaPayment: 0 });
            } else {
                toast.error('Gagal memuat data');
            }
        } catch (error) {
            toast.error('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch sales names for filter dropdown
    const fetchSalesNames = async () => {
        try {
            const response = await fetch(
                '/api/get/salesProgress?limit=1000',
                {
                    headers: { authorization: API_KEY }
                }
            );
            const result = await response.json();
            if (result.isSuccess) {
                const names = [...new Set(result.data?.map(item => item.salesName).filter(Boolean))].sort();
                setSalesNames(names);
            }
        } catch (error) {
            console.error('Error fetching sales names:', error);
        }
    };

    // Fetch logs for a specific record
    const fetchLogs = async (salesProgressId) => {
        try {
            const response = await fetch(
                `/api/get/salesLog?salesProgressId=${salesProgressId}&limit=100`,
                {
                    headers: { authorization: API_KEY }
                }
            );
            const result = await response.json();
            if (result.isSuccess) {
                setLogsData(result.data || []);
                setShowLogs(true);
            }
        } catch (error) {
            toast.error('Gagal memuat logs');
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, statusFilter, salesNameFilter, paymentStatusFilter, debouncedSearch, dateFrom, dateTo]);

    // Fetch sales names on mount
    useEffect(() => {
        fetchSalesNames();
    }, []);

    // Handle form input
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Reset payment fields when status changes to non-Invoice
        if (name === 'status' && value !== 'Invoice') {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
                paymentStatus: '',
                nomorInvoice: '',
                RekeningName: '',
                totalPayment: '',
                sisaPayment: ''
            }));

            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Format currency for display
    const formatRupiah = (value) => {
        if (!value && value !== 0) return 'Rp 0';
        const number = parseFloat(value) || 0;
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    // Format currency without decimal/comma for DPP and PPN
    const formatRupiahRounded = (value) => {
        if (!value && value !== 0) return 'Rp 0';
        const number = Math.round(parseFloat(value) || 0);
        return 'Rp ' + number.toLocaleString('id-ID');
    };

    // Handle item change with auto-calculate subtotals
    const handleItemChange = (index, field, value) => {
        setFormData(prev => {
            const newItems = prev.items.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [field]: value };

                    // Auto-calculate subtotals when harga or qty changes
                    if (field === 'hargaUnit' || field === 'qty' || field === 'hargaDeal') {
                        const qty = field === 'qty' ? parseFloat(value) || 0 : (parseFloat(updatedItem.qty) || 0);

                        if (field === 'hargaUnit' || field === 'qty') {
                            const hargaUnit = field === 'hargaUnit' ? parseFloat(value) || 0 : (parseFloat(updatedItem.hargaUnit) || 0);
                            updatedItem.subtotalUnit = hargaUnit * qty;
                        }

                        if (field === 'hargaDeal' || field === 'qty') {
                            const hargaDeal = field === 'hargaDeal' ? parseFloat(value) || 0 : (parseFloat(updatedItem.hargaDeal) || 0);
                            updatedItem.subtotalDeal = hargaDeal * qty;
                        }
                    }

                    return updatedItem;
                }
                return item;
            });

            // Auto-calculate totalUnit and totalDeal
            const totalUnit = newItems.reduce((sum, item) => sum + (parseFloat(item.subtotalUnit) || 0), 0);
            const totalDeal = newItems.reduce((sum, item) => sum + (parseFloat(item.subtotalDeal) || 0), 0);

            return { ...prev, items: newItems, totalUnit, totalDeal };
        });
    };

    // Add item
    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                brand: '',
                namaBarang: '',
                kodeBarang: '',
                qty: 1,
                hargaUnit: '',
                subtotalUnit: '',
                hargaDeal: '',
                subtotalDeal: '',
                note: ''
            }]
        }));
    };

    // Remove item
    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    // Handle create/edit
    const handleSave = async () => {
        if (!formData.nama) {
            toast.error('Nama wajib diisi');
            return;
        }
        if (!formData.nomorHp) {
            toast.error('Nomor HP wajib diisi');
            return;
        }
        if (!formData.sumber) {
            toast.error('Sumber wajib diisi');
            return;
        }
        if (!formData.status) {
            toast.error('Status wajib diisi');
            return;
        }
        if (!formData.statusCatatan) {
            toast.error('Catatan Catatan wajib diisi');
            return;
        }

        // Validation for items - each item must have required fields
        if (!formData.items || formData.items.length === 0) {
            toast.error('Produk wajib diisi');
            return;
        }

        // Check each item for required fields
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            const itemNum = i + 1;

            if (!item.brand) {
                toast.error(`Produk ${itemNum}: Brand wajib dipilih`);
                return;
            }
            if (!item.namaBarang) {
                toast.error(`Produk ${itemNum}: Nama Barang wajib diisi`);
                return;
            }
            if (!item.kategoriBarang) {
                toast.error(`Produk ${itemNum}: Kategori wajib dipilih`);
                return;
            }
            if (!item.qty || item.qty <= 0) {
                toast.error(`Produk ${itemNum}: Qty wajib diisi dan minimal 1`);
                return;
            }
            if (!item.hargaUnit || parseFloat(item.hargaUnit) <= 0) {
                toast.error(`Produk ${itemNum}: Harga OCT (Rp) wajib diisi`);
                return;
            }
            if (!item.hargaDeal || parseFloat(item.hargaDeal) <= 0) {
                toast.error(`Produk ${itemNum}: Harga Deal (Rp) wajib diisi`);
                return;
            }
        }

        // Validation for Invoice status - payment fields are required
        if (formData.status === 'Invoice') {
            if (!formData.paymentStatus) {
                toast.error('Status Pembayaran wajib diisi');
                return;
            }
            if (!formData.nomorInvoice) {
                toast.error('Nomor Invoice wajib diisi');
                return;
            }
            if (!formData.RekeningName) {
                toast.error('Rekening wajib diisi');
                return;
            }
            if (!formData.totalPayment || parseFloat(formData.totalPayment) <= 0) {
                toast.error('Total Pembayaran wajib diisi');
                return;
            }
        }

        setIsSubmitting(true);

        // Auto-calculate DPP and PPN (hidden fields) - rounded
        // DPP = totalDeal / 1.11
        // PPN = DPP * 11%
        const totalDealNum = parseFloat(formData.totalDeal) || 0;
        const calculatedDpp = totalDealNum > 0 ? Math.round(totalDealNum / 1.11) : 0;
        const calculatedPpn = Math.round(calculatedDpp * 0.11);

        // Prepare data for API - clear payment fields if status is not Invoice
        const apiData = {
            ...formData,
            dpp: calculatedDpp,
            ppn: calculatedPpn,
            actorName: userName,
            actorRole: userRole,
            oldValues: modalMode === 'edit' ? selectedRecord : undefined
        };

        // Clear payment fields when status is not Invoice
        if (formData.status !== 'Invoice') {
            apiData.paymentStatus = '';
            apiData.nomorInvoice = '';
            apiData.RekeningName = '';
            apiData.totalPayment = '';
            apiData.sisaPayment = '';
        }

        try {
            const response = await fetch('/api/p/salesProgress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: API_KEY
                },
                body: JSON.stringify(apiData)
            });

            const result = await response.json();
            if (result.isSuccess) {
                toast.success(result.message);

                // Send to WhatsApp after successful save
                try {
                    await sendToWhatsApp();
                } catch (waError) {
                    console.error('WhatsApp send error:', waError);
                }

                setShowModal(false);
                resetForm();
                fetchData();
            } else {
                toast.error(result.message || 'Gagal menyimpan data');
            }
        } catch (error) {
            toast.error('Error: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Build WhatsApp message from form data
    const buildWhatsAppMessage = () => {
        const itemsList = formData.items?.map((item, idx) => {
            return `${idx + 1}. ${item.brand || '-'} - ${item.namaBarang || '-'} (${item.kategoriBarang === 'sparepart' ? 'Sparepart' : 'Unit'})
   Qty: ${item.qty || 0} | Harga OCT: Rp ${parseFloat(item.hargaUnit || 0).toLocaleString('id-ID')} | Harga Deal: Rp ${parseFloat(item.hargaDeal || 0).toLocaleString('id-ID')}`;
        }).join('\n\n');

        const totalUnit = formData.items?.reduce((sum, item) => sum + (parseFloat(item.subtotalUnit) || 0), 0) || 0;
        const totalDeal = formData.items?.reduce((sum, item) => sum + (parseFloat(item.subtotalDeal) || 0), 0) || 0;
        const dpp = Math.round(totalDeal / 1.11);
        const ppn = Math.round(dpp * 0.11);

        const message = `📊 *LAPORAN SALES PROGRESS*

🏢 *Perusahaan:* ${perusahaan}
👤 *Sales:* ${userName}
📅 *Tanggal:* ${moment().format('DD MMMM YYYY HH:mm')}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *DATA CUSTOMER*
• *Nama:* ${formData.nama || '-'}
• *No. HP:* ${formData.nomorHp || '-'}
• *Kota:* ${formData.alamatKota || '-'}
• *Alamat:* ${formData.alamatLengkap || '-'}
• *Sumber:* ${formData.sumber || '-'}

📌 *STATUS*
• *Status:* ${formData.status || '-'}
• *Catatan:* ${formData.statusCatatan || '-'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 *DAFTAR PRODUK*
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *TOTAL*
• Total Unit (OCT): Rp ${totalUnit.toLocaleString('id-ID')}
• Total Deal: Rp ${totalDeal.toLocaleString('id-ID')}
• DPP: Rp ${dpp.toLocaleString('id-ID')}
• PPN: Rp ${ppn.toLocaleString('id-ID')}

${formData.status === 'Invoice' ? `💳 *PEMBAYARAN*
• Status: ${formData.paymentStatus || '-'}
• Invoice: ${formData.nomorInvoice || '-'}
• Rekening: ${formData.RekeningName || '-'}
• Total Bayar: Rp ${parseFloat(formData.totalPayment || 0).toLocaleString('id-ID')}
• Sisa Bayar: Rp ${parseFloat(formData.sisaPayment || 0).toLocaleString('id-ID')}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━
_Dikirim dari Sales Progress Report_`;

        return message;
    };

    // Send to WhatsApp group
    const sendToWhatsApp = async () => {
        try {
            const spv = userRole === 'SPV';
            const isProduction = process.env.NODE_ENV === 'production';

            const payloadSalesPenawaran = {
                groupId: isProduction ? '120363411343925143@g.us' : '120363406595440008@g.us',
                message: buildWhatsAppMessage()
            };

            const result = await SendGroupReportSales(payloadSalesPenawaran);

            if (result?.success) {
                toast.success('Laporan berhasil dikirim ke WhatsApp!');
            } else {
                toast.error('Gagal mengirim ke WhatsApp');
            }
        } catch (error) {
            console.error('WhatsApp send error:', error);
            toast.error('Error mengirim ke WhatsApp');
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;

        try {
            const response = await fetch(`/api/del/salesProgress?id=${id}`, {
                method: 'DELETE',
                headers: { authorization: API_KEY }
            });

            const result = await response.json();
            if (result.isSuccess) {
                toast.success('Data berhasil dihapus');
                fetchData();
            } else {
                toast.error(result.message || 'Gagal menghapus data');
            }
        } catch (error) {
            toast.error('Error: ' + error.message);
        }
    };

    // Handle edit
    const handleEdit = (record) => {
        setSelectedRecord(record);
        setFormData({
            id: record.id, // Include the ID for update
            salesName: userName || '',
            nama: record.nama || '',
            alamatLengkap: record.alamatLengkap || '',
            alamatKota: record.alamatKota || '',
            nomorHp: record.nomorHp || '',
            sumber: record.sumber || '',
            status: record.status || 'Prospect',
            statusCatatan: '', // Empty on edit
            crosscheck: record.crosscheck || false,
            fakturPajak: record.fakturPajak || '',
            nomorInvoice: record.nomorInvoice || '',
            totalUnit: record.totalUnit || '',
            totalDeal: record.totalDeal || '',
            dpp: record.dpp || '',
            ppn: record.ppn || '',
            remarks: record.remarks || '',
            remarksPajak: record.remarksPajak || '',
            // Payment fields
            totalPayment: record.totalPayment || '',
            sisaPayment: record.sisaPayment || '',
            paymentStatus: record.paymentStatus || '',
            // Company & Bank fields
            salesCompany: record.salesCompany || perusahaan,
            RekeningName: record.RekeningName || '',
            items: record.items?.length > 0 ? record.items : [{
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
            }]
        });
        setModalMode('edit');
        setShowModal(true);
    };

    const bankList = [
        {
            nama: "Bank BCA - PT Pelangi Teknik Indonesia",
            detail: `Bank BCA
a.n PT Pelangi Teknik Indonesia
Cab : Lindeteves Trade Center
Swift Code : CENAIDJA
a.c 5885.127.255`
        },
        {
            nama: "Bank BCA - PT Tsuzumi Japan Teknologi",
            detail: `Bank BCA
a.n PT Tsuzumi Japan Teknologi
a.c  5885-611-777`
        },
        {
            nama: "Bank BCA - Fenti Marlina",
            detail: `Bank BCA
a.n Fenti Marlina
Cab : Lindeteves Trade Center
Swift Code : CENAIDJA
a.c 588.5062.609`
        }
    ];

    // Download modal states
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedDownloadItem, setSelectedDownloadItem] = useState(null);
    const [selectedBank, setSelectedBank] = useState(bankList[0]);
    const [downloadNotes, setDownloadNotes] = useState([
        "Garansi servise 1 tahun",
        "Pembayaran cash before shipping",
        "Franco Jabodetabek",
        "Surat penawaran berlaku selama 3 (Tiga) minggu sejak surat penawaran di buat."
    ]);

    // Handler for opening download modal
    const openDownloadModal = (item) => {
        setSelectedDownloadItem(item);
        setSelectedBank(bankList[0]);
        setDownloadNotes([
            "Garansi servise 1 tahun",
            "Pembayaran cash before shipping",
            "Franco Jabodetabek",
            "Surat penawaran berlaku selama 3 (Tiga) minggu sejak surat penawaran di buat."
        ]);
        setShowDownloadModal(true);
    };

    // Add new note
    const addDownloadNote = () => {
        setDownloadNotes([...downloadNotes, ""]);
    };

    // Remove note
    const removeDownloadNote = (index) => {
        setDownloadNotes(downloadNotes.filter((_, i) => i !== index));
    };

    // Update note
    const updateDownloadNote = (index, value) => {
        const newNotes = [...downloadNotes];
        newNotes[index] = value;
        setDownloadNotes(newNotes);
    };

    // Handle download offer letter (penawaran)
    const handleDownloadPenawaran = async (item) => {
        // Prepare data from sales progress item
        const customerName = item.nama;

        // Transform items to offer letter format
        const dataPenawarkan = item.items?.map(recordItem => ({
            productName: recordItem.namaBarang || '-',
            spekNew: [], // No specs in sales progress
            qty: recordItem.qty || 1,
            productPriceFinal: recordItem.hargaDeal || 0
        })) || [];

        const totalQty = dataPenawarkan.reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
        const totalKeseluruhan = dataPenawarkan.reduce((sum, item) => sum + (parseFloat(item.productPriceFinal) || 0) * (parseInt(item.qty) || 0), 0);
        const includePPN = true; // Default to include PPN

        // Use selected bank from modal
        const currentBank = selectedBank || bankList[0];

        // Use notes from state (filter out empty ones)
        const notes = downloadNotes.filter(n => n.trim() !== '');

        // Sales info
        const nameSales = item.salesName || userName;
        const numberSales = ''; // Phone number not stored in sales progress

        // Generate QR Code
        const qrCodeData = perusahaan === 'PT Pelangi Teknik Indonesia' && await generateQRCode(`${process.env.NEXT_PUBLIC_URL2}`) || perusahaan === 'PT Tsuzumi Japan Technology' && await generateQRCode(`https://tsuzumijapan.com`) || '';

        const docDefinitionv = {
            content: [
                {
                    columns: [
                        {
                            image: qrCodeData,
                            width: 70,
                            style: 'qr'
                        },
                        {
                            stack:
                                perusahaan === 'PT Pelangi Teknik Indonesia'
                                    ? [
                                        { image: logoBase64, width: 230, alignment: 'right', style: 'gambarlogo' },
                                        { text: 'Lindeteves Trade Center Lt. GF2 Blok B7 No. 05', style: 'atasLogo', alignment: 'right' },
                                        { text: 'Jl. Hayam Wuruk No.127 - Jakarta Barat', style: 'atasLogo', alignment: 'right' },
                                        { text: 'Tel.021-62303512; pelangiteknik@rocketmail.com', style: 'atasLogo', alignment: 'right' },
                                        { text: 'www.pelangiteknik.com', style: 'atasLogo', alignment: 'right' },
                                    ]
                                    : perusahaan === 'PT Tsuzumi Japan Technology'
                                        ? [
                                            { image: logoBase64TZ, width: 210, alignment: 'right', style: 'gambarlogo' },
                                            { text: 'Jl. Hasyim Ashari No. 29 – Tangerang', style: 'atasLogo', alignment: 'right' },
                                            { text: 'No Telp : 085195219494 / 085195209494', style: 'atasLogo', alignment: 'right' },
                                            { text: 'www.tsuzumijapan.com | Email : hello@tsuzumijapan.com', style: 'atasLogo', alignment: 'right' },
                                        ]
                                        : []
                        }
                    ],
                    columnGap: 10,
                },
                { text: '\n' },
                { text: '\n' },

                { text: `Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, style: 'defaultStyle' },
                { text: '\n' },
                { text: 'Kepada Yth,', style: 'Blode' },
                { text: `${customerName}`, style: 'Blode' },
                { text: item.alamatKota || '', style: 'Blode' },
                { text: '\n' },
                { text: `Perihal       : Surat Penawaran`, style: 'Blode' },
                { text: '\n' },
                { text: `Dengan hormat, demikian disampaikan informasi dari barang yang saudara butuhkan :`, style: 'defaultStyle' },
                { text: '\n' },

                {
                    table: {
                        widths: ['auto', '*', 'auto', 'auto'],
                        body: [
                            [
                                { text: "Jumlah", style: "tableHeader", alignment: 'center' },
                                { text: "Deskripsi Barang", style: "tableHeader" },
                                { text: "Harga Satuan", style: "tableHeader" },
                                { text: "Total", style: "tableHeader" },
                            ],
                            ...dataPenawarkan.map((recordItem) => [
                                {
                                    text: String(recordItem.qty),
                                    style: "subheader",
                                    alignment: "center"
                                },
                                {
                                    text: recordItem.productName,
                                    style: "tableCell",
                                    fontSize: 10
                                },
                                {
                                    text: formatRupiah(recordItem.productPriceFinal),
                                    style: "subheader",
                                    alignment: "right",
                                    fontSize: 10
                                },
                                {
                                    text: formatRupiah(parseFloat(recordItem.productPriceFinal) * parseInt(recordItem.qty)),
                                    style: "subheader",
                                    alignment: "right",
                                    fontSize: 10
                                }
                            ]),
                            [
                                { text: totalQty, style: "tableHeader", alignment: 'center' },
                                { text: "", style: "tableHeader" },
                                { text: "", style: "tableHeader" },
                                { text: "", style: "tableHeader" },
                            ],
                            ...(includePPN
                                ? [
                                    [
                                        { text: "", colSpan: 2, border: [false, false, false, false] },
                                        {},
                                        { text: 'TOTAL', style: "tableHeader" },
                                        { text: formatRupiah(totalKeseluruhan), style: "tableHeader" },
                                    ],
                                    // [
                                    //     { text: "", colSpan: 2, border: [false, false, false, false] },
                                    //     {},
                                    //     { text: 'TAX (11%)', style: "tableHeader" },
                                    //     { text: formatRupiah((totalKeseluruhan * 11) / 100), style: "tableHeader" },
                                    // ],
                                    // [
                                    //     { text: "", colSpan: 2, border: [false, false, false, false] },
                                    //     {},
                                    //     { text: 'GRANDTOTAL', style: "tableHeader" },
                                    //     { text: formatRupiah(totalKeseluruhan + (totalKeseluruhan * 11) / 100), style: "tableHeader" },
                                    // ]
                                ]
                                : [
                                    [
                                        { text: "", colSpan: 2, border: [false, false, false, false] },
                                        {},
                                        { text: 'GRANDTOTAL', style: "tableHeader" },
                                        { text: formatRupiah(totalKeseluruhan), style: "tableHeader" },
                                    ]
                                ])
                        ]
                    },
                    layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => 'gray',
                        vLineColor: () => 'gray',
                    },
                    margin: [30, 0, 30, 0]
                },

                { text: '\n' },

                {
                    stack: [
                        { text: 'NOTE:', bold: true },
                        { ul: notes, style: 'defaultStyle' }
                    ]
                },

                { text: '\n' },

                currentBank && {
                    text: [
                        { text: 'PEMBAYARAN:\n', bold: true },
                        currentBank.detail
                    ],
                    style: 'defaultStyle'
                },

                { text: '\n' },
                { text: `Informasi lebih lanjut hubungi ${nameSales} - ${nomerHp}`, style: 'defaultStyle' },

                { text: '\n' },
                { text: '\n' },

                { text: 'Salam,', style: 'ttd', alignment: 'right' },
                { image: perusahaan === 'PT Pelangi Teknik Indonesia' && logoTTD || perusahaan === 'PT Tsuzumi Japan Technology' && logoTTDTZ, width: 150, alignment: 'right', style: 'gambarlogo' },
                { text: 'Jakarta,', style: 'ttd', alignment: 'right' }
            ],
            styles: {
                atasLogo: { fontSize: 8, marginLeft: 30, marginRight: 30 },
                Blode: { fontSize: 10, bold: true, marginLeft: 30, marginRight: 30 },
                ttd: { fontSize: 10, bold: true, marginLeft: 70, marginRight: 70 },
                productjudul: { fontSize: 10, marginLeft: 70, marginRight: 30, bold: true },
                product: { fontSize: 10, marginLeft: 70 },
                defaultStyle: { fontSize: 10, marginLeft: 30, marginRight: 30 },
                qr: { marginLeft: 30, marginRight: 30, marginTop: 10 },
                gambarlogo: { marginRight: 14 },
                tableHeader: { bold: true, fontSize: 10, color: 'black', fillColor: '#f2f2f2', margin: 5 },
                tableCell: { margin: 5 },
                subheader: { fontSize: 10, margin: 5, alignment: 'center' },
                footerText: { fontSize: 8, italics: true, margin: [0, 0, 0, 10], color: 'gray' }
            },

            footer: function (currentPage, pageCount) {
                return {
                    text: `Halaman ${currentPage} dari ${pageCount}`,
                    alignment: 'right',
                    margin: [0, 0, 40, 20],
                    fontSize: 8,
                    color: 'gray'
                };
            },
        };

        pdfMake.createPdf(docDefinitionv).download(`Surat_Penawaran_${customerName}.pdf`);

        // Update status to "Penawaran" and add log entry
        try {
            // First, update the status to "Penawaran"
            const updateResponse = await fetch('/api/p/salesProgress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: API_KEY
                },
                body: JSON.stringify({
                    id: item.id,
                    salesName: item.salesName || userName,
                    nama: item.nama,
                    alamatLengkap: item.alamatLengkap,
                    alamatKota: item.alamatKota,
                    nomorHp: item.nomorHp,
                    sumber: item.sumber,
                    status: 'Penawaran',
                    statusCatatan: item.statusCatatan || 'Surat Penawaran telah di-download',
                    crosscheck: item.crosscheck || false,
                    fakturPajak: item.fakturPajak || '',
                    nomorInvoice: item.nomorInvoice || '',
                    totalUnit: item.totalUnit || '',
                    totalDeal: item.totalDeal || '',
                    dpp: item.dpp || '',
                    ppn: item.ppn || '',
                    remarks: item.remarks || '',
                    remarksPajak: item.remarksPajak || '',
                    totalPayment: item.totalPayment || '',
                    sisaPayment: item.sisaPayment || '',
                    paymentStatus: item.paymentStatus || '',
                    salesCompany: item.salesCompany || perusahaan,
                    RekeningName: item.RekeningName || '',
                    items: item.items || [],
                    actorName: userName,
                    actorRole: userRole,
                    oldValues: item
                })
            });

            const updateResult = await updateResponse.json();
            if (updateResult.isSuccess) {
                // Refresh data to show updated status
                // fetchData();
                toast.success('Status updated to Penawarkan');
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            salesName: userName || '',
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
            // Payment fields
            totalPayment: '',
            sisaPayment: '',
            paymentStatus: '',
            // Company & Bank fields
            salesCompany: perusahaan,
            RekeningName: '',
            items: [{
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
            }]
        });
        setSelectedRecord(null);
    };

    //Handle Penawaran
    const generateQRCode = async (text) => {
        try {
            return await QRCode.toDataURL(text);
        } catch (err) {
            console.error(err);
            return '';
        }
    };

    // Pagination calculations (using API-based total count)
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Current items from API
    const currentItems = data;


    const statusStyles = {
        'Prospect': '#3B82F6',
        'Follow Up': '#F59E0B',
        'Penawaran': '#8B5CF6',
        'Invoice': '#10B981',
        'Deal': '#EF4444',
        'Cancel': '#6B7280'
    };

    return (
        <div className={styles.container}>
            {/* Header */}
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
                    onClick={() => {
                        resetForm();
                        setModalMode('create');
                        setShowModal(true);
                    }}
                >
                    <FaPlus /> Tambah Data
                </button>
                <button
                    className={styles.btnSignout}
                    onClick={() => {
                        signOut({ callbackUrl: '/' })
                    }}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <div className={styles.searchContainer}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Cari nama, nomor HP, atau brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <button
                    className={styles.filterToggle}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FaFilter /> Filter
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filterGroup}>
                        <label>Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">Semua Status</option>
                            <option value="Prospect">Prospect</option>
                            <option value="Follow Up">Follow Up</option>
                            <option value="Penawaran">Penawaran</option>
                            <option value="Negosiasi">Negosiasi</option>
                            <option value="Invoice">Invoice</option>
                            <option value="Cancel">Cancel</option>
                            {/* <option value="Selasai">Selesai</option> */}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Nama Sales</label>
                        <select
                            value={userRole === 'SPV' ? salesNameFilter : userName}
                            onChange={(e) => setSalesNameFilter(e.target.value)}
                            className={styles.filterSelect}
                            disabled={userRole !== 'SPV'}
                        >
                            <option value="">{userRole === 'SPV' ? 'Semua Sales' : userName}</option>
                            {userRole === 'SPV' && salesNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Status Pembayaran</label>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="">Semua Pembayaran</option>
                            <option value="BELUM_BAYAR">Belum Bayar</option>
                            <option value="DP">DP (Uang Muka)</option>
                            {/* <option value="CICIL">Cicilan</option> */}
                            <option value="LUNAS">Lunas</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className={styles.filterSelect}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className={styles.filterSelect}
                        />
                    </div>
                </div>
            )}

            {/* Totals Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '12px',
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Unit ( Harga OCT )</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#212529' }}>{formatRupiah(totals.totalUnit)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Deal</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#c8302f' }}>{formatRupiah(totals.totalDeal)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>DPP (totalDeal / 1.11
                        )</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#212529' }}>{formatRupiah(totals.dpp)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>PPN (DPP * 11%)</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#212529' }}>{formatRupiah(totals.ppn)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Pembayaran</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>{formatRupiah(totals.totalPayment)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Sisa Pembayaran</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc3545' }}>{formatRupiah(totals.sisaPayment)}</div>
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.tableWrapper}>
                {loading ? (
                    <div className={styles.loading}>Memuat data...</div>
                ) : data.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Tidak ada data</p>
                    </div>
                ) : (
                    <div className={styles.cardList}>
                        {currentItems.map((item) => (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardTitle}>
                                        <h3>{item.nama}</h3>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ backgroundColor: statusStyles[item.status] || '#6B7280' }}
                                        >
                                            {item.status || 'N/A'}
                                        </span>
                                        {item.paymentStatus && (
                                            <span
                                                className={styles.statusBadge}
                                                style={{
                                                    marginLeft: '4px',
                                                    backgroundColor: item.paymentStatus === 'LUNAS' ? '#28a745' :
                                                        item.paymentStatus === 'DP' ? '#f59e0b' :
                                                            item.paymentStatus === 'CICIL' ? '#8b5cf6' : '#6b7280'
                                                }}
                                            >
                                                {item.paymentStatus === 'BELUM_BAYAR' ? 'Belum Bayar' :
                                                    item.paymentStatus === 'DP' ? 'DP' :
                                                        item.paymentStatus === 'CICIL' ? 'Cicilan' :
                                                            item.paymentStatus === 'LUNAS' ? 'Lunas' : item.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.cardHeaderActions}>
                                        <button
                                            className={styles.detailBtn}
                                            onClick={() => {
                                                setDetailData(item);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            <FaEye /> Detail
                                        </button>
                                        <button
                                            className={styles.logBtn}
                                            onClick={() => {
                                                fetchLogs(item.id);
                                            }}
                                        >
                                            <FaEye /> Logs
                                        </button>
                                        <button
                                            className={styles.detailBtn}
                                            onClick={() => openDownloadModal(item)}
                                            style={{ backgroundColor: '#8B5CF6' }}
                                        >
                                            <FaDownload /> Penawaran
                                        </button>
                                        {SPV && (
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <FaTrash /> Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Collapsed view - compact info */}
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
                                        <span className={styles.compactPrice}>Rp {item.totalDeal ? parseFloat(item.totalDeal).toLocaleString('id-ID') : '0'}</span>
                                        <span className={styles.compactLabel}>Dibuat:</span>
                                        <span>{moment(item.createdAt).format('DD MMM YY')}</span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.paginationBtn}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <FaChevronLeft /> Previous
                        </button>
                        <span className={styles.paginationInfo}>
                            Halaman {currentPage} dari {totalPages} ({totalCount} data)
                        </span>
                        <button
                            className={styles.paginationBtn}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{modalMode === 'create' ? 'Tambah Data' : 'Edit Data'}</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            {modalMode === 'create' ? (
                                // Create Mode Form
                                <div className={styles.formGrid}>
                                    {/* Basic Info */}
                                    <div className={styles.formSection}>
                                        <h3>Informasi Dasar</h3>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Nama *</label>
                                                <input
                                                    type="text"
                                                    name="nama"
                                                    value={formData.nama}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Nomor HP *</label>
                                                <input
                                                    type="text"
                                                    name="nomorHp"
                                                    value={formData.nomorHp}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Alamat Kota</label>
                                                <select
                                                    name="alamatKota"
                                                    value={formData.alamatKota}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="">Pilih Provinsi</option>
                                                    {PROVINCES.map((province) => (
                                                        <option key={province} value={province}>
                                                            {province}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Alamat Lengkap</label>
                                                <input
                                                    type="text"
                                                    name="alamatLengkap"
                                                    value={formData.alamatLengkap}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Status *</label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="">Pilih Status</option>
                                                    {['MARKETPLACE SHOPEE', 'MARKETPLACE TOKPED', 'MARKETPLACE BLIBLI'].includes(formData.sumber) ? (
                                                        <option value="Invoice">Invoice</option>
                                                    ) : (
                                                        <>
                                                            <option value="Prospect">Prospect</option>
                                                            <option value="Follow Up">Follow Up</option>
                                                            <option value="Penawaran">Penawaran</option>
                                                            <option value="Cancel">Cancel</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Sumber *</label>
                                                <select
                                                    name="sumber"
                                                    value={formData.sumber}
                                                    onChange={(e) => {
                                                        const newSumber = e.target.value;
                                                        // Auto-set status to Invoice for marketplace sources
                                                        if (['MARKETPLACE SHOPEE', 'MARKETPLACE TOKPED', 'MARKETPLACE BLIBLI'].includes(newSumber)) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                sumber: newSumber,
                                                                status: 'Invoice'
                                                            }));
                                                        } else {
                                                            handleInputChange(e);
                                                        }
                                                    }}
                                                    className={styles.input}
                                                >
                                                    <option value="">Pilih Sumber</option>
                                                    <option value="USAHA SENDIRI">USAHA SENDIRI</option>
                                                    <option value="WALK IN">WALK IN</option>
                                                    <option value="WA TOMMY ADMADIREDJA">WA TOMMY ADMADIREDJA</option>
                                                    <option value="WA FENTI MARLINA">WA FENTI MARLINA</option>
                                                    <option value="WEB PELANGI">WEB PELANGI</option>
                                                    <option value="WEB TSUZUMI/TALK TO">WEB TSUZUMI/TALK TO</option>
                                                    <option value="GRUP SALES PT">GRUP SALES PT</option>
                                                    <option value="INAPROC">INAPROC</option>
                                                    <option value="MARKETPLACE SHOPEE">MARKETPLACE SHOPEE</option>
                                                    <option value="MARKETPLACE TOKPED">MARKETPLACE TOKPED</option>
                                                    <option value="MARKETPLACE BLIBLI">MARKETPLACE BLIBLI</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Catatan Status *</label>
                                                <textarea
                                                    name="statusCatatan"
                                                    value={formData.statusCatatan}
                                                    onChange={handleInputChange}
                                                    className={`${styles.input} ${styles.bigNoteInput}`}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>


                                        {/* Pricing Summary - Read only (auto-calculated from items) */}
                                        <div className={styles.formSection}>
                                            <h3>Total Harga</h3>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label>Total Unit ( Harga OCT )</label>
                                                    <input
                                                        type="text"
                                                        name="totalUnit"
                                                        value={formatRupiah(formData.totalUnit)}
                                                        readOnly
                                                        className={styles.input}
                                                        style={{ backgroundColor: '#f5f5f5' }}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Total Deal</label>
                                                    <input
                                                        type="text"
                                                        name="totalDeal"
                                                        value={formatRupiah(formData.totalDeal)}
                                                        readOnly
                                                        className={styles.input}
                                                        style={{ backgroundColor: '#f5f5f5' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label>DPP (Total Deal / 1.11)</label>
                                                    <input
                                                        type="text"
                                                        name="dpp"
                                                        value={formatRupiahRounded(formData.totalDeal / 1.11)}
                                                        readOnly
                                                        className={styles.input}
                                                        style={{ backgroundColor: '#f5f5f5' }}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>PPN (DPP × 11%)</label>
                                                    <input
                                                        type="text"
                                                        name="ppn"
                                                        value={formatRupiahRounded((formData.totalDeal / 1.11) * 0.11)}
                                                        readOnly
                                                        className={styles.input}
                                                        style={{ backgroundColor: '#f5f5f5' }}
                                                    />
                                                </div>
                                            </div>
                                            {/* DPP & PPN hidden - auto-calculated on save: DPP = totalDeal/1.11, PPN = DPP*11% */}
                                        </div>

                                        {/* Payment Section */}
                                        {(formData.status === 'Invoice' || formData.status === 'Deal') && (
                                            <div className={styles.formSection}>

                                                <h3>Pembayaran</h3>
                                                <div className={styles.formRow}>
                                                    <div className={styles.formGroup}>
                                                        <label>Status Pembayaran</label>
                                                        <select
                                                            name="paymentStatus"
                                                            value={formData.paymentStatus || ''}
                                                            onChange={handleInputChange}
                                                            className={styles.input}
                                                        >
                                                            <option value="">Pilih Status</option>
                                                            <option value="BELUM_BAYAR">Belum Bayar</option>
                                                            <option value="DP">DP (Uang Muka)</option>
                                                            {/* <option value="CICIL">Cicilan</option> */}
                                                            <option value="LUNAS">Lunas</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className={styles.formRow}>

                                                    <div className={styles.formGroup}>
                                                        <label>Nomor Invoice</label>
                                                        <input
                                                            type="text"
                                                            name="nomorInvoice"
                                                            value={formData.nomorInvoice}
                                                            onChange={handleInputChange}
                                                            className={styles.input}
                                                            placeholder="INV/001/2024"
                                                        />
                                                    </div>


                                                    <div className={styles.formGroup}>
                                                        <label>Rekening</label>
                                                        <select
                                                            name="RekeningName"
                                                            value={formData.RekeningName || ''}
                                                            onChange={handleInputChange}
                                                            className={styles.input}
                                                        >
                                                            <option value="">Pilih Rekening</option>
                                                            <option value="PT PELANGI TEKNIK INDONESIA">PT PELANGI TEKNIK INDONESIA</option>
                                                            <option value="PT TSUZUMI JAPAN TECHNOLOGY">PT TSUZUMI JAPAN TECHNOLOGY</option>
                                                            <option value="Rekening Fenti Marlina">Rekening Fenti Marlina</option>
                                                            <option value="Rekening Tommy Admadiredja">Rekening Tommy Admadiredja</option>
                                                            <option value="Web Pelangi Teknik">Web Pelangi Teknik</option>
                                                            <option value="Web TsuzumiJapan">Web TsuzumiJapan</option>
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
                                                                // Jika total pembayaran sama dengan total deal, sisa = 0
                                                                const sisaPayment = totalPayment >= totalDeal ? 0 : totalDeal - totalPayment;
                                                                handleInputChange({ target: { name: 'totalPayment', value: rawValue, type: 'text' } });
                                                                handleInputChange({ target: { name: 'sisaPayment', value: sisaPayment.toString(), type: 'text' } });
                                                            }}
                                                            placeholder="Rp 0"
                                                            className={styles.input}
                                                        />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Sisa Pembayaran (Auto)</label>
                                                        <input
                                                            type="text"
                                                            name="sisaPayment"
                                                            value={formatRupiah(Math.max(0, (parseFloat(formData.totalDeal) || 0) - (parseFloat(formData.totalPayment) || 0)))}
                                                            readOnly
                                                            className={styles.input}
                                                            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}


                                    </div>

                                    {/* Product Info */}
                                    <div className={styles.formSection}>
                                        <h3>Informasi Produk</h3>
                                        {formData.items?.map((item, index) => (
                                            <div key={index} className={styles.itemSection}>
                                                <div className={styles.formRow}>
                                                    <div className={styles.formGroup}>
                                                        <label>Brand</label>
                                                        <select
                                                            value={item.brand || ''}
                                                            onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                                                            className={styles.input}
                                                        >
                                                            <option value="">Pilih Brand</option>
                                                            <option value="TSUZUMI">TSUZUMI</option>
                                                            <option value="CHAMPIONS">CHAMPIONS</option>
                                                            <option value="MONTOYA">MONTOYA</option>
                                                            <option value="ISUZU">ISUZU</option>
                                                            <option value="FAW-VW">FAW-VW</option>
                                                            <option value="HIDEMITSU">HIDEMITSU</option>
                                                            <option value="PRODUK LOCAL">PRODUK LOCAL</option>
                                                            <option value="DLL">DLL</option>
                                                        </select>
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Nama Barang</label>
                                                        <input
                                                            type="text"
                                                            value={item.namaBarang || ''}
                                                            onChange={(e) => handleItemChange(index, 'namaBarang', e.target.value)}
                                                            className={styles.input}
                                                        />
                                                    </div>
                                                </div>

                                                <div className={styles.formRow}>
                                                    <div className={styles.formGroup}>
                                                        <label>Kode Barang (<Link style={{
                                                            textDecoration: 'underline',
                                                        }} href={'https://docs.google.com/spreadsheets/d/1jNHhULbGyAQrReeckyEmMb6VNWMme7xvwUQDYlf6ffQ/edit?gid=0#gid=0'} target="_blank" rel="noopener noreferrer">
                                                            klik disini
                                                        </Link>)</label>
                                                        <input
                                                            type="text"
                                                            value={item.kodeBarang || ''}
                                                            onChange={(e) => handleItemChange(index, 'kodeBarang', e.target.value)}
                                                            className={styles.input}
                                                        />
                                                    </div>
                                                    <div className={styles.formGroup}>
                                                        <label>Kategori</label>
                                                        <select
                                                            value={item.kategoriBarang || 'unit'}
                                                            onChange={(e) => handleItemChange(index, 'kategoriBarang', e.target.value)}
                                                            className={styles.input}
                                                        >
                                                            <option value="unit">Unit</option>
                                                            <option value="sparepart">Sparepart</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className={styles.formRow}>
                                                    <div className={styles.formGroup}>
                                                        <label>Qty</label>
                                                        <input
                                                            type="number"
                                                            value={item.qty}
                                                            onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))}
                                                            className={styles.input}
                                                        />
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
                                                                handleItemChange(index, 'hargaUnit', rawValue);
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
                                                                handleItemChange(index, 'hargaDeal', rawValue);
                                                            }}
                                                            placeholder="Rp 0"
                                                            className={styles.input}
                                                        />
                                                    </div>
                                                </div>

                                                {
                                                    formData.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className={styles.btnRemoveItem}
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            Hapus Item
                                                        </button>
                                                    )
                                                }
                                            </div>
                                        ))}
                                        {modalMode === 'create' && (
                                            <button
                                                type="button"
                                                className={styles.btnAddItem}
                                                onClick={addItem}
                                            >
                                                + Tambah Produk
                                            </button>
                                        )}
                                    </div>




                                    {/* Catatan fields hidden - remarks & remarksPajak auto-saved */}
                                </div>
                            ) : (
                                // Edit Mode Form
                                <div className={styles.formGrid}>
                                    {/* Basic Info - Read Only */}
                                    <div className={styles.formSection}>
                                        <h3>Informasi Dasar</h3>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Nama</label>
                                                <input
                                                    type="text"
                                                    value={formData.nama}
                                                    readOnly
                                                    className={`${styles.input}`}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Sales Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.salesName || '-'}
                                                    readOnly
                                                    className={`${styles.input}`}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Nomor HP</label>
                                                <input
                                                    type="text"
                                                    value={formData.nomorHp || '-'}
                                                    readOnly
                                                    className={`${styles.input}`}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Alamat Kota</label>
                                                <select
                                                    name="alamatKota"
                                                    value={formData.alamatKota || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="">Pilih Provinsi</option>
                                                    {PROVINCES.map((province) => (
                                                        <option key={province} value={province}>
                                                            {province}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Alamat Lengkap</label>
                                                <input
                                                    type="text"
                                                    name="alamatLengkap"
                                                    value={formData.alamatLengkap || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Status</label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="">Pilih Status</option>
                                                    <option value="Prospect">Prospect</option>
                                                    <option value="Follow Up">Follow Up</option>
                                                    <option value="Penawaran">Penawaran</option>
                                                    <option value="Negosiasi">Negosiasi</option>
                                                    <option value="Invoice">Invoice</option>
                                                    <option value="Cancel">Cancel</option>
                                                    {/* <option value="Selasai">Selesai</option> */}
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Sumber</label>
                                                <input
                                                    type="text"
                                                    value={formData.sumber || '-'}
                                                    readOnly
                                                    className={`${styles.input}`}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Status Catatan</label>
                                                <textarea
                                                    name="statusCatatan"
                                                    value={formData.statusCatatan}
                                                    onChange={handleInputChange}
                                                    className={`${styles.input} ${styles.bigNoteInput}`}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Product Review - Editable items in edit mode for Negosiasi & Invoice */}
                                    {(formData.status === 'Negosiasi' || formData.status === 'Invoice') && formData.items && formData.items.length > 0 && (
                                        <div className={styles.formSection}>
                                            <h3>Produk ({formData.items.length} item)</h3>
                                            {formData.items.map((item, index) => (
                                                <div key={index} className={styles.itemSection}>
                                                    <div className={styles.formRow}>
                                                        <div className={styles.formGroup}>
                                                            <label>Brand</label>
                                                            <select
                                                                value={item.brand || ''}
                                                                onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                                                                className={styles.input}
                                                            >
                                                                <option value="">Pilih Brand</option>
                                                                <option value="TSUZUMI">TSUZUMI</option>
                                                                <option value="CHAMPIONS">CHAMPIONS</option>
                                                                <option value="MONTOYA">MONTOYA</option>
                                                                <option value="ISUZU">ISUZU</option>
                                                                <option value="FAW-VW">FAW-VW</option>
                                                                <option value="HIDEMITSU">HIDEMITSU</option>
                                                                <option value="PRODUK LOCAL">PRODUK LOCAL</option>
                                                                <option value="DLL">DLL</option>
                                                            </select>
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <label>Nama Barang</label>
                                                            <input
                                                                type="text"
                                                                value={item.namaBarang || ''}
                                                                onChange={(e) => handleItemChange(index, 'namaBarang', e.target.value)}
                                                                className={styles.input}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className={styles.formRow}>
                                                        <div className={styles.formGroup}>
                                                            <label>Kode Barang (<Link style={{
                                                                textDecoration: 'underline',
                                                            }} href={'https://docs.google.com/spreadsheets/d/1jNHhULbGyAQrReeckyEmMb6VNWMme7xvwUQDYlf6ffQ/edit?gid=0#gid=0'} target="_blank" rel="noopener noreferrer">
                                                                klik disini
                                                            </Link>)</label>
                                                            <input
                                                                type="text"
                                                                value={item.kodeBarang || ''}
                                                                onChange={(e) => handleItemChange(index, 'kodeBarang', e.target.value)}
                                                                className={styles.input}
                                                            />
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <label>Kategori</label>
                                                            <select
                                                                value={item.kategoriBarang || 'unit'}
                                                                onChange={(e) => handleItemChange(index, 'kategoriBarang', e.target.value)}
                                                                className={styles.input}
                                                            >
                                                                <option value="unit">Unit</option>
                                                                <option value="sparepart">Sparepart</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className={styles.formRow}>
                                                        <div className={styles.formGroup}>
                                                            <label>Qty</label>
                                                            <input
                                                                type="number"
                                                                value={item.qty || 1}
                                                                onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value))}
                                                                className={styles.input}
                                                            />
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
                                                                    handleItemChange(index, 'hargaUnit', rawValue);
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
                                                                    handleItemChange(index, 'hargaDeal', rawValue);
                                                                }}
                                                                placeholder="Rp 0"
                                                                className={styles.input}
                                                            />
                                                        </div>
                                                    </div>

                                                    {formData.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className={styles.btnRemoveItem}
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            Hapus Item
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className={styles.btnAddItem}
                                                onClick={addItem}
                                            >
                                                + Tambah Produk
                                            </button>
                                        </div>
                                    )}

                                    {/* Product Review - Read only for other statuses */}
                                    {!(formData.status === 'Negosiasi' || formData.status === 'Invoice') && formData.items && formData.items.length > 0 && (
                                        <div className={styles.formSection}>
                                            <h3>Produk ({formData.items.length} item)</h3>
                                            <div className={styles.productReview}>
                                                {formData.items.slice(0, 5).map((item, index) => (
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
                                                {formData.items.length > 5 && (
                                                    <div className={styles.productReviewMore}>
                                                        +{formData.items.length - 5} produk lainnya
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total Harga Section */}
                                    <div className={styles.formSection}>
                                        <h3>Total Harga</h3>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Total Unit ( Harga OCT )</label>
                                                <input
                                                    type="text"
                                                    name="totalUnit"
                                                    value={formatRupiah(formData.totalUnit)}
                                                    readOnly
                                                    className={styles.input}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Total Deal</label>
                                                <input
                                                    type="text"
                                                    name="totalDeal"
                                                    value={formatRupiah(formData.totalDeal)}
                                                    readOnly
                                                    className={styles.input}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>DPP (Total Deal / 1.11)</label>
                                                <input
                                                    type="text"
                                                    name="dpp"
                                                    value={formatRupiahRounded(formData.totalDeal / 1.11)}
                                                    readOnly
                                                    className={styles.input}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>PPN (DPP × 11%)</label>
                                                <input
                                                    type="text"
                                                    name="ppn"
                                                    value={formatRupiahRounded((formData.totalDeal / 1.11) * 0.11)}
                                                    readOnly
                                                    className={styles.input}
                                                    style={{ backgroundColor: '#f5f5f5' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {formData.status === 'Invoice' && (
                                        <div className={styles.formSection}>
                                            <h3>Invoice & Pembayaran</h3>

                                            <div className={styles.formGroup}>
                                                <label>Status Pembayaran</label>
                                                <select
                                                    name="paymentStatus"
                                                    value={formData.paymentStatus || ''}
                                                    onChange={handleInputChange}
                                                    className={styles.input}
                                                >
                                                    <option value="">Pilih Status</option>
                                                    <option value="BELUM_BAYAR">Belum Bayar</option>
                                                    <option value="DP">DP (Uang Muka)</option>
                                                    {/* <option value="CICIL">Cicilan</option> */}
                                                    <option value="LUNAS">Lunas</option>
                                                </select>
                                            </div>
                                            <div className={styles.formRow}>
                                                <div className={styles.formGroup}>
                                                    <label>Nomor Invoice</label>
                                                    <input
                                                        type="text"
                                                        name="nomorInvoice"
                                                        value={formData.nomorInvoice}
                                                        onChange={handleInputChange}
                                                        className={styles.input}
                                                        placeholder="INV/001/2024"
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Rekening</label>
                                                    <select
                                                        name="RekeningName"
                                                        value={formData.RekeningName || ''}
                                                        onChange={handleInputChange}
                                                        className={styles.input}
                                                    >
                                                        <option value="">Pilih Rekening</option>
                                                        <option value="PT PELANGI TEKNIK INDONESIA">PT PELANGI TEKNIK INDONESIA</option>
                                                        <option value="PT TSUZUMI JAPAN TECHNOLOGY">PT TSUZUMI JAPAN TECHNOLOGY</option>
                                                        <option value="Rekening Fenti Marlina">Rekening Fenti Marlina</option>
                                                        <option value="Rekening Tommy Admadiredja">Rekening Tommy Admadiredja</option>
                                                        <option value="Web Pelangi Teknik">Web Pelangi Teknik</option>
                                                        <option value="Web TsuzumiJapan">Web TsuzumiJapan</option>
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
                                                            // Jika total pembayaran sama dengan total deal, sisa = 0
                                                            const sisaPayment = totalPayment >= totalDeal ? 0 : totalDeal - totalPayment;
                                                            handleInputChange({ target: { name: 'totalPayment', value: rawValue, type: 'text' } });
                                                            handleInputChange({ target: { name: 'sisaPayment', value: sisaPayment.toString(), type: 'text' } });
                                                        }}
                                                        placeholder="Rp 0"
                                                        className={styles.input}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Sisa Pembayaran (Auto)</label>
                                                    <input
                                                        type="text"
                                                        name="sisaPayment"
                                                        value={formatRupiah(Math.max(0, (parseFloat(formData.totalDeal) || 0) - (parseFloat(formData.totalPayment) || 0)))}
                                                        readOnly
                                                        className={styles.input}
                                                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Catatan fields hidden - remarks & remarksPajak auto-saved */}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.btnCancel}
                                onClick={() => setShowModal(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </button>
                            <button
                                className={styles.btnSave}
                                onClick={handleSave}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Menyimpan...' : (modalMode === 'create' ? 'Tambah Data' : 'Update Data')}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Logs Modal */}
            {
                showLogs && (
                    <div className={styles.modalOverlay} onClick={() => setShowLogs(false)}>
                        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Riwayat Perubahan</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowLogs(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className={styles.modalContent}>
                                {logsData.length === 0 ? (
                                    <div className={styles.empty}>Tidak ada riwayat</div>
                                ) : (
                                    <div className={styles.logsList}>
                                        {logsData.map((log) => (
                                            <div key={log.id} className={styles.logItem}>
                                                <div className={styles.logTime}>
                                                    {moment(log.createdAt).format('DD MMM YYYY HH:mm')}
                                                </div>
                                                <div className={styles.logContent}>
                                                    <div className={styles.logActor}>
                                                        <strong>{log.actorName || 'System'}</strong>
                                                        {log.actorRole && <span className={styles.logRole}>{log.actorRole}</span>}
                                                    </div>
                                                    <p className={styles.logAction}>{log.action}</p>
                                                    {(log.oldValue != null || log.newValue != null) && (
                                                        log.oldValue?.startsWith('[') && log.newValue?.startsWith('[') ? (
                                                            <div className={styles.logNote}>
                                                                {(() => {
                                                                    try {
                                                                        const oldItems = JSON.parse(log.oldValue);
                                                                        const newItems = JSON.parse(log.newValue);

                                                                        const getOldItems = Array.isArray(oldItems)
                                                                            ? oldItems
                                                                            : (oldItems.items || []);

                                                                        const getNewItems = Array.isArray(newItems)
                                                                            ? newItems
                                                                            : (newItems.items || []);

                                                                        const renderItemsList = (items, isNew) => (
                                                                            <table
                                                                                style={{
                                                                                    width: '100%',
                                                                                    fontSize: '11px',
                                                                                    borderCollapse: 'collapse',
                                                                                    backgroundColor: isNew ? '#e8f5e9' : '#f5f5f5',
                                                                                    borderRadius: '4px',
                                                                                    overflow: 'hidden'
                                                                                }}
                                                                            >
                                                                                <thead>
                                                                                    <tr
                                                                                        style={{
                                                                                            backgroundColor: isNew ? '#c8e6c9' : '#e0e0e0',
                                                                                            textAlign: 'left'
                                                                                        }}
                                                                                    >
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Brand
                                                                                        </th>
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Nama
                                                                                        </th>
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Kode
                                                                                        </th>
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Kat
                                                                                        </th>
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Qty
                                                                                        </th>
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Harga Unit
                                                                                        </th>
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Harga Deal
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>

                                                                                <tbody>
                                                                                    {items.map((item, idx) => (
                                                                                        <tr key={idx}>
                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.brand || '-'}
                                                                                            </td>

                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.namaBarang || '-'}
                                                                                            </td>

                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.kodeBarang || '-'}
                                                                                            </td>

                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.kategoriBarang === 'sparepart' ? 'S' : 'U'}
                                                                                            </td>

                                                                                            <td
                                                                                                style={{
                                                                                                    padding: '6px',
                                                                                                    border: '1px solid #ddd',
                                                                                                    textAlign: 'center'
                                                                                                }}
                                                                                            >
                                                                                                {item.qty || 0}
                                                                                            </td>

                                                                                            <td
                                                                                                style={{
                                                                                                    padding: '6px',
                                                                                                    border: '1px solid #ddd',
                                                                                                    textAlign: 'right'
                                                                                                }}
                                                                                            >
                                                                                                {item.hargaUnit
                                                                                                    ? formatRupiah(item.hargaUnit)
                                                                                                    : '-'}
                                                                                            </td>

                                                                                            <td
                                                                                                style={{
                                                                                                    padding: '6px',
                                                                                                    border: '1px solid #ddd',
                                                                                                    textAlign: 'right',
                                                                                                    fontWeight: 'bold'
                                                                                                }}
                                                                                            >
                                                                                                {item.hargaDeal
                                                                                                    ? formatRupiah(item.hargaDeal)
                                                                                                    : '-'}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        );

                                                                        return (
                                                                            <>
                                                                                <div
                                                                                    style={{
                                                                                        marginBottom: '4px',
                                                                                        marginTop: '8px'
                                                                                    }}
                                                                                >
                                                                                    <strong>Item Lama:</strong>
                                                                                </div>

                                                                                {renderItemsList(getOldItems, false)}

                                                                                <div
                                                                                    style={{
                                                                                        marginBottom: '4px',
                                                                                        marginTop: '8px'
                                                                                    }}
                                                                                >
                                                                                    <strong>Item Baru:</strong>
                                                                                </div>

                                                                                {renderItemsList(getNewItems, true)}
                                                                            </>
                                                                        );
                                                                    } catch (e) {
                                                                        return (
                                                                            <p className={styles.logChange}>
                                                                                {log.oldValue != null
                                                                                    ? (
                                                                                        isNaN(parseFloat(log.oldValue))
                                                                                            ? log.oldValue
                                                                                            : formatRupiah(log.oldValue)
                                                                                    )
                                                                                    : '-'
                                                                                }

                                                                                {' → '}

                                                                                {log.newValue != null
                                                                                    ? (
                                                                                        isNaN(parseFloat(log.newValue))
                                                                                            ? log.newValue
                                                                                            : formatRupiah(log.newValue)
                                                                                    )
                                                                                    : '-'
                                                                                }
                                                                            </p>
                                                                        );
                                                                    }
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <p className={styles.logChange}>
                                                                {log.oldValue != null
                                                                    ? (
                                                                        isNaN(parseFloat(log.oldValue))
                                                                            ? log.oldValue
                                                                            : formatRupiah(log.oldValue)
                                                                    )
                                                                    : '-'
                                                                }

                                                                {' → '}

                                                                {log.newValue != null
                                                                    ? (
                                                                        isNaN(parseFloat(log.newValue))
                                                                            ? log.newValue
                                                                            : formatRupiah(log.newValue)
                                                                    )
                                                                    : '-'
                                                                }
                                                            </p>
                                                        )
                                                    )}

                                                    {log.note && (
                                                        log.note.includes('→') && log.note.startsWith('[') ? (
                                                            <div className={styles.logNote}>
                                                                {(() => {
                                                                    try {
                                                                        const arrowIndex = log.note.indexOf('→');

                                                                        const oldPart = log.note
                                                                            .substring(0, arrowIndex)
                                                                            .trim();

                                                                        const newPart = log.note
                                                                            .substring(arrowIndex + 1)
                                                                            .trim();

                                                                        const oldItems = JSON.parse(oldPart);
                                                                        const newItems = JSON.parse(newPart);

                                                                        const getItems = Array.isArray(oldItems)
                                                                            ? oldItems
                                                                            : (oldItems.items || []);

                                                                        const getNewItems = Array.isArray(newItems)
                                                                            ? newItems
                                                                            : (newItems.items || []);

                                                                        const renderItemsList = (items, isNew) => (
                                                                            <table
                                                                                style={{
                                                                                    width: '100%',
                                                                                    fontSize: '11px',
                                                                                    borderCollapse: 'collapse',
                                                                                    backgroundColor: isNew ? '#e8f5e9' : '#f5f5f5',
                                                                                    borderRadius: '4px',
                                                                                    overflow: 'hidden'
                                                                                }}
                                                                            >
                                                                                <thead>
                                                                                    <tr
                                                                                        style={{
                                                                                            backgroundColor: isNew ? '#c8e6c9' : '#e0e0e0',
                                                                                            textAlign: 'left'
                                                                                        }}
                                                                                    >
                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Brand
                                                                                        </th>

                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Nama
                                                                                        </th>

                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Kode
                                                                                        </th>

                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Kat
                                                                                        </th>

                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Qty
                                                                                        </th>

                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Harga Unit
                                                                                        </th>

                                                                                        <th style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                            Harga Deal
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>

                                                                                <tbody>
                                                                                    {items.map((item, idx) => (
                                                                                        <tr key={idx}>
                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.brand || '-'}
                                                                                            </td>

                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.namaBarang || '-'}
                                                                                            </td>

                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.kodeBarang || '-'}
                                                                                            </td>

                                                                                            <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                                                                                {item.kategoriBarang === 'sparepart' ? 'S' : 'U'}
                                                                                            </td>

                                                                                            <td
                                                                                                style={{
                                                                                                    padding: '6px',
                                                                                                    border: '1px solid #ddd',
                                                                                                    textAlign: 'center'
                                                                                                }}
                                                                                            >
                                                                                                {item.qty || 0}
                                                                                            </td>

                                                                                            <td
                                                                                                style={{
                                                                                                    padding: '6px',
                                                                                                    border: '1px solid #ddd',
                                                                                                    textAlign: 'right'
                                                                                                }}
                                                                                            >
                                                                                                {item.hargaUnit
                                                                                                    ? formatRupiah(item.hargaUnit)
                                                                                                    : '-'}
                                                                                            </td>

                                                                                            <td
                                                                                                style={{
                                                                                                    padding: '6px',
                                                                                                    border: '1px solid #ddd',
                                                                                                    textAlign: 'right',
                                                                                                    fontWeight: 'bold'
                                                                                                }}
                                                                                            >
                                                                                                {item.hargaDeal
                                                                                                    ? formatRupiah(item.hargaDeal)
                                                                                                    : '-'}
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        );

                                                                        return (
                                                                            <>
                                                                                <div
                                                                                    style={{
                                                                                        marginBottom: '4px',
                                                                                        marginTop: '8px'
                                                                                    }}
                                                                                >
                                                                                    <strong>Item Lama:</strong>
                                                                                </div>

                                                                                {renderItemsList(getItems, false)}

                                                                                <div
                                                                                    style={{
                                                                                        marginBottom: '4px',
                                                                                        marginTop: '8px'
                                                                                    }}
                                                                                >
                                                                                    <strong>Item Baru:</strong>
                                                                                </div>

                                                                                {renderItemsList(getNewItems, true)}
                                                                            </>
                                                                        );
                                                                    } catch (e) {
                                                                        console.error('Error parsing log note:', e);

                                                                        return (
                                                                            <p style={{ whiteSpace: 'pre-wrap' }}>
                                                                                {log.note}
                                                                            </p>
                                                                        );
                                                                    }
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <p className={styles.logNote}>
                                                                {log.note}
                                                            </p>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.btnCancel}
                                    onClick={() => setShowLogs(false)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Detail Modal */}
            {
                showDetailModal && detailData && (
                    <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Detail Data</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    ✕
                                </button>
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
                                            <p><strong>Status:</strong> <span className={styles.statusBadge} style={{ backgroundColor: statusStyles[detailData.status] || '#6B7280' }}>{detailData.status || '-'}</span></p>
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
                                                        <p><strong>Harga Unit:</strong> {itemProduct.hargaUnit ? ('Rp ' + parseFloat(itemProduct.hargaUnit).toLocaleString('id-ID')) : '-'}</p>
                                                        <p><strong>Harga Deal:</strong> {itemProduct.hargaDeal ? ('Rp ' + parseFloat(itemProduct.hargaDeal).toLocaleString('id-ID')) : '-'}</p>
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
                                            <p><strong>Total Unit ( Harga OCT ):</strong> Rp {detailData.totalUnit ? parseFloat(detailData.totalUnit).toLocaleString('id-ID') : '0'}</p>
                                            <p><strong>Total Deal:</strong> <span style={{ color: '#c8302f', fontWeight: 'bold' }}>Rp {detailData.totalDeal ? parseFloat(detailData.totalDeal).toLocaleString('id-ID') : '0'}</span></p>
                                        </div>
                                        <div>
                                            <p><strong>DPP:</strong> Rp {detailData.dpp ? parseFloat(detailData.dpp).toLocaleString('id-ID') : '0'}</p>
                                            <p><strong>PPN:</strong> Rp {detailData.ppn ? parseFloat(detailData.ppn).toLocaleString('id-ID') : '0'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Informasi Lain (Invoice, Pajak, Catatan, Tanggal) */}
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
                                            <p><strong>Dibuat:</strong> {detailData.createdAt ? moment(detailData.createdAt).format('DD MMMM YYYY HH:mm') : '-'}</p>
                                            <p><strong>Diupdate:</strong> {detailData.updatedAt ? moment(detailData.updatedAt).format('DD MMMM YYYY HH:mm') : '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        handleEdit(detailData);
                                    }}
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button
                                    className={styles.btnCancel}
                                    onClick={() => setShowDetailModal(false)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Download Penawaran Modal */}
            {
                showDownloadModal && selectedDownloadItem && (
                    <div className={styles.modalOverlay} onClick={() => setShowDownloadModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Download Penawaran</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowDownloadModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className={styles.modalContent}>
                                {/* Bank Selection */}
                                <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Pilih Bank</label>
                                    <select
                                        value={selectedBank?.nama || ''}
                                        onChange={(e) => {
                                            const bank = bankList.find(b => b.nama === e.target.value);
                                            setSelectedBank(bank);
                                        }}
                                        className={styles.input}
                                        style={{ width: '100%', padding: '10px' }}
                                    >
                                        {bankList.map((bank, index) => (
                                            <option key={index} value={bank.nama}>
                                                {bank.nama}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Notes Section */}
                                <div style={{ marginBottom: '10px' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Catatan</label>
                                    {downloadNotes.map((note, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                            <input
                                                type="text"
                                                value={note}
                                                onChange={(e) => updateDownloadNote(index, e.target.value)}
                                                className={styles.input}
                                                style={{ flex: 1, padding: '8px' }}
                                                placeholder="Masukkan catatan..."
                                            />
                                            <button
                                                onClick={() => removeDownloadNote(index)}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addDownloadNote}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#10B981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginTop: '5px'
                                        }}
                                    >
                                        + Tambah Catatan
                                    </button>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    className={styles.btnEdit}
                                    onClick={() => {
                                        handleDownloadPenawaran(selectedDownloadItem);
                                        setShowDownloadModal(false);
                                    }}
                                    style={{ backgroundColor: '#8B5CF6' }}
                                >
                                    <FaDownload /> Download
                                </button>
                                <button
                                    className={styles.btnCancel}
                                    onClick={() => setShowDownloadModal(false)}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
