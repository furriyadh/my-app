'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CreditCard,
    Zap,
    Crown,
    Building2,
    Users,
    Check,
    X,
    Download,
    Plus,
    Sparkles,
    TrendingUp,
    Calendar,
    Receipt,
    Gift
} from 'lucide-react';
import { getCurrentPlanLimits, setCurrentPlan, PLAN_LIMITS, type PlanLimits } from '@/lib/services/PlanService';
import { supabase } from '@/lib/supabase';
import { FurriyadhPaymentGateway } from '@/components/furriyadh/FurriyadhPaymentGateway';
import { CampaignBudgetProgressCard } from '@/components/furriyadh/CampaignBudgetProgressCard';
import { FurriyadhPromotionalCard } from '@/components/furriyadh/FurriyadhPromotionalCard';

const BillingPage: React.FC = () => {
    const router = useRouter();
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [isRTL, setIsRTL] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [currentPlanLimits, setCurrentPlanLimits] = useState<PlanLimits>(PLAN_LIMITS.free);
    const [accountsCount, setAccountsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // ❓ Confirmation modal (before changing plan)
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        planId: string;
        planName: string;
        planNameAr: string;
    }>({ show: false, planId: '', planName: '', planNameAr: '' });

    // ✅ Success modal (after confirming plan change)
    const [successModal, setSuccessModal] = useState<{
        show: boolean;
        planName: string;
        planNameAr: string;
    }>({ show: false, planName: '', planNameAr: '' });

    // 🔄 Billing Mode: 'self_managed' (subscription) or 'managed' (20% commission)
    const [billingMode, setBillingMode] = useState<'self_managed' | 'managed'>('self_managed');

    // 🚀 Managed Account Setup Modal
    const [showManagedSetup, setShowManagedSetup] = useState(false);
    const searchParams = useSearchParams();

    // 👤 User email for Furriyadh Balance Card
    const [userEmail, setUserEmail] = useState<string>('');

    // 📊 Managed account ID for progress cards
    const [managedAccountId, setManagedAccountId] = useState<string>('');

    useEffect(() => {
        const updateLanguage = () => {
            const savedLanguage = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
            if (savedLanguage) {
                setLanguage(savedLanguage);
                setIsRTL(savedLanguage === 'ar');
            }
        };
        updateLanguage();
        window.addEventListener('languageChange', updateLanguage);

        // Load current plan limits
        setCurrentPlanLimits(getCurrentPlanLimits());

        // Fetch real accounts count from Supabase
        fetchAccountsCount();

        // Fetch user email from Supabase auth
        fetchUserEmail();

        return () => window.removeEventListener('languageChange', updateLanguage);
    }, []);

    // Fetch user email from Supabase
    const fetchUserEmail = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.email) {
                setUserEmail(user.email);
                // Also fetch managed account ID for this user
                fetchManagedAccountId(user.email);
            }
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    };

    // Fetch Furriyadh managed account ID
    const fetchManagedAccountId = async (email: string) => {
        try {
            const { data, error } = await supabase
                .from('furriyadh_customer_accounts')
                .select('id')
                .eq('user_email', email)
                .single();

            if (data?.id) {
                setManagedAccountId(data.id);
                console.log('📊 Furriyadh Account ID:', data.id);
            } else if (error) {
                console.log('ℹ️ No Furriyadh account found for user:', email);
            }
        } catch (err) {
            console.error('Error fetching managed account:', err);
        }
    };

    // Handle ?setup=managed query parameter
    useEffect(() => {
        const setup = searchParams.get('setup');
        if (setup === 'managed') {
            setBillingMode('managed');
            setShowManagedSetup(true);
        }
    }, [searchParams]);

    const fetchAccountsCount = async () => {
        try {
            setIsLoading(true);
            const { data: clientRequests, error } = await supabase
                .from('client_requests')
                .select('customer_id, status')
                .in('status', ['ACTIVE', 'PENDING', 'ENABLED']);

            if (error) {
                console.error('Error fetching accounts:', error);
                setAccountsCount(0);
            } else {
                setAccountsCount(clientRequests?.length || 0);
            }
        } catch (err) {
            console.error('Error:', err);
            setAccountsCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 1: Show confirmation modal
    const handleUpgrade = (planId: string) => {
        if (planId === 'enterprise') {
            window.open('mailto:sales@furriyadh.com?subject=Enterprise Plan Inquiry', '_blank');
            return;
        }

        // Show confirmation modal
        const plan = PLAN_LIMITS[planId];
        setConfirmModal({
            show: true,
            planId: planId,
            planName: plan.planName,
            planNameAr: plan.planNameAr || plan.planName,
        });
    };

    // Step 2: Confirm and apply plan change
    const confirmPlanChange = () => {
        const planId = confirmModal.planId;

        // Apply the plan change
        setCurrentPlan(planId);
        setCurrentPlanLimits(PLAN_LIMITS[planId]);
        setSelectedPlan(planId);

        // Close confirm modal
        setConfirmModal({ show: false, planId: '', planName: '', planNameAr: '' });

        // Show success modal
        setSuccessModal({
            show: true,
            planName: confirmModal.planName,
            planNameAr: confirmModal.planNameAr,
        });
    };

    const plans = [
        {
            id: 'free',
            name: isRTL ? 'مجاني' : 'Free',
            icon: Zap,
            price: 0,
            yearlyPrice: 0,
            color: 'gray',
            current: currentPlanLimits.planId === 'free',
            features: [
                { text: isRTL ? '1 حملة' : '1 Campaign', included: true },
                { text: isRTL ? '1 حساب Google Ads' : '1 Google Ads Account', included: true },
                { text: isRTL ? 'ميزانية شهرية $100' : '$100 Monthly Budget', included: true },
                { text: isRTL ? 'تقارير أساسية' : 'Basic Reports', included: true },
                { text: isRTL ? 'تحسين AI' : 'AI Optimization', included: false },
                { text: isRTL ? 'دعم أولوية' : 'Priority Support', included: false },
            ]
        },
        {
            id: 'basic',
            name: 'Basic',
            icon: CreditCard,
            price: 49,
            yearlyPrice: 490,
            color: 'blue',
            current: currentPlanLimits.planId === 'basic',
            features: [
                { text: isRTL ? '3 حملات' : '3 Campaigns', included: true },
                { text: isRTL ? '1 حساب Google Ads' : '1 Google Ads Account', included: true },
                { text: isRTL ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: isRTL ? 'تقارير متقدمة' : 'Advanced Reports', included: true },
                { text: isRTL ? 'دعم البريد الإلكتروني' : 'Email Support', included: true },
                { text: isRTL ? 'تحسين AI' : 'AI Optimization', included: false },
            ]
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: Crown,
            price: 99,
            yearlyPrice: 990,
            color: 'primary',
            popular: true,
            current: currentPlanLimits.planId === 'pro',
            features: [
                { text: isRTL ? '10 حملات' : '10 Campaigns', included: true },
                { text: isRTL ? '3 حسابات Google Ads' : '3 Google Ads Accounts', included: true },
                { text: isRTL ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: isRTL ? 'تحسين AI متقدم' : 'Advanced AI Optimization', included: true },
                { text: isRTL ? 'دعم أولوية' : 'Priority Support', included: true },
                { text: isRTL ? 'تقارير مخصصة' : 'Custom Reports', included: true },
            ]
        },
        {
            id: 'agency',
            name: 'Agency',
            icon: Users,
            price: 249,
            yearlyPrice: 2490,
            color: 'orange',
            current: currentPlanLimits.planId === 'agency',
            features: [
                { text: isRTL ? 'حملات غير محدودة' : 'Unlimited Campaigns', included: true },
                { text: isRTL ? '10 حسابات Google Ads' : '10 Google Ads Accounts', included: true },
                { text: isRTL ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: isRTL ? 'تحسين AI متقدم' : 'Advanced AI Optimization', included: true },
                { text: isRTL ? 'لوحة تحكم العملاء' : 'Client Dashboard', included: true },
                { text: isRTL ? 'White Label' : 'White Label', included: true },
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            icon: Building2,
            price: -1, // Custom
            yearlyPrice: -1,
            color: 'purple',
            current: currentPlanLimits.planId === 'enterprise',
            features: [
                { text: isRTL ? 'حملات غير محدودة' : 'Unlimited Campaigns', included: true },
                { text: isRTL ? 'حسابات غير محدودة' : 'Unlimited Accounts', included: true },
                { text: isRTL ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: isRTL ? 'مدير حساب مخصص' : 'Dedicated Account Manager', included: true },
                { text: isRTL ? 'API + تكاملات مخصصة' : 'API + Custom Integrations', included: true },
                { text: isRTL ? 'SLA مضمون' : 'Guaranteed SLA', included: true },
            ]
        }
    ];

    const invoices = [
        { id: 'INV-001', date: 'Dec 1, 2024', plan: 'Pro Plan', amount: 99, status: 'paid' },
        { id: 'INV-002', date: 'Nov 1, 2024', plan: 'Pro Plan', amount: 99, status: 'paid' },
        { id: 'INV-003', date: 'Oct 1, 2024', plan: 'Basic Plan', amount: 49, status: 'paid' },
    ];

    return (
        <>
            <div className="mb-[25px]">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-[25px]">
                    <div>
                        <h5 className="!mb-0 text-lg font-bold text-gray-900 dark:text-white">
                            {isRTL ? 'الفوترة والاشتراكات' : 'Billing & Subscriptions'}
                        </h5>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {isRTL ? 'إدارة خطتك وطرق الدفع والفواتير' : 'Manage your plan, payment methods, and invoices'}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px] mb-[25px]">
                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-primary-50 dark:bg-primary-900/10">
                                <Crown className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'الخطة الحالية' : 'Current Plan'}</p>
                                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">{currentPlanLimits.planName}</h5>
                            </div>
                        </div>
                    </div>

                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'الأيام المتبقية' : 'Days Remaining'}</p>
                                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">14</h5>
                            </div>
                        </div>
                    </div>

                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'الحسابات المُدارة' : 'Managed Accounts'}</p>
                                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">
                                    {isLoading ? '...' : `${accountsCount}/${currentPlanLimits.maxAccounts === -1 ? '∞' : currentPlanLimits.maxAccounts}`}
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                                <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{isRTL ? 'إجمالي الإنفاق' : 'Total Spent'}</p>
                                <h5 className="!mb-0 !mt-[5px] !text-[20px] font-bold text-gray-900 dark:text-white">$0.00</h5>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔄 Billing Mode Toggle */}
                <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md mb-[25px]">
                    <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {isRTL ? 'اختر طريقة العمل' : 'Choose Your Billing Mode'}
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Self-Managed Mode */}
                        <button
                            onClick={() => setBillingMode('self_managed')}
                            className={`relative p-6 rounded-xl border-2 transition-all text-left ${billingMode === 'self_managed'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            {billingMode === 'self_managed' && (
                                <div className="absolute top-3 right-3">
                                    <Check className="w-5 h-5 text-blue-500" />
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {isRTL ? 'إدارة ذاتية' : 'Self-Managed'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {isRTL ? 'استخدم حساباتك الخاصة مع اشتراك شهري' : 'Use your own accounts with monthly subscription'}
                            </p>
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {isRTL ? 'اشتراك شهري' : 'Monthly Subscription'}
                            </div>
                        </button>

                        {/* Managed Mode */}
                        <button
                            onClick={() => setBillingMode('managed')}
                            className={`relative p-6 rounded-xl border-2 transition-all text-left ${billingMode === 'managed'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                                </span>
                            </div>
                            {billingMode === 'managed' && (
                                <div className="absolute top-3 right-3">
                                    <Check className="w-5 h-5 text-purple-500" />
                                </div>
                            )}
                            <div className="flex items-center gap-3 mb-3 mt-2">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                    <Crown className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {isRTL ? 'حساباتنا الموثقة' : 'Our Verified Accounts'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {isRTL ? 'حسابات موثقة عالية الثقة - بدون خطر إيقاف' : 'Premium verified accounts - No suspension risk'}
                            </p>
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {isRTL ? '20% عمولة فقط' : '20% Commission Only'}
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {isRTL ? 'بدون رسوم شهرية' : 'No monthly fees'}
                            </p>
                        </button>
                    </div>
                </div>

                {/* 🏢 Furriyadh Managed Account Section */}
                {billingMode === 'managed' && userEmail && (
                    <div className="mb-[25px]">
                        <div id="account-balance-section">
                            <FurriyadhPaymentGateway
                                userEmail={userEmail}
                                isRTL={isRTL}
                                currentBalance={0}
                                onPaymentSuccess={(amount, method) => {
                                    console.log(`Payment success: $${amount} via ${method}`);
                                }}
                            />
                        </div>

                        {/* Campaign Budget & Promotional Cards - Side by Side */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Campaign Budget Card */}
                            <div>
                                <h5 className="!mb-4 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-purple-500" />
                                    {isRTL ? 'ميزانيات الحملات' : 'Campaign Budgets'}
                                </h5>
                                <CampaignBudgetProgressCard
                                    accountId={managedAccountId}
                                    userEmail={userEmail}
                                    isRTL={isRTL}
                                    onManageBudgets={() => {
                                        const balanceSection = document.getElementById('account-balance-section');
                                        if (balanceSection) {
                                            balanceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                    }}
                                />
                            </div>

                            {/* Promotional Credits Card */}
                            <div>
                                <h5 className="!mb-4 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Gift className="w-6 h-6 text-purple-500" />
                                    {isRTL ? 'احصل على رصيد مجاني' : 'Get Free Credit'}
                                </h5>
                                <FurriyadhPromotionalCard
                                    userEmail={userEmail}
                                    isRTL={isRTL}
                                    currentSpend={0}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Self-Managed Plans Section */}
                {billingMode === 'self_managed' && (
                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md mb-[25px]">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <div>
                                <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                    {isRTL ? 'اختر خطتك' : 'Choose Your Plan'}
                                </h6>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {isRTL ? 'وفّر 17% مع الاشتراك السنوي' : 'Save 17% with annual billing'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'monthly'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {isRTL ? 'شهري' : 'Monthly'}
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {isRTL ? 'سنوي' : 'Yearly'}
                                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                                        -17%
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Pricing Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative border-2 rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${plan.popular
                                        ? 'border-primary-500 dark:border-primary-400'
                                        : plan.current
                                            ? 'border-green-500 dark:border-green-400'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-primary-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                {isRTL ? 'الأفضل' : 'Best'}
                                            </span>
                                        </div>
                                    )}

                                    {plan.current && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                                                {isRTL ? 'الحالية' : 'Current'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`p-2 rounded-lg ${plan.color === 'primary' ? 'bg-primary-50 dark:bg-primary-900/10' :
                                            plan.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/10' :
                                                plan.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/10' :
                                                    plan.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/10' :
                                                        'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            <plan.icon className={`w-4 h-4 ${plan.color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
                                                plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                                    plan.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                                        plan.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                                            'text-gray-600 dark:text-gray-400'
                                                }`} />
                                        </div>
                                        <h4 className="text-md font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
                                    </div>

                                    <div className="mb-4">
                                        {plan.price === -1 ? (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {isRTL ? 'مخصص' : 'Custom'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    ${billingCycle === 'monthly' ? plan.price : plan.yearlyPrice}
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                    /{billingCycle === 'monthly' ? (isRTL ? 'شهر' : 'mo') : (isRTL ? 'سنة' : 'yr')}
                                                </span>
                                            </div>
                                        )}
                                        {billingCycle === 'yearly' && plan.price > 0 && (
                                            <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                                                {isRTL ? `وفّر $${(plan.price * 12) - plan.yearlyPrice}` : `Save $${(plan.price * 12) - plan.yearlyPrice}`}
                                            </p>
                                        )}
                                    </div>

                                    <ul className="space-y-2 mb-4">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-xs">
                                                {feature.included ? (
                                                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <X className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                                )}
                                                <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        disabled={plan.current}
                                        className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${plan.current
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                            : plan.popular
                                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                : plan.price === -1
                                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                    : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {plan.current
                                            ? (isRTL ? 'الحالية' : 'Current')
                                            : plan.price === -1
                                                ? (isRTL ? 'تواصل معنا' : 'Contact Us')
                                                : plan.price === 0
                                                    ? (isRTL ? 'ابدأ مجانًا' : 'Start Free')
                                                    : (isRTL ? 'ترقية' : 'Upgrade')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                {/* Payment Method & Billing Address */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] mb-[25px]">
                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                        <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                        </h6>

                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">VISA</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{isRTL ? 'تنتهي' : 'Expires'} 12/2025</p>
                                    </div>
                                </div>
                                <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                                    {isRTL ? 'الافتراضية' : 'Default'}
                                </span>
                            </div>
                        </div>

                        <button className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm">
                            <Plus className="w-4 h-4" />
                            {isRTL ? 'إضافة طريقة دفع' : 'Add payment method'}
                        </button>
                    </div>

                    <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                        <h6 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'عنوان الفوترة' : 'Billing Address'}
                        </h6>

                        <div className="text-gray-600 dark:text-gray-400 text-sm space-y-1 mb-4">
                            <p className="font-medium text-gray-900 dark:text-white">Furriyadh Company</p>
                            <p>123 Business Street</p>
                            <p>Riyadh, Saudi Arabia</p>
                            <p>12345</p>
                        </div>

                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm">
                            {isRTL ? 'تعديل العنوان' : 'Edit Address'}
                        </button>
                    </div>
                </div>

                {/* Billing History */}
                <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                    <div className="flex items-center justify-between mb-4">
                        <h6 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isRTL ? 'سجل الفواتير' : 'Billing History'}
                        </h6>
                        <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium text-sm">
                            {isRTL ? 'تحميل الكل' : 'Download All'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الفاتورة' : 'Invoice'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'التاريخ' : 'Date'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الخطة' : 'Plan'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'المبلغ' : 'Amount'}
                                    </th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                        {isRTL ? 'الحالة' : 'Status'}
                                    </th>
                                    <th className="text-right py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{invoice.date}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{invoice.plan}</td>
                                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">${invoice.amount}.00</td>
                                        <td className="py-3 px-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                                {isRTL ? 'مدفوع' : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ❓ Plan Change Confirmation Modal */}
            {confirmModal.show && (
                <div
                    className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[60] p-4 ${isRTL ? 'lg:pr-[250px]' : 'lg:pl-[250px]'}`}
                    onClick={() => setConfirmModal({ show: false, planId: '', planName: '', planNameAr: '' })}
                >
                    <div
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 rounded-2xl w-full max-w-md relative shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Question Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Crown className="w-8 h-8 text-blue-500" />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            {isRTL ? 'تأكيد تغيير الخطة' : 'Confirm Plan Change'}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
                            {isRTL
                                ? `هل أنت متأكد من التغيير إلى خطة ${confirmModal.planNameAr}؟`
                                : `Are you sure you want to switch to the ${confirmModal.planName} plan?`
                            }
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ show: false, planId: '', planName: '', planNameAr: '' })}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={confirmPlanChange}
                                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                            >
                                {isRTL ? 'تأكيد' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Plan Change Success Modal */}
            {successModal.show && (
                <div
                    className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[60] p-4 ${isRTL ? 'lg:pr-[250px]' : 'lg:pl-[250px]'}`}
                    onClick={() => setSuccessModal({ show: false, planName: '', planNameAr: '' })}
                >
                    <div
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 rounded-2xl w-full max-w-md relative shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-500" />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            {isRTL ? 'تم تحديث الخطة' : 'Plan Updated'}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-2 text-sm">
                            {isRTL
                                ? `تم تغيير خطتك إلى ${successModal.planNameAr} بنجاح!`
                                : `Your plan has been changed to ${successModal.planName} successfully!`
                            }
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-center mb-6 text-xs">
                            {isRTL ? '(سيتم تفعيل الدفع لاحقاً)' : '(Payment will be enabled later)'}
                        </p>

                        {/* Button */}
                        <button
                            onClick={() => setSuccessModal({ show: false, planName: '', planNameAr: '' })}
                            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                        >
                            {isRTL ? 'حسناً' : 'Got it'}
                        </button>
                    </div>
                </div>
            )}

            {/* 🚀 Managed Account Setup Modal */}
            {showManagedSetup && (
                <div
                    className={`fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-[60] p-4 ${isRTL ? 'lg:pr-[250px]' : 'lg:pl-[250px]'}`}
                    onClick={() => setShowManagedSetup(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 sm:p-8 rounded-2xl w-full max-w-lg relative shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Crown Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            {isRTL ? 'مرحباً بك في الحسابات المُدارة!' : 'Welcome to Managed Accounts!'}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 text-sm">
                            {isRTL
                                ? 'أنت على وشك تفعيل نشر الحملات عبر حساباتنا الموثقة. ستستفيد من حماية ضد الإيقاف ودرجة ثقة عالية.'
                                : 'You are about to activate campaign publishing through our verified accounts. You will benefit from suspension protection and high trust score.'
                            }
                        </p>

                        {/* Commission Info */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 text-purple-700 dark:text-purple-300">
                                <span className="text-2xl font-bold">20%</span>
                                <span className="text-sm">{isRTL ? 'رسوم إدارة الحملة' : 'campaign management fee'}</span>
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">
                                {isRTL ? 'تُحتسب من الميزانية الإعلانية فقط • بدون رسوم شهرية' : 'Calculated from ad budget only • No monthly fees'}
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                            {[
                                { en: 'Premium verified ad accounts', ar: 'حسابات إعلانية موثقة' },
                                { en: 'No suspension risk - guaranteed', ar: 'بدون خطر إيقاف - مضمون' },
                                { en: '24/7 AI optimization', ar: 'تحسين مستمر بالذكاء الاصطناعي' },
                            ].map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{isRTL ? feature.ar : feature.en}</span>
                                </div>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowManagedSetup(false);
                                    // Clear the query param
                                    router.push('/google-ads/billing');
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                onClick={async () => {
                                    // Save billing mode to database
                                    const userDataStr = localStorage.getItem('user');
                                    const userData = userDataStr ? JSON.parse(userDataStr) : null;
                                    const userId = userData?.id || userData?.user?.id;
                                    const userEmail = userData?.email || userData?.user?.email;

                                    if (userId) {
                                        await fetch('/api/billing-mode', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ userId, userEmail, billingMode: 'furriyadh_managed' })
                                        });
                                        localStorage.setItem('billing_mode', 'furriyadh_managed');
                                    }

                                    setShowManagedSetup(false);

                                    // Check if there's a pending campaign
                                    const pendingCampaign = localStorage.getItem('pending_managed_campaign');
                                    if (pendingCampaign) {
                                        localStorage.removeItem('pending_managed_campaign');
                                        // Return to preview to publish
                                        router.push('/google-ads/campaigns/preview');
                                    } else {
                                        router.push('/google-ads/billing');
                                    }
                                }}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors font-medium"
                            >
                                {isRTL ? 'تفعيل الآن' : 'Activate Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BillingPage;
