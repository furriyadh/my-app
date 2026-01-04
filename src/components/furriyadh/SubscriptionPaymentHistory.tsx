'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    Download,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Clock,
    XCircle,
    Calendar,
    Receipt
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SubscriptionTransaction {
    id: string;
    transaction_type: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    transaction_date: string;
    created_at: string;
}

interface SubscriptionPaymentHistoryProps {
    userId?: string;
    userEmail?: string;
    isRTL?: boolean;
}

export const SubscriptionPaymentHistory: React.FC<SubscriptionPaymentHistoryProps> = ({
    userId,
    userEmail,
    isRTL = false
}) => {
    const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'subscription_fee' | 'refund'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const ITEMS_PER_PAGE = 10;

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        if (!userId && !userEmail) return;
        setIsLoading(true);
        try {
            // Use userId directly if provided, otherwise get from auth
            let resolvedUserId = userId;

            if (!resolvedUserId) {
                const { data: { user } } = await supabase.auth.getUser();
                resolvedUserId = user?.id;
            }

            if (!resolvedUserId) {
                setTransactions([]);
                return;
            }

            // Build query
            let query = supabase
                .from('billing_transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', resolvedUserId)
                .order('created_at', { ascending: false });

            // Apply type filter
            if (typeFilter !== 'all') {
                query = query.eq('transaction_type', typeFilter);
            }

            // Apply date filter
            if (dateFilter !== 'all') {
                const now = new Date();
                let startDate = new Date();
                if (dateFilter === '7days') startDate.setDate(now.getDate() - 7);
                else if (dateFilter === '30days') startDate.setDate(now.getDate() - 30);
                else if (dateFilter === '90days') startDate.setDate(now.getDate() - 90);
                query = query.gte('created_at', startDate.toISOString());
            }

            // Apply search
            if (searchQuery) {
                query = query.ilike('description', `%${searchQuery}%`);
            }

            // Pagination
            const from = (currentPage - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching transactions:', error);
            } else {
                setTransactions(data || []);
                setTotalCount(count || 0);
                setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userId, userEmail, currentPage, typeFilter, dateFilter, searchQuery]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchTransactions();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    // Export to CSV
    const handleExportCSV = async () => {
        const csvContent = [
            ['Date', 'Type', 'Description', 'Amount', 'Status'].join(','),
            ...transactions.map(t => [
                new Date(t.created_at).toLocaleDateString(),
                t.transaction_type,
                `"${t.description || '-'}"`,
                `$${t.amount.toFixed(2)}`,
                t.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscription_payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Get status icon and color
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'completed':
                return { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
            case 'pending':
                return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
            case 'failed':
            case 'refunded':
                return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
            default:
                return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' };
        }
    };

    // Get transaction type display
    const getTypeDisplay = (type: string) => {
        const types: Record<string, { label: string; labelAr: string; icon: typeof CreditCard; color: string }> = {
            subscription_fee: { label: 'Subscription', labelAr: 'اشتراك', icon: CreditCard, color: 'text-primary-500' },
            refund: { label: 'Refund', labelAr: 'استرداد', icon: TrendingDown, color: 'text-red-500' },
            deposit: { label: 'Deposit', labelAr: 'إيداع', icon: TrendingUp, color: 'text-green-500' },
        };
        return types[type] || { label: type, labelAr: type, icon: Receipt, color: 'text-gray-500' };
    };

    return (
        <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            {/* Header */}
            <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                <div className="trezo-card-title">
                    <h5 className="!mb-0">
                        {isRTL ? 'سجل المدفوعات' : 'Payment History'}
                    </h5>
                </div>
            </div>

            {/* Filters */}
            <div className="p-4 border-b dark:border-gray-800">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={isRTL ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">{isRTL ? 'كل الأنواع' : 'All Types'}</option>
                        <option value="subscription_fee">{isRTL ? 'اشتراكات' : 'Subscriptions'}</option>
                        <option value="refund">{isRTL ? 'استرداد' : 'Refunds'}</option>
                    </select>

                    {/* Date Filter */}
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">{isRTL ? 'كل الوقت' : 'All Time'}</option>
                        <option value="7days">{isRTL ? 'آخر 7 أيام' : 'Last 7 days'}</option>
                        <option value="30days">{isRTL ? 'آخر 30 يوم' : 'Last 30 days'}</option>
                        <option value="90days">{isRTL ? 'آخر 90 يوم' : 'Last 90 days'}</option>
                    </select>

                    {/* Transaction Count & Actions */}
                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-sm text-gray-500">
                            {totalCount} {isRTL ? 'معاملة' : 'transactions'}
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <RefreshCcw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            {isRTL ? 'تصدير CSV' : 'Export CSV'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                            {isRTL ? 'لا توجد معاملات بعد' : 'No transactions yet'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            {isRTL ? 'سجل الاشتراكات والمدفوعات سيظهر هنا' : 'Subscription and payment records will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((transaction) => {
                            const typeDisplay = getTypeDisplay(transaction.transaction_type);
                            const statusDisplay = getStatusDisplay(transaction.status);
                            const StatusIcon = statusDisplay.icon;
                            const TypeIcon = typeDisplay.icon;

                            return (
                                <div
                                    key={transaction.id}
                                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {/* Type Icon */}
                                    <div className={`p-2 rounded-md ${typeDisplay.color === 'text-primary-500' ? 'bg-primary-100 dark:bg-primary-900/30' : typeDisplay.color === 'text-green-500' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                        <TypeIcon className={`w-5 h-5 ${typeDisplay.color}`} />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {isRTL ? typeDisplay.labelAr : typeDisplay.label}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {transaction.description || (isRTL ? 'دفعة اشتراك' : 'Subscription payment')}
                                        </p>
                                    </div>

                                    {/* Date */}
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(transaction.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right min-w-[80px]">
                                        <p className={`font-bold ${transaction.transaction_type === 'refund' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                            {transaction.transaction_type === 'refund' ? '-' : ''}${transaction.amount.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusDisplay.bg}`}>
                                        <StatusIcon className={`w-3.5 h-3.5 ${statusDisplay.color}`} />
                                        <span className={`text-xs font-medium capitalize ${statusDisplay.color}`}>
                                            {transaction.status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-500">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPaymentHistory;
