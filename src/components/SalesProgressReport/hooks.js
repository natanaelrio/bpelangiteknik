import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { buildQueryParams, getUniqueSalesNames } from './utils';
import { DEFAULT_FORM_DATA, ITEMS_PER_PAGE } from './constants';

// Hook for fetching sales progress data
export const useSalesProgressData = (API_KEY) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [totals, setTotals] = useState({ totalUnit: 0, totalDeal: 0, dpp: 0, ppn: 0, totalPayment: 0, sisaPayment: 0 });

    const fetchData = useCallback(async (filters) => {
        try {
            setLoading(true);
            const queryParams = buildQueryParams({ ...filters, itemsPerPage: ITEMS_PER_PAGE });
            const response = await fetch(`/api/get/salesProgress?${queryParams}`, {
                headers: { authorization: API_KEY }
            });
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
    }, [API_KEY]);

    return { data, loading, totalCount, totals, fetchData };
};

// Hook for fetching sales names
export const useSalesNames = (API_KEY) => {
    const [salesNames, setSalesNames] = useState([]);

    const fetchSalesNames = useCallback(async () => {
        try {
            const response = await fetch('/api/get/salesProgress?limit=1000', {
                headers: { authorization: API_KEY }
            });
            const result = await response.json();
            if (result.isSuccess) {
                setSalesNames(getUniqueSalesNames(result.data));
            }
        } catch (error) {
            console.error('Error fetching sales names:', error);
        }
    }, [API_KEY]);

    return { salesNames, fetchSalesNames };
};

// Hook for fetching logs
export const useSalesLogs = (API_KEY) => {
    const [logsData, setLogsData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = useCallback(async (salesProgressId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/get/salesLog?salesProgressId=${salesProgressId}&limit=100`, {
                headers: { authorization: API_KEY }
            });
            const result = await response.json();
            if (result.isSuccess) {
                setLogsData(result.data || []);
            }
        } catch (error) {
            toast.error('Gagal memuat logs');
        } finally {
            setLoading(false);
        }
    }, [API_KEY]);

    const clearLogs = useCallback(() => {
        setLogsData([]);
    }, []);

    return { logsData, loading, fetchLogs, clearLogs };
};

// Hook for form handling
export const useSalesForm = (userName, perusahaan) => {
    const [formData, setFormData] = useState(() => DEFAULT_FORM_DATA(userName, perusahaan));
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [modalMode, setModalMode] = useState('create');

    const resetForm = useCallback(() => {
        setFormData(DEFAULT_FORM_DATA(userName, perusahaan));
        setSelectedRecord(null);
    }, [userName, perusahaan]);

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

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const populateFormForEdit = (record) => {
        setSelectedRecord(record);
        setFormData({
            id: record.id,
            salesName: userName || '',
            nama: record.nama || '',
            alamatLengkap: record.alamatLengkap || '',
            alamatKota: record.alamatKota || '',
            nomorHp: record.nomorHp || '',
            sumber: record.sumber || '',
            status: record.status || 'Prospect',
            statusCatatan: '',
            crosscheck: record.crosscheck || false,
            fakturPajak: record.fakturPajak || '',
            nomorInvoice: record.nomorInvoice || '',
            totalUnit: record.totalUnit || '',
            totalDeal: record.totalDeal || '',
            dpp: record.dpp || '',
            ppn: record.ppn || '',
            remarks: record.remarks || '',
            remarksPajak: record.remarksPajak || '',
            totalPayment: record.totalPayment || '',
            sisaPayment: record.sisaPayment || '',
            paymentStatus: record.paymentStatus || '',
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
    };

    return {
        formData,
        setFormData,
        selectedRecord,
        setSelectedRecord,
        modalMode,
        setModalMode,
        resetForm,
        handleInputChange,
        handleItemChange,
        addItem,
        removeItem,
        populateFormForEdit
    };
};

// Hook for filter state
export const useSalesFilters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [salesNameFilter, setSalesNameFilter] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    return {
        searchTerm,
        setSearchTerm,
        debouncedSearch,
        statusFilter,
        setStatusFilter,
        salesNameFilter,
        setSalesNameFilter,
        paymentStatusFilter,
        setPaymentStatusFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        showFilters,
        setShowFilters,
        currentPage,
        setCurrentPage
    };
};

// Hook for save operations
export const useSalesSave = (API_KEY, userName, userRole) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (formData) => {
        if (!formData.nama) {
            toast.error('Nama wajib diisi');
            return false;
        }
        if (!formData.nomorHp) {
            toast.error('Nomor HP wajib diisi');
            return false;
        }
        if (!formData.sumber) {
            toast.error('Sumber wajib diisi');
            return false;
        }
        if (!formData.status) {
            toast.error('Status wajib diisi');
            return false;
        }
        if (!formData.statusCatatan) {
            toast.error('Catatan Catatan wajib diisi');
            return false;
        }

        if (!formData.items || formData.items.length === 0) {
            toast.error('Produk wajib diisi');
            return false;
        }

        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            const itemNum = i + 1;

            if (!item.brand) {
                toast.error(`Produk ${itemNum}: Brand wajib dipilih`);
                return false;
            }
            if (!item.namaBarang) {
                toast.error(`Produk ${itemNum}: Nama Barang wajib diisi`);
                return false;
            }
            if (!item.kategoriBarang) {
                toast.error(`Produk ${itemNum}: Kategori wajib dipilih`);
                return false;
            }
            if (!item.qty || item.qty <= 0) {
                toast.error(`Produk ${itemNum}: Qty wajib diisi dan minimal 1`);
                return false;
            }
            if (!item.hargaUnit || parseFloat(item.hargaUnit) <= 0) {
                toast.error(`Produk ${itemNum}: Harga OCT (Rp) wajib diisi`);
                return false;
            }
            if (!item.hargaDeal || parseFloat(item.hargaDeal) <= 0) {
                toast.error(`Produk ${itemNum}: Harga Deal (Rp) wajib diisi`);
                return false;
            }
        }

        if (formData.status === 'Invoice') {
            if (!formData.paymentStatus) {
                toast.error('Status Pembayaran wajib diisi');
                return false;
            }
            if (!formData.nomorInvoice) {
                toast.error('Nomor Invoice wajib diisi');
                return false;
            }
            if (!formData.RekeningName) {
                toast.error('Rekening wajib diisi');
                return false;
            }
            if (!formData.totalPayment || parseFloat(formData.totalPayment) <= 0) {
                toast.error('Total Pembayaran wajib diisi');
                return false;
            }
        }

        return true;
    };

    const prepareApiData = (formData, modalMode, selectedRecord) => {
        const totalDealNum = parseFloat(formData.totalDeal) || 0;
        const calculatedDpp = totalDealNum > 0 ? Math.round(totalDealNum / 1.11) : 0;
        const calculatedPpn = Math.round(calculatedDpp * 0.11);

        const apiData = {
            ...formData,
            dpp: calculatedDpp,
            ppn: calculatedPpn,
            actorName: userName,
            actorRole: userRole,
            oldValues: modalMode === 'edit' ? selectedRecord : undefined
        };

        if (formData.status !== 'Invoice') {
            apiData.paymentStatus = '';
            apiData.nomorInvoice = '';
            apiData.RekeningName = '';
            apiData.totalPayment = '';
            apiData.sisaPayment = '';
        }

        return apiData;
    };

    const saveData = async (formData, modalMode, selectedRecord, onSuccess) => {
        if (!validateForm(formData)) return;

        setIsSubmitting(true);

        try {
            const apiData = prepareApiData(formData, modalMode, selectedRecord);

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
                if (onSuccess) onSuccess();
                return true;
            } else {
                toast.error(result.message || 'Gagal menyimpan data');
                return false;
            }
        } catch (error) {
            toast.error('Error: ' + error.message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteData = async (id) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return false;

        try {
            const response = await fetch(`/api/del/salesProgress?id=${id}`, {
                method: 'DELETE',
                headers: { authorization: API_KEY }
            });

            const result = await response.json();
            if (result.isSuccess) {
                toast.success('Data berhasil dihapus');
                return true;
            } else {
                toast.error(result.message || 'Gagal menghapus data');
                return false;
            }
        } catch (error) {
            toast.error('Error: ' + error.message);
            return false;
        }
    };

    return {
        isSubmitting,
        setIsSubmitting,
        saveData,
        deleteData,
        validateForm,
        prepareApiData
    };
};
