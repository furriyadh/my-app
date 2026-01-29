'use client';

import React, { useState, useEffect } from 'react';
import {
    Crown,
    Users,
    DollarSign,
    TrendingUp,
    Activity,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Search,
    Filter,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw,
    Send
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ManagedAccount {
    id: string;
    account_id: string;
    account_name: string;
    status: string;
    assigned_to: string | null;
    assigned_at: string | null;
    trust_score: number;
    created_at: string;
}

interface CommissionRecord {
    id: string;
    user_id: string;
    user_email?: string;
    total_ad_spend: number;
    commission_amount: number;
    period: string;
    status: string;
}

interface DashboardStats {
    totalManagedUsers: number;
    totalSelfManagedUsers: number;
    totalCommissionEarned: number;
    totalCommissionPending: number;
    activeManagedAccounts: number;
    availableManagedAccounts: number;
}

const AdminBillingDashboard: React.FC = () => {
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [isRTL, setIsRTL] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'commissions' | 'users' | 'refunds'>('overview');

    // Refund states
    const [refundEmail, setRefundEmail] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [refundLoading, setRefundLoading] = useState(false);
    const [refundMessage, setRefundMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleProcessRefund = async () => {
        if (!refundEmail || !refundAmount) {
            setRefundMessage({ type: 'error', text: 'Email and amount are required' });
            return;
        }
        setRefundLoading(true);
        setRefundMessage(null);
        try {
            const res = await fetch('/admin/billing/refund', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: refundEmail,
                    amount: parseFloat(refundAmount),
                    reason: refundReason
                })
            });
            const data = await res.json();
            if (data.success) {
                setRefundMessage({ type: 'success', text: `Refunded $${refundAmount} to ${refundEmail}` });
                setRefundEmail('');
                setRefundAmount('');
                setRefundReason('');
            } else {
                setRefundMessage({ type: 'error', text: data.error || 'Refund failed' });
            }
        } catch (err: any) {
            setRefundMessage({ type: 'error', text: err.message });
        } finally {
            setRefundLoading(false);
        }
    };

    // Data states
    const [stats, setStats] = useState<DashboardStats>({
        totalManagedUsers: 0,
        totalSelfManagedUsers: 0,
        totalCommissionEarned: 0,
        totalCommissionPending: 0,
        activeManagedAccounts: 0,
        availableManagedAccounts: 0
    });
    const [managedAccounts, setManagedAccounts] = useState<ManagedAccount[]>([]);
    const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
        if (savedLanguage) {
            setLanguage(savedLanguage);
            setIsRTL(savedLanguage === 'ar');
        }

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch managed accounts
            const { data: accounts, error: accountsError } = await supabase
                .from('managed_accounts')
                .select('*')
                .order('created_at', { ascending: false });

            if (!accountsError && accounts) {
                setManagedAccounts(accounts);

                // Calculate stats
                const activeAccounts = accounts.filter(a => a.status === 'assigned').length;
                const availableAccounts = accounts.filter(a => a.status === 'available').length;

                setStats(prev => ({
                    ...prev,
                    activeManagedAccounts: activeAccounts,
                    availableManagedAccounts: availableAccounts
                }));
            }

            // Fetch billing subscriptions for user counts
            const { data: subscriptions, error: subError } = await supabase
                .from('user_billing_subscriptions')
                .select('billing_mode');

            if (!subError && subscriptions) {
                const managed = subscriptions.filter(s => s.billing_mode === 'furriyadh_managed').length;
                const selfManaged = subscriptions.filter(s => s.billing_mode === 'self_managed' || !s.billing_mode).length;

                setStats(prev => ({
                    ...prev,
                    totalManagedUsers: managed,
                    totalSelfManagedUsers: selfManaged
                }));
            }

            // Fetch commission invoices
            const { data: invoices, error: invoicesError } = await supabase
                .from('commission_invoices')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (!invoicesError && invoices) {
                setCommissions(invoices.map(inv => ({
                    id: inv.id,
                    user_id: inv.user_id,
                    total_ad_spend: inv.total_ad_spend || 0,
                    commission_amount: inv.commission_amount || 0,
                    period: inv.invoice_month || '',
                    status: inv.status || 'pending'
                })));

                // Calculate commission totals
                const earned = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.commission_amount || 0), 0);
                const pending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.commission_amount || 0), 0);

                setStats(prev => ({
                    ...prev,
                    totalCommissionEarned: earned,
                    totalCommissionPending: pending
                }));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({
        title,
        value,
        icon: Icon,
        color,
        trend,
        trendValue
    }: {
        title: string;
        value: string | number;
        icon: any;
        color: string;
        trend?: 'up' | 'down';
        trendValue?: string;
    }) => (
        <div className="trezo-card bg-white dark:bg-[#0c1427] p-5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    );

    return (
        <div className="mb-[25px]">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-[25px]">
                <div>
                    <h5 className="!mb-0 text-lg font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'لوحة تحكم الفوترة المُدارة' : 'Managed Billing Dashboard'}
                    </h5>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {isRTL ? 'إدارة الحسابات الموثقة ومتابعة العمولات' : 'Manage verified accounts and track commissions'}
                    </p>
                </div>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {isRTL ? 'تحديث' : 'Refresh'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-[25px]">
                <StatCard
                    title={isRTL ? 'مستخدمي الحسابات المُدارة' : 'Managed Users'}
                    value={stats.totalManagedUsers}
                    icon={Crown}
                    color="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                    trend="up"
                    trendValue="+12%"
                />
                <StatCard
                    title={isRTL ? 'مستخدمي الإدارة الذاتية' : 'Self-Managed Users'}
                    value={stats.totalSelfManagedUsers}
                    icon={Users}
                    color="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title={isRTL ? 'العمولات المُحصلة' : 'Earned Commission'}
                    value={`$${stats.totalCommissionEarned.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    trend="up"
                    trendValue="+8%"
                />
                <StatCard
                    title={isRTL ? 'العمولات المعلقة' : 'Pending Commission'}
                    value={`$${stats.totalCommissionPending.toLocaleString()}`}
                    icon={Clock}
                    color="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                />
                <StatCard
                    title={isRTL ? 'حسابات نشطة' : 'Active Accounts'}
                    value={stats.activeManagedAccounts}
                    icon={Activity}
                    color="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title={isRTL ? 'حسابات متاحة' : 'Available Accounts'}
                    value={stats.availableManagedAccounts}
                    icon={CheckCircle}
                    color="bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {[
                    { id: 'overview', label: isRTL ? 'نظرة عامة' : 'Overview' },
                    { id: 'accounts', label: isRTL ? 'الحسابات المُدارة' : 'Managed Accounts' },
                    { id: 'commissions', label: isRTL ? 'العمولات' : 'Commissions' },
                    { id: 'refunds', label: isRTL ? 'الاستردادات' : 'Refunds' },
                    { id: 'users', label: isRTL ? 'المستخدمين' : 'Users' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="trezo-card bg-white dark:bg-[#0c1427] rounded-lg">
                {/* Search and Filter Bar */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={isRTL ? 'بحث...' : 'Search...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Filter className="w-4 h-4" />
                        {isRTL ? 'فلتر' : 'Filter'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Download className="w-4 h-4" />
                        {isRTL ? 'تصدير' : 'Export'}
                    </button>
                </div>

                {/* Managed Accounts Table */}
                {activeTab === 'accounts' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'معرف الحساب' : 'Account ID'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الاسم' : 'Name'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الحالة' : 'Status'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'درجة الثقة' : 'Trust Score'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'مُعين لـ' : 'Assigned To'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {managedAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                                                </div>
                                            ) : (
                                                isRTL ? 'لا توجد حسابات مُدارة' : 'No managed accounts found'
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    managedAccounts.map((account) => (
                                        <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 px-4 font-mono text-sm text-gray-900 dark:text-white">
                                                {account.account_id}
                                            </td>
                                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                                                {account.account_name || '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${account.status === 'available'
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                    : account.status === 'assigned'
                                                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {account.status === 'available' ? (isRTL ? 'متاح' : 'Available') :
                                                        account.status === 'assigned' ? (isRTL ? 'مُعين' : 'Assigned') :
                                                            account.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${account.trust_score >= 80 ? 'bg-green-500' :
                                                                account.trust_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${account.trust_score}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{account.trust_score}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                {account.assigned_to || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Commissions Table */}
                {activeTab === 'commissions' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'المستخدم' : 'User'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الفترة' : 'Period'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'إجمالي الإنفاق' : 'Total Spend'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'العمولة (20%)' : 'Commission (20%)'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الحالة' : 'Status'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {commissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                                            {isRTL ? 'لا توجد سجلات عمولات' : 'No commission records found'}
                                        </td>
                                    </tr>
                                ) : (
                                    commissions.map((commission) => (
                                        <tr key={commission.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 px-4 text-gray-900 dark:text-white">
                                                {commission.user_email || commission.user_id.slice(0, 8)}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                                {commission.period}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                                ${commission.total_ad_spend.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 font-medium text-green-600 dark:text-green-400">
                                                ${commission.commission_amount.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${commission.status === 'paid'
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                    : commission.status === 'pending'
                                                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {commission.status === 'paid' ? (isRTL ? 'مدفوع' : 'Paid') :
                                                        commission.status === 'pending' ? (isRTL ? 'معلق' : 'Pending') :
                                                            commission.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Commission Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                                <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {isRTL ? 'ملخص العمولات' : 'Commission Summary'}
                                </h6>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'هذا الشهر' : 'This Month'}</span>
                                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                            ${stats.totalCommissionPending.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'إجمالي العمولات' : 'Total Earned'}</span>
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            ${stats.totalCommissionEarned.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-px bg-gray-200 dark:bg-gray-700" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'نسبة العمولة' : 'Commission Rate'}</span>
                                        <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">20%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Distribution */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                                <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {isRTL ? 'توزيع الحسابات' : 'Account Distribution'}
                                </h6>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-purple-600 dark:text-purple-400">{isRTL ? 'حسابات مُدارة' : 'Managed'}</span>
                                            <span className="text-gray-600 dark:text-gray-400">{stats.totalManagedUsers}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full"
                                                style={{
                                                    width: `${stats.totalManagedUsers + stats.totalSelfManagedUsers > 0
                                                        ? (stats.totalManagedUsers / (stats.totalManagedUsers + stats.totalSelfManagedUsers)) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-blue-600 dark:text-blue-400">{isRTL ? 'إدارة ذاتية' : 'Self-Managed'}</span>
                                            <span className="text-gray-600 dark:text-gray-400">{stats.totalSelfManagedUsers}</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{
                                                    width: `${stats.totalManagedUsers + stats.totalSelfManagedUsers > 0
                                                        ? (stats.totalSelfManagedUsers / (stats.totalManagedUsers + stats.totalSelfManagedUsers)) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Refunds Tab */}
                {activeTab === 'refunds' && (
                    <div className="p-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                    <RotateCcw className="w-6 h-6" />
                                </div>
                                <div>
                                    <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {isRTL ? 'معالجة استرداد' : 'Process Refund'}
                                    </h6>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {isRTL ? 'أدخل بيانات العميل لمعالجة الاسترداد' : 'Enter customer details to process refund'}
                                    </p>
                                </div>
                            </div>

                            {refundMessage && (
                                <div className={`p-4 rounded-lg mb-4 ${refundMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                    {refundMessage.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {isRTL ? 'البريد الإلكتروني للعميل' : 'Customer Email'}
                                    </label>
                                    <input
                                        type="email"
                                        value={refundEmail}
                                        onChange={(e) => setRefundEmail(e.target.value)}
                                        placeholder="customer@example.com"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {isRTL ? 'مبلغ الاسترداد ($)' : 'Refund Amount ($)'}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {isRTL ? 'سبب الاسترداد' : 'Refund Reason'}
                                    </label>
                                    <textarea
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        placeholder={isRTL ? 'سبب الاسترداد (اختياري)' : 'Reason for refund (optional)'}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleProcessRefund}
                                    disabled={refundLoading || !refundEmail || !refundAmount}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                                >
                                    {refundLoading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    {isRTL ? 'معالجة الاسترداد' : 'Process Refund'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{isRTL ? 'قريباً - قائمة المستخدمين وأوضاع الفوترة' : 'Coming Soon - User list and billing modes'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBillingDashboard;
