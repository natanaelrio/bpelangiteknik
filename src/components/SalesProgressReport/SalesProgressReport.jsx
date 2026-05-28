'use client'

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { signOut } from "next-auth/react";
import { motivationalQuotes } from '../../utils/motivationalQuotes';
import { SendGroupReportSales } from '../../service/handleCRM';

// Import modular components
import Header from './Header';
import FilterBar from './FilterBar';
import AdvancedFilters from './AdvancedFilters';
import TotalsSummary from './TotalsSummary';
import CardList from './CardList';
import Pagination from './Pagination';
import ModalForm from './ModalForm';
import LogsModal from './LogsModal';
import DetailModal from './DetailModal';

// Import hooks
import { useSalesProgressData, useSalesNames, useSalesLogs, useSalesForm, useSalesFilters, useSalesSave } from './hooks';

// Import utilities
import { buildWhatsAppMessage } from './whatsappMessage';
import { ITEMS_PER_PAGE } from './constants';
import styles from '@/components/SalesProgressReport/SalesProgressReport.module.css';

export default function SalesProgressReport({ session }) {
    const userName = session.username || 'User';
    const userRole = session.role || 'SALES';
    const perusahaan = session.perusahaan || 'PT xxxx';
    const SPV = session.role === 'SPV' || false;

    const API_KEY = process.env.NEXT_PUBLIC_SECREET;

    // Get random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [logsLoading, setLogsLoading] = useState(false);

    // Custom hooks
    const { data, loading, totalCount, totals, fetchData } = useSalesProgressData(API_KEY);
    const { salesNames, fetchSalesNames } = useSalesNames(API_KEY);
    const { logsData, fetchLogs, clearLogs } = useSalesLogs(API_KEY);
    const { formData, setFormData, selectedRecord, modalMode, resetForm, handleInputChange, handleItemChange, addItem, removeItem, populateFormForEdit } = useSalesForm(userName, perusahaan);
    const filters = useSalesFilters();
    const { isSubmitting, saveData, deleteData } = useSalesSave(API_KEY, userName, userRole);

    // Fetch data when filters change
    useEffect(() => {
        fetchData({
            statusFilter: filters.statusFilter,
            salesNameFilter: filters.salesNameFilter,
            paymentStatusFilter: filters.paymentStatusFilter,
            debouncedSearch: filters.debouncedSearch,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            currentPage: filters.currentPage,
            itemsPerPage: ITEMS_PER_PAGE
        });
    }, [filters.currentPage, filters.statusFilter, filters.salesNameFilter, filters.paymentStatusFilter, filters.debouncedSearch, filters.dateFrom, filters.dateTo]);

    // Fetch sales names on mount
    useEffect(() => {
        fetchSalesNames();
    }, []);

    // Handlers
    const handleAddClick = () => {
        resetForm();
        setShowModal(true);
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    const handleDetailClick = (item) => {
        setDetailData(item);
        setShowDetailModal(true);
    };

    const handleLogsClick = async (id) => {
        setLogsLoading(true);
        await fetchLogs(id);
        setShowLogs(true);
        setLogsLoading(false);
    };

    const handleDeleteClick = async (id) => {
        const success = await deleteData(id);
        if (success) {
            fetchData({
                statusFilter: filters.statusFilter,
                salesNameFilter: filters.salesNameFilter,
                paymentStatusFilter: filters.paymentStatusFilter,
                debouncedSearch: filters.debouncedSearch,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                currentPage: filters.currentPage,
                itemsPerPage: ITEMS_PER_PAGE
            });
        }
    };

    const handleEdit = (item) => {
        populateFormForEdit(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleCloseLogs = () => {
        setShowLogs(false);
        clearLogs();
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
        setDetailData(null);
    };

    const handleSave = async () => {
        const onSuccess = () => {
            setShowModal(false);
            resetForm();
            fetchData({
                statusFilter: filters.statusFilter,
                salesNameFilter: filters.salesNameFilter,
                paymentStatusFilter: filters.paymentStatusFilter,
                debouncedSearch: filters.debouncedSearch,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo,
                currentPage: filters.currentPage,
                itemsPerPage: ITEMS_PER_PAGE
            });
        };

        await saveData(formData, modalMode, selectedRecord, onSuccess);
    };

    const handleSendWhatsApp = async () => {
        try {
            const message = buildWhatsAppMessage(formData, userName, perusahaan);
            const groupId = userRole === 'SPV' ? '120363406595440008@g.us' : '120363411343925143@g.us';

            const result = await SendGroupReportSales({ groupId, message });

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

    return (
        <div className={styles.container}>
            <Header
                userName={userName}
                randomQuote={randomQuote}
                onAddClick={handleAddClick}
                onLogout={handleLogout}
            />

            <FilterBar
                searchTerm={filters.searchTerm}
                onSearchChange={filters.setSearchTerm}
                showFilters={filters.showFilters}
                onToggleFilters={() => filters.setShowFilters(!filters.showFilters)}
            />

            {filters.showFilters && (
                <AdvancedFilters
                    statusFilter={filters.statusFilter}
                    onStatusChange={filters.setStatusFilter}
                    salesNameFilter={filters.salesNameFilter}
                    onSalesNameChange={filters.setSalesNameFilter}
                    salesNames={salesNames}
                    paymentStatusFilter={filters.paymentStatusFilter}
                    onPaymentStatusChange={filters.setPaymentStatusFilter}
                    dateFrom={filters.dateFrom}
                    onDateFromChange={filters.setDateFrom}
                    dateTo={filters.dateTo}
                    onDateToChange={filters.setDateTo}
                />
            )}

            <TotalsSummary totals={totals} />

            <CardList
                items={data}
                loading={loading}
                SPV={SPV}
                logsLoading={logsLoading}
                onDetailClick={handleDetailClick}
                onLogsClick={handleLogsClick}
                onDeleteClick={handleDeleteClick}
            />

            <Pagination
                currentPage={filters.currentPage}
                totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)}
                totalCount={totalCount}
                onPageChange={filters.setCurrentPage}
            />

            {showModal && (
                <ModalForm
                    modalMode={modalMode}
                    formData={formData}
                    onInputChange={handleInputChange}
                    onItemChange={handleItemChange}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    onSendWhatsApp={handleSendWhatsApp}
                    isSubmitting={isSubmitting}
                />
            )}

            <LogsModal
                logsData={logsData}
                show={showLogs}
                onClose={handleCloseLogs}
            />

            <DetailModal
                detailData={detailData}
                show={showDetailModal}
                onClose={handleCloseDetail}
                onEdit={handleEdit}
            />
        </div>
    );
}
