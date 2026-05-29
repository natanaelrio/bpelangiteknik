import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSalesProgressStore } from '@/zustand/useSalesProgressStore';

// Hook for fetching sales progress data
export const useSalesProgressData = (API_KEY) => {
    const {
        data, loading, totalCount, totals,
        setData, setLoading, setTotalCount, setTotals,
        buildQueryParams
    } = useSalesProgressStore();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = buildQueryParams();
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
    }, [API_KEY, setLoading, setData, setTotalCount, setTotals, buildQueryParams]);

    return { data, loading, totalCount, totals, fetchData };
};

// Hook for fetching sales names (SPV only)
export const useSalesNames = (API_KEY) => {
    const { salesNames, setSalesNames, isSPV } = useSalesProgressStore();

    const fetchSalesNames = useCallback(async () => {
        if (!isSPV) {
            setSalesNames([]);
            return;
        }
        try {
            const response = await fetch('/api/get/salesProgress?limit=1000', {
                headers: { authorization: API_KEY }
            });
            const result = await response.json();
            if (result.isSuccess) {
                const uniqueNames = [...new Set(result.data?.map(item => item.salesName).filter(Boolean))];
                setSalesNames(uniqueNames.sort());
            }
        } catch (error) {
            console.error('Error fetching sales names:', error);
        }
    }, [API_KEY, isSPV, setSalesNames]);

    return { salesNames, fetchSalesNames };
};

// Hook for fetching logs
export const useSalesLogs = (API_KEY) => {
    const { logsData, setLogsData, setShowLogs } = useSalesProgressStore();

    const fetchLogs = useCallback(async (salesProgressId) => {
        try {
            const response = await fetch(`/api/get/salesLog?salesProgressId=${salesProgressId}&limit=100`, {
                headers: { authorization: API_KEY }
            });
            const result = await response.json();
            if (result.isSuccess) {
                setLogsData(result.data || []);
                setShowLogs(true);
            }
        } catch (error) {
            toast.error('Gagal memuat logs');
        }
    }, [API_KEY, setLogsData, setShowLogs]);

    const clearLogs = useCallback(() => {
        setLogsData([]);
        setShowLogs(false);
    }, [setLogsData, setShowLogs]);

    return { logsData, fetchLogs, clearLogs };
};

// Hook for filter state - uses Zustand
export const useSalesFilters = () => {
    const store = useSalesProgressStore();
    return {
        searchTerm: store.searchTerm,
        debouncedSearch: store.debouncedSearch,
        statusFilter: store.statusFilter,
        salesNameFilter: store.salesNameFilter,
        paymentStatusFilter: store.paymentStatusFilter,
        dateFrom: store.dateFrom,
        dateTo: store.dateTo,
        showFilters: store.showFilters,
        currentPage: store.currentPage,
        setSearchTerm: store.setSearchTerm,
        setDebouncedSearch: store.setDebouncedSearch,
        setStatusFilter: store.setStatusFilter,
        setSalesNameFilter: store.setSalesNameFilter,
        setPaymentStatusFilter: store.setPaymentStatusFilter,
        setDateFrom: store.setDateFrom,
        setDateTo: store.setDateTo,
        setShowFilters: store.setShowFilters,
        setCurrentPage: store.setCurrentPage,
        updateDebouncedSearch: store.updateDebouncedSearch
    };
};

// Hook for pagination
export const useSalesPagination = () => {
    const { currentPage, totalCount, itemsPerPage, setCurrentPage } = useSalesProgressStore();

    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);

    return {
        currentPage,
        totalPages,
        totalCount,
        itemsPerPage,
        startItem,
        endItem,
        setCurrentPage
    };
};

// Hook for form handling - uses Zustand
export const useSalesForm = () => {
    const store = useSalesProgressStore();
    return {
        formData: store.formData,
        selectedRecord: store.selectedRecord,
        modalMode: store.modalMode,
        setFormData: store.setFormData,
        setSelectedRecord: store.setSelectedRecord,
        setModalMode: store.setModalMode,
        resetForm: store.resetForm,
        handleFormInputChange: store.handleFormInputChange,
        handleItemChange: store.handleItemChange,
        addItem: store.addItem,
        removeItem: store.removeItem,
        populateFormForEdit: store.populateFormForEdit,
        updateFormField: store.updateFormField
    };
};

// Hook for modal state
export const useSalesModals = () => {
    const store = useSalesProgressStore();
    return {
        showModal: store.showModal,
        showLogs: store.showLogs,
        showDetailModal: store.showDetailModal,
        setShowModal: store.setShowModal,
        setShowLogs: store.setShowLogs,
        setShowDetailModal: store.setShowDetailModal,
        detailData: store.detailData,
        setDetailData: store.setDetailData,
        isSubmitting: store.isSubmitting,
        setIsSubmitting: store.setIsSubmitting
    };
};

// Hook for user info
export const useSalesUser = () => {
    const store = useSalesProgressStore();
    return {
        userName: store.userName,
        userRole: store.userRole,
        perusahaan: store.perusahaan,
        isSPV: store.isSPV,
        setUserInfo: store.setUserInfo
    };
};

// Initialize user info from session
export const useInitializeSalesProgress = (session) => {
    const { setUserInfo } = useSalesProgressStore();

    useEffect(() => {
        if (session?.username) {
            setUserInfo(
                session.username,
                session.role || 'SALES',
                session.perusahaan || 'PT xxxx'
            );
        }
    }, [session, setUserInfo]);
};

// Hook for save operations
export const useSalesSave = (API_KEY) => {
    const {
        isSubmitting, setIsSubmitting,
        formData, selectedRecord, modalMode,
        userName, userRole
    } = useSalesProgressStore();

    const validateForm = useCallback((formData) => {
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
    }, []);

    const prepareApiData = useCallback((formData, modalMode, selectedRecord) => {
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
    }, [userName, userRole]);

    const saveData = useCallback(async (onSuccess) => {
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
    }, [API_KEY, formData, modalMode, selectedRecord, validateForm, prepareApiData, setIsSubmitting]);

    const deleteData = useCallback(async (id) => {
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
    }, [API_KEY]);

    return {
        isSubmitting,
        setIsSubmitting,
        saveData,
        deleteData,
        validateForm,
        prepareApiData
    };
};

// Helper to get unique sales names from data
export const getUniqueSalesNames = (data) => {
    if (!Array.isArray(data)) return [];
    const names = [...new Set(data.map(item => item.salesName).filter(Boolean))];
    return names.sort();
};
