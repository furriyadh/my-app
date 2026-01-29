'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AccountBudget {
    id: string;
    budget_name: string;
    account_id: string;
    status: 'active' | 'paused' | 'depleted';
    start_date: string;
    end_date: string | null;
    budget_amount: number;
    amount_spent: number;
    currency: string;
}

interface Props {
    accountId?: string;
    userEmail?: string;
    isRTL?: boolean;
    onManageBudgets?: () => void;
}

export const CampaignBudgetProgressCard: React.FC<Props> = ({
    accountId,
    userEmail,
    isRTL = false,
    onManageBudgets
}) => {
    const [budget, setBudget] = useState<AccountBudget | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch budget data
    const fetchBudget = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('🔍 Fetching budget for:', { accountId, userEmail });

            // First, try to fetch platform-created campaigns count
            let platformCampaignsCount = 0;
            let totalAdSpend = 0;

            if (userEmail) {
                // Get user ID from email
                const { data: userData } = await supabase.auth.getUser();
                if (userData?.user?.id) {
                    // Fetch platform campaigns for this user
                    const { data: platformCampaigns, error: campaignsError } = await supabase
                        .from('platform_created_campaigns')
                        .select('google_campaign_id, campaign_name, status, created_at')
                        .eq('user_id', userData.user.id)
                        .eq('status', 'active');

                    if (!campaignsError && platformCampaigns) {
                        platformCampaignsCount = platformCampaigns.length;
                        console.log(`🎯 Found ${platformCampaignsCount} platform campaigns`);
                    }
                }
            }

            // Build query for account data - by accountId or by email
            let query = supabase
                .from('furriyadh_customer_accounts')
                .select('id, account_name, google_ads_customer_id, current_balance, total_deposited, total_spent, currency, created_at, user_email');

            if (accountId) {
                query = query.eq('id', accountId);
            } else if (userEmail) {
                query = query.eq('user_email', userEmail);
            }

            const { data: accountData, error } = await query.maybeSingle();

            console.log('📊 Query result:', { accountData, error, platformCampaignsCount });

            if (error) {
                console.error('❌ Query error:', error);
            }

            if (accountData) {
                // Fetch first deposit date for this account
                const { data: firstDeposit } = await supabase
                    .from('furriyadh_deposits')
                    .select('created_at')
                    .eq('customer_account_id', accountData.id)
                    .eq('status', 'completed')
                    .order('created_at', { ascending: true })
                    .limit(1)
                    .maybeSingle();

                // Calculate budget info
                const totalBudget = accountData.total_deposited || 0;
                const totalSpent = accountData.total_spent || 0;

                // Use first deposit date if available, otherwise account creation date
                const startDate = firstDeposit?.created_at || accountData.created_at;

                setBudget({
                    id: accountData.id,
                    budget_name: accountData.account_name || `Furriyadh Account - ${accountData.id.slice(0, 8)}`,
                    account_id: accountData.google_ads_customer_id || accountData.id.slice(0, 12),
                    status: totalSpent >= totalBudget && totalBudget > 0 ? 'depleted' : 'active',
                    start_date: startDate,
                    end_date: null, // No end date
                    budget_amount: totalBudget,
                    amount_spent: totalSpent,
                    currency: accountData.currency || 'USD'
                });
                console.log('✅ Budget set successfully');
            } else {
                // 🆕 Set default zero budget when no account data found
                console.log('ℹ️ No account data found, showing zero values');
                setBudget({
                    id: 'default',
                    budget_name: isRTL ? 'حساب Furriyadh المُدار' : 'Furriyadh Managed Account',
                    account_id: '---',
                    status: 'active',
                    start_date: new Date().toISOString(),
                    end_date: null,
                    budget_amount: 0,
                    amount_spent: 0,
                    currency: 'USD'
                });
            }
        } catch (err) {
            console.error('Error fetching budget:', err);
            // 🆕 Even on error, show zero values
            setBudget({
                id: 'default',
                budget_name: isRTL ? 'حساب Furriyadh المُدار' : 'Furriyadh Managed Account',
                account_id: '---',
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: null,
                budget_amount: 0,
                amount_spent: 0,
                currency: 'USD'
            });
        } finally {
            setIsLoading(false);
        }
    }, [accountId, userEmail, isRTL]);

    useEffect(() => {
        fetchBudget();
    }, [fetchBudget]);

    // Format currency
    const formatCurrency = (amount: number, currency: string = 'USD') => {
        // Use Arabic locale for RTL
        const locale = isRTL ? 'ar-SA' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const locale = isRTL ? 'ar-SA' : 'en-US';
        return date.toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Calculate percentage
    const percentage = budget && budget.budget_amount > 0
        ? Math.min((budget.amount_spent / budget.budget_amount) * 100, 100)
        : 0;

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#0c1427] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    if (!budget) {
        return (
            <div className="bg-white dark:bg-[#0c1427] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    {isRTL ? 'لا توجد ميزانيات حساب' : 'No account budgets found'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-[#0c1427] rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-[480px]" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div>
                        {/* Title */}
                        <h5 className="!mb-4 text-xl font-bold text-gray-900 dark:text-white">
                            {isRTL ? 'ميزانيات الحساب' : 'Account Budgets'}
                        </h5>

                        {/* Budget Name */}
                        <div className="space-y-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="text-gray-500">{isRTL ? 'اسم الميزانية:' : 'Budget name:'}</span>{' '}
                                <span className="text-gray-900 dark:text-white">{budget.budget_name}</span>
                            </p>

                            {/* Status */}
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="text-gray-500">{isRTL ? 'الحالة:' : 'Status:'}</span>{' '}
                                <span className={`font-medium ${budget.status === 'active'
                                    ? 'text-green-600 dark:text-green-400'
                                    : budget.status === 'depleted'
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-yellow-600 dark:text-yellow-400'
                                    }`}>
                                    {budget.status === 'active'
                                        ? (isRTL ? 'نشط' : 'Active')
                                        : budget.status === 'depleted'
                                            ? (isRTL ? 'مستنفد' : 'Depleted')
                                            : (isRTL ? 'متوقف' : 'Paused')
                                    }
                                </span>
                            </p>

                            {/* Start Date */}
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="text-gray-500">{isRTL ? 'تاريخ البدء:' : 'Start date:'}</span>{' '}
                                <span className="text-gray-900 dark:text-white">{formatDate(budget.start_date)}</span>
                            </p>

                            {/* End Date */}
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="text-gray-500">{isRTL ? 'تاريخ الانتهاء:' : 'End date:'}</span>{' '}
                                <span className="text-gray-900 dark:text-white">
                                    {budget.end_date
                                        ? formatDate(budget.end_date)
                                        : (isRTL ? 'بدون تاريخ انتهاء' : 'No end date')
                                    }
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchBudget}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        title={isRTL ? 'تحديث' : 'Refresh'}
                    >
                        <RefreshCcw className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Budget Progress Section */}
            <div className="p-6">
                <div className="flex items-center gap-8">
                    {/* Spent Amount - Left Side */}
                    <div className="shrink-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {isRTL ? 'المبلغ الذي تم إنفاقه' : 'Amount spent'}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(budget.amount_spent, budget.currency)}
                        </p>
                    </div>

                    {/* Progress Bar - Middle */}
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${percentage >= 100
                                    ? 'bg-red-500'
                                    : percentage >= 80
                                        ? 'bg-orange-500'
                                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                    }`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        {/* Labels below progress bar */}
                        <div className="flex justify-between mt-2 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="text-gray-500">{isRTL ? 'مبلغ الميزانية:' : 'Budget amount:'}</span>{' '}
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(budget.budget_amount, budget.currency)}
                                </span>
                            </p>
                            <p className={`font-semibold ${percentage >= 100
                                ? 'text-red-600 dark:text-red-400'
                                : percentage >= 80
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-purple-600 dark:text-purple-400'
                                }`}>
                                {percentage >= 100
                                    ? (isRTL
                                        ? 'لقد وصلت إلى 100% من ميزانيتك'
                                        : "You've reached 100% of your budget")
                                    : (isRTL
                                        ? `لقد وصلت إلى ${percentage.toFixed(0)}% من ميزانيتك`
                                        : `You've reached ${percentage.toFixed(0)}% of your budget`)
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* No upcoming budgets message */}
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
                    {isRTL ? 'ليس لديك أي ميزانيات مقبلة.' : "You don't have any upcoming budgets."}
                </p>
            </div>

            {/* Footer - Manage Link */}
            <div className="px-6 pb-6">
                <button
                    onClick={onManageBudgets}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                    {isRTL ? 'إدارة ميزانيات الحساب' : 'Manage account budgets'}
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default CampaignBudgetProgressCard;
