import moment from 'moment';
import 'moment/locale/id';

// Format currency for display
export const formatRupiah = (value) => {
    if (!value && value !== 0) return 'Rp 0';
    const number = parseFloat(value) || 0;
    return 'Rp ' + number.toLocaleString('id-ID');
};

// Format currency without decimal/comma for DPP and PPN
export const formatRupiahRounded = (value) => {
    if (!value && value !== 0) return 'Rp 0';
    const number = Math.round(parseFloat(value) || 0);
    return 'Rp ' + number.toLocaleString('id-ID');
};

// Calculate DPP and PPN from total deal
export const calculateTax = (totalDeal) => {
    const totalDealNum = parseFloat(totalDeal) || 0;
    const dpp = totalDealNum > 0 ? Math.round(totalDealNum / 1.11) : 0;
    const ppn = Math.round(dpp * 0.11);
    return { dpp, ppn };
};

// Calculate subtotal from items
export const calculateSubtotals = (items) => {
    const totalUnit = items?.reduce((sum, item) => sum + (parseFloat(item.subtotalUnit) || 0), 0) || 0;
    const totalDeal = items?.reduce((sum, item) => sum + (parseFloat(item.subtotalDeal) || 0), 0) || 0;
    return { totalUnit, totalDeal };
};

// Build query params for API
export const buildQueryParams = (options) => {
    const { statusFilter, salesNameFilter, paymentStatusFilter, debouncedSearch, dateFrom, dateTo, currentPage, itemsPerPage } = options;
    
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (salesNameFilter) params.append('salesName', salesNameFilter);
    if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);
    params.append('limit', itemsPerPage.toString());
    params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
    return params.toString();
};

// Get unique sales names from data
export const getUniqueSalesNames = (data) => {
    const names = [...new Set(data?.map(item => item.salesName).filter(Boolean))].sort();
    return names;
};

// Format payment status for display
export const formatPaymentStatus = (status) => {
    const statusMap = {
        'BELUM_BAYAR': 'Belum Bayar',
        'DP': 'DP',
        'CICIL': 'Cicilan',
        'LUNAS': 'Lunas'
    };
    return statusMap[status] || status;
};

// Format date
export const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY HH:mm');
};

// Format date short
export const formatDateShort = (date) => {
    return moment(date).format('DD MMM YY');
};

// Get current date formatted
export const getCurrentDateFormatted = () => {
    return moment().format('DD MMMM YYYY HH:mm');
};
