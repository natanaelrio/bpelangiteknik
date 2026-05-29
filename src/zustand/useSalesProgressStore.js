import { create } from 'zustand';

const DEFAULT_ITEMS = [{
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
}];

export const useSalesProgressStore = create((set, get) => ({
    // User info
    userName: '',
    userRole: 'SALES',
    perusahaan: '',
    isSPV: false,

    setUserInfo: (userName, userRole, perusahaan) => set({
        userName,
        userRole,
        perusahaan,
        isSPV: userRole === 'SPV'
    }),

    // Data state
    data: [],
    loading: true,
    totalCount: 0,
    totals: { totalUnit: 0, totalDeal: 0, dpp: 0, ppn: 0, totalPayment: 0, sisaPayment: 0 },

    setData: (data) => set({ data }),
    setLoading: (loading) => set({ loading }),
    setTotalCount: (totalCount) => set({ totalCount }),
    setTotals: (totals) => set({ totals }),

    // Modal state
    showModal: false,
    modalMode: 'create',
    selectedRecord: null,
    showLogs: false,
    logsData: [],
    showDetailModal: false,
    detailData: null,

    setShowModal: (showModal) => set({ showModal }),
    setModalMode: (modalMode) => set({ modalMode }),
    setSelectedRecord: (selectedRecord) => set({ selectedRecord }),
    setShowLogs: (showLogs) => set({ showLogs }),
    setLogsData: (logsData) => set({ logsData }),
    setShowDetailModal: (showDetailModal) => set({ showDetailModal }),
    setDetailData: (detailData) => set({ detailData }),

    // Submit state
    isSubmitting: false,
    setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

    // Pagination
    currentPage: 1,
    itemsPerPage: 20,
    setCurrentPage: (currentPage) => set({ currentPage }),
    
    // Filter states
    searchTerm: '',
    debouncedSearch: '',
    statusFilter: '',
    salesNameFilter: '',
    paymentStatusFilter: '',
    dateFrom: '',
    dateTo: '',
    showFilters: false,

    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setDebouncedSearch: (debouncedSearch) => set({ debouncedSearch }),
    setStatusFilter: (statusFilter) => set({ statusFilter }),
    setSalesNameFilter: (salesNameFilter) => set({ salesNameFilter }),
    setPaymentStatusFilter: (paymentStatusFilter) => set({ paymentStatusFilter }),
    setDateFrom: (dateFrom) => set({ dateFrom }),
    setDateTo: (dateTo) => set({ dateTo }),
    setShowFilters: (showFilters) => set({ showFilters }),

    // Debounced search effect
    updateDebouncedSearch: () => {
        const { searchTerm } = get();
        const timer = setTimeout(() => {
            set({ debouncedSearch: searchTerm, currentPage: 1 });
        }, 500);
        return () => clearTimeout(timer);
    },

    // Sales names for filter
    salesNames: [],
    setSalesNames: (salesNames) => set({ salesNames }),

    // Form state
    formData: {
        salesName: '',
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
        salesCompany: '',
        RekeningName: '',
        items: [...DEFAULT_ITEMS]
    },

    setFormData: (formData) => set({ formData }),

    resetForm: () => {
        const { userName, perusahaan } = get();
        set({
            formData: {
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
                dpp: '',
                ppn: '',
                remarks: '',
                remarksPajak: '',
                totalPayment: '',
                sisaPayment: '',
                paymentStatus: '',
                salesCompany: perusahaan,
                RekeningName: '',
                items: [...DEFAULT_ITEMS]
            },
            selectedRecord: null,
            modalMode: 'create'
        });
    },

    updateFormField: (field, value) => set((state) => ({
        formData: { ...state.formData, [field]: value }
    })),

    // Handle form input with special logic for marketplace sources
    handleFormInputChange: (e) => {
        const { name, value, type, checked } = e.target;
        const { formData } = get();

        // Reset payment fields when status changes to non-Invoice
        if (name === 'status' && value !== 'Invoice') {
            set({
                formData: {
                    ...formData,
                    [name]: type === 'checkbox' ? checked : value,
                    paymentStatus: '',
                    nomorInvoice: '',
                    RekeningName: '',
                    totalPayment: '',
                    sisaPayment: ''
                }
            });
            return;
        }

        // Auto-set status to Invoice when marketplace source is selected
        if (name === 'sumber') {
            const marketplaceSources = ['MARKETPLACE SHOPEE', 'MARKETPLACE TOKPED', 'MARKETPLACE BLIBLI'];
            if (marketplaceSources.includes(value)) {
                set({
                    formData: {
                        ...formData,
                        sumber: value,
                        status: 'Invoice'
                    }
                });
                return;
            }
        }

        set({
            formData: {
                ...formData,
                [name]: type === 'checkbox' ? checked : value
            }
        });
    },

    // Handle item change with auto-calculate subtotals
    handleItemChange: (index, field, value) => {
        const { formData } = get();
        const newItems = formData.items.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };

                // Auto-calculate subtotals
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

        // Auto-calculate totals
        const totalUnit = newItems.reduce((sum, item) => sum + (parseFloat(item.subtotalUnit) || 0), 0);
        const totalDeal = newItems.reduce((sum, item) => sum + (parseFloat(item.subtotalDeal) || 0), 0);

        set({
            formData: { ...formData, items: newItems, totalUnit, totalDeal }
        });
    },

    addItem: () => set((state) => ({
        formData: {
            ...state.formData,
            items: [...state.formData.items, ...DEFAULT_ITEMS]
        }
    })),

    removeItem: (index) => set((state) => ({
        formData: {
            ...state.formData,
            items: state.formData.items.filter((_, i) => i !== index)
        }
    })),

    // Populate form for edit
    populateFormForEdit: (record) => {
        const { userName } = get();
        set({
            selectedRecord: record,
            modalMode: 'edit',
            formData: {
                id: record.id,
                salesName: userName,
                nama: record.nama || '',
                alamatLengkap: record.alamatLengkap || '',
                alamatKota: record.alamatKota || '',
                nomorHp: record.nomorHp || '',
                sumber: record.sumber || '',
                status: record.status || 'Prospect',
                statusCatatan: record.statusCatatan || '',
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
                salesCompany: record.salesCompany || '',
                RekeningName: record.RekeningName || '',
                items: record.items && record.items.length > 0 ? record.items.map(item => ({
                    ...item,
                    qty: item.qty || 1
                })) : [...DEFAULT_ITEMS]
            }
        });
    },

    // Build query params
    buildQueryParams: () => {
        const { 
            userRole, userName, salesNameFilter, statusFilter, 
            paymentStatusFilter, debouncedSearch, dateFrom, dateTo, 
            currentPage, itemsPerPage 
        } = get();
        
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
    }
}));
