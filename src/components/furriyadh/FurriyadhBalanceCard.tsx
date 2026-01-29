'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    Plus,
    AlertTriangle,
    RefreshCcw,
    DollarSign,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock,
    Bell,
    ExternalLink
} from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

// Type definitions
interface BalanceInfo {
    success: boolean;
    current_balance: number;
    total_deposited: number;
    total_spent: number;
    total_commission: number;
    status: 'active' | 'suspended' | 'out_of_balance' | 'closed';
    locked_asset_url: string;
    is_low_balance: boolean;
    is_out_of_balance: boolean;
    balance_percentage: number;
}

interface Notification {
    id: string;
    type: 'low_balance' | 'no_balance' | 'campaign_paused' | 'deposit_received' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

interface Deposit {
    id: string;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    payment_method: string;
    status: string;
    created_at: string;
}

interface FurriyadhBalanceCardProps {
    userEmail: string;
    isRTL?: boolean;
    onBalanceUpdate?: (balance: BalanceInfo) => void;
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

export const FurriyadhBalanceCard: React.FC<FurriyadhBalanceCardProps> = ({
    userEmail,
    isRTL = false,
    onBalanceUpdate
}) => {
    const [balance, setBalance] = useState<BalanceInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddCredit, setShowAddCredit] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(50);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // Fetch balance
    const fetchBalance = useCallback(async () => {
        if (!userEmail) return;

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/furriyadh?email=${encodeURIComponent(userEmail)}&action=balance`);
            const data = await response.json();

            if (data.success) {
                setBalance(data);
                onBalanceUpdate?.(data);
            } else {
                setError(data.error || 'Failed to fetch balance');
            }
        } catch (err) {
            console.error('Error fetching balance:', err);
            setError('Failed to connect to server');
        } finally {
            setIsLoading(false);
        }
    }, [userEmail, onBalanceUpdate]);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!userEmail) return;

        try {
            const response = await fetch(`/api/furriyadh?email=${encodeURIComponent(userEmail)}&action=notifications&unread_only=true`);
            const data = await response.json();

            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchBalance();
        fetchNotifications();
    }, [fetchBalance, fetchNotifications]);

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (!balance || balance.total_deposited === 0) return 0;
        return Math.max(0, Math.min(100, balance.balance_percentage));
    };

    // Get progress bar color
    const getProgressColor = () => {
        const percentage = getProgressPercentage();
        if (percentage <= 10) return 'bg-red-500';
        if (percentage <= 30) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    // Get status badge
    const getStatusBadge = () => {
        if (!balance) return null;

        const statuses = {
            active: {
                label: isRTL ? 'نشط' : 'Active',
                class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            },
            out_of_balance: {
                label: isRTL ? 'نفاد الرصيد' : 'Out of Balance',
                class: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            },
            suspended: {
                label: isRTL ? 'معلّق' : 'Suspended',
                class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            },
            closed: {
                label: isRTL ? 'مغلق' : 'Closed',
                class: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }
        };

        const status = statuses[balance.status] || statuses.closed;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                {status.label}
            </span>
        );
    };

    // Handle PayPal payment
    const handlePayPalSuccess = async (details: any) => {
        try {
            const response = await fetch('/api/furriyadh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deposit',
                    email: userEmail,
                    amount: depositAmount,
                    payment_method: 'paypal',
                    payment_reference: details.id,
                    payment_email: details.payer?.email_address
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowAddCredit(false);
                fetchBalance();
                // Show success notification
                alert(isRTL ? 'تم إضافة الرصيد بنجاح!' : 'Credit added successfully!');
            } else {
                alert(data.error || 'Failed to process payment');
            }
        } catch (err) {
            console.error('Payment processing error:', err);
            alert('Failed to process payment');
        }
    };

    // Quick deposit amounts
    const quickAmounts = [25, 50, 100, 250, 500];

    if (isLoading) {
        return (
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                    <XCircle className="w-6 h-6" />
                    <div>
                        <h5 className="!mb-0">{isRTL ? 'خطأ' : 'Error'}</h5>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
                <button
                    onClick={fetchBalance}
                    className="mt-4 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                    <RefreshCcw className="w-4 h-4" />
                    {isRTL ? 'إعادة المحاولة' : 'Retry'}
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Main Balance Card */}
            <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                {/* Header */}
                <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
                    <div className="trezo-card-title flex items-center gap-3">
                        <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/20">
                            <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h5 className="!mb-0">
                            {isRTL ? 'رصيد Furriyadh Account' : 'Furriyadh Account Balance'}
                        </h5>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge()}
                        {/* Notifications Bell */}
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={fetchBalance}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title={isRTL ? 'تحديث' : 'Refresh'}
                        >
                            <RefreshCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Balance Display */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-5 mb-[20px]">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {isRTL ? 'الرصيد الحالي' : 'Current Balance'}
                            </p>
                            <h5 className="!mb-0 !text-[28px]">
                                ${balance?.current_balance?.toFixed(2) || '0.00'}
                            </h5>
                        </div>
                        <button
                            onClick={() => setShowAddCredit(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            {isRTL ? 'إضافة رصيد' : 'Add Credit'}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                                {isRTL ? 'الرصيد المتبقي' : 'Remaining Balance'}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {getProgressPercentage().toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
                                style={{ width: `${getProgressPercentage()}%` }}
                            />
                        </div>
                    </div>

                    {/* Low Balance Warning */}
                    {balance?.is_low_balance && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${balance.is_out_of_balance
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">
                                {balance.is_out_of_balance
                                    ? (isRTL ? 'نفاد الرصيد! تم إيقاف حملاتك. أضف رصيداً لاستئناف العمل.' : 'Out of balance! Your campaigns are paused. Add credit to resume.')
                                    : (isRTL ? 'رصيد منخفض! يُنصح بإضافة رصيد لتجنب توقف الحملات.' : 'Low balance! Add credit to avoid campaign interruption.')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isRTL ? 'إجمالي الإيداعات' : 'Total Deposits'}
                            </span>
                        </div>
                        <p className="text-lg font-bold text-black dark:text-white">
                            ${balance?.total_deposited?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isRTL ? 'إجمالي الإنفاق' : 'Total Spent'}
                            </span>
                        </div>
                        <p className="text-lg font-bold text-black dark:text-white">
                            ${balance?.total_spent?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-purple-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isRTL ? 'العمولة (20%)' : 'Commission (20%)'}
                            </span>
                        </div>
                        <p className="text-lg font-bold text-black dark:text-white">
                            ${balance?.total_commission?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {isRTL ? 'الموقع المقفل' : 'Locked Asset'}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-black dark:text-white truncate" title={balance?.locked_asset_url}>
                            {balance?.locked_asset_url ? new URL(`https://${balance.locked_asset_url.replace(/^https?:\/\//, '')}`).hostname : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Credit Modal */}
            {showAddCredit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#0c1427] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {isRTL ? 'إضافة رصيد' : 'Add Credit'}
                            </h3>
                            <button
                                onClick={() => setShowAddCredit(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {quickAmounts.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setDepositAmount(amount)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${depositAmount === amount
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'أو أدخل مبلغ مخصص' : 'Or enter custom amount'}
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    min="10"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Math.max(10, Number(e.target.value)))}
                                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {isRTL ? 'الحد الأدنى: $10' : 'Minimum: $10'}
                            </p>
                        </div>

                        {/* Commission Breakdown */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-4 mb-6">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                {isRTL ? 'تفاصيل المبلغ' : 'Amount Breakdown'}
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">{isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">${depositAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-yellow-600 dark:text-yellow-400">
                                    <span>{isRTL ? 'العمولة (20%)' : 'Commission (20%)'}</span>
                                    <span>-${(depositAmount * 0.20).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold">
                                    <span className="text-gray-900 dark:text-white">{isRTL ? 'الرصيد المُضاف' : 'Credit Added'}</span>
                                    <span className="text-green-600 dark:text-green-400">${(depositAmount * 0.80).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* PayPal Button */}
                        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                            <PayPalButtons
                                style={{ layout: 'vertical', shape: 'pill' }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: [{
                                            amount: {
                                                currency_code: 'USD',
                                                value: depositAmount.toString()
                                            },
                                            description: `Furriyadh Account Credit - $${(depositAmount * 0.80).toFixed(2)} after commission`,
                                            custom_id: userEmail // Pass email for webhook
                                        }],
                                        intent: 'CAPTURE'
                                    });
                                }}
                                onApprove={async (data, actions) => {
                                    const details = await actions.order?.capture();
                                    if (details) {
                                        handlePayPalSuccess(details);
                                    }
                                }}
                                onError={(err) => {
                                    console.error('PayPal error:', err);
                                    alert('Payment failed. Please try again.');
                                }}
                            />
                        </PayPalScriptProvider>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            {isRTL ? 'الدفع الآمن عبر PayPal' : 'Secure payment via PayPal'}
                        </p>
                    </div>
                </div>
            )}

            {/* Notifications Panel */}
            {showNotifications && notifications.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-4 bg-black/30" onClick={() => setShowNotifications(false)}>
                    <div className="bg-white dark:bg-[#0c1427] rounded-md shadow-2xl w-80 max-h-96 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                {isRTL ? 'الإشعارات' : 'Notifications'}
                            </h4>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.map((notif) => (
                                <div key={notif.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${notif.type === 'deposit_received' ? 'bg-green-100 dark:bg-green-900/30' :
                                            notif.type === 'low_balance' || notif.type === 'no_balance' ? 'bg-red-100 dark:bg-red-900/30' :
                                                'bg-blue-100 dark:bg-blue-900/30'
                                            }`}>
                                            {notif.type === 'deposit_received' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                                                notif.type === 'low_balance' || notif.type === 'no_balance' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
                                                    <Bell className="w-4 h-4 text-blue-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FurriyadhBalanceCard;
