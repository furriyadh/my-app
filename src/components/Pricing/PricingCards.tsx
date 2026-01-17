"use client";

import { useState } from "react";
import { Users, Crown, CheckCircle, X, Sparkles, Building2, Rocket } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";
import ElectroBorder from "@/components/ui/electro-border";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

export default function PricingCards() {
    const { language, isRTL } = useTranslation();
    const [billingMode, setBillingMode] = useState<'self-managed' | 'verified'>('self-managed');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    // Plan prices (matching billing page)
    const plans = [
        {
            id: 'free',
            nameEn: 'Free',
            nameAr: 'مجاني',
            price: 0,
            yearlyPrice: 0,
            iconColor: 'text-gray-500',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            isCurrent: true,
            featuresEn: [
                { text: '1 Campaign', included: true },
                { text: '1 Google Ads Account', included: true },
                { text: '$100 Monthly Budget', included: true },
                { text: 'Basic Reports', included: true },
                { text: 'AI Optimization', included: false },
                { text: 'Priority Support', included: false },
            ],
            featuresAr: [
                { text: 'حملة واحدة', included: true },
                { text: 'حساب Google Ads واحد', included: true },
                { text: 'ميزانية شهرية 100$', included: true },
                { text: 'تقارير أساسية', included: true },
                { text: 'تحسين بالذكاء الاصطناعي', included: false },
                { text: 'دعم ذو أولوية', included: false },
            ],
        },
        {
            id: 'basic',
            nameEn: 'Basic',
            nameAr: 'أساسي',
            price: 49,
            yearlyPrice: 490,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            featuresEn: [
                { text: '3 Campaigns', included: true },
                { text: '1 Google Ads Account', included: true },
                { text: 'Unlimited Budget', included: true },
                { text: 'Advanced Reports', included: true },
                { text: 'Email Support', included: true },
                { text: 'AI Optimization', included: false },
            ],
            featuresAr: [
                { text: '3 حملات', included: true },
                { text: 'حساب Google Ads واحد', included: true },
                { text: 'ميزانية غير محدودة', included: true },
                { text: 'تقارير متقدمة', included: true },
                { text: 'دعم بالبريد', included: true },
                { text: 'تحسين بالذكاء الاصطناعي', included: false },
            ],
        },
        {
            id: 'pro',
            nameEn: 'Pro',
            nameAr: 'احترافي',
            price: 99,
            yearlyPrice: 990,
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            isBest: true,
            featuresEn: [
                { text: '10 Campaigns', included: true },
                { text: '3 Google Ads Accounts', included: true },
                { text: 'Unlimited Budget', included: true },
                { text: 'Advanced AI Optimization', included: true },
                { text: 'Priority Support', included: true },
                { text: 'Custom Reports', included: true },
            ],
            featuresAr: [
                { text: '10 حملات', included: true },
                { text: '3 حسابات Google Ads', included: true },
                { text: 'ميزانية غير محدودة', included: true },
                { text: 'تحسين متقدم بالذكاء الاصطناعي', included: true },
                { text: 'دعم ذو أولوية', included: true },
                { text: 'تقارير مخصصة', included: true },
            ],
        },
        {
            id: 'agency',
            nameEn: 'Agency',
            nameAr: 'وكالة',
            price: 249,
            yearlyPrice: 2490,
            iconColor: 'text-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            featuresEn: [
                { text: 'Unlimited Campaigns', included: true },
                { text: '10 Google Ads Accounts', included: true },
                { text: 'Unlimited Budget', included: true },
                { text: 'Advanced AI Optimization', included: true },
                { text: 'Client Dashboard', included: true },
                { text: 'White Label', included: true },
            ],
            featuresAr: [
                { text: 'حملات غير محدودة', included: true },
                { text: '10 حسابات Google Ads', included: true },
                { text: 'ميزانية غير محدودة', included: true },
                { text: 'تحسين متقدم بالذكاء الاصطناعي', included: true },
                { text: 'لوحة تحكم العملاء', included: true },
                { text: 'علامة بيضاء', included: true },
            ],
        },
        {
            id: 'enterprise',
            nameEn: 'Enterprise',
            nameAr: 'مؤسسي',
            price: 'Custom',
            yearlyPrice: 'Custom',
            iconColor: 'text-emerald-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            isEnterprise: true,
            featuresEn: [
                { text: 'Unlimited Campaigns', included: true },
                { text: 'Unlimited Accounts', included: true },
                { text: 'Unlimited Budget', included: true },
                { text: 'Dedicated Account Manager', included: true },
                { text: 'API + Custom Integrations', included: true },
                { text: 'Guaranteed SLA', included: true },
            ],
            featuresAr: [
                { text: 'حملات غير محدودة', included: true },
                { text: 'حسابات غير محدودة', included: true },
                { text: 'ميزانية غير محدودة', included: true },
                { text: 'مدير حساب مخصص', included: true },
                { text: 'API + تكاملات مخصصة', included: true },
                { text: 'SLA مضمون', included: true },
            ],
        },
    ];

    const verifiedFeatures = language === 'ar' ? [
        "حسابات إعلانية موثوقة عالية الثقة",
        "لا خطر تعليق - مضمون",
        "صور ولافتات إعلانية بالذكاء الاصطناعي",
        "نسخ وعناوين إعلانية مكتوبة بالذكاء الاصطناعي",
        "إعداد حملة كامل بالذكاء الاصطناعي",
        "بحث الكلمات المفتاحية واستراتيجية العطاءات",
        "تحسين في الوقت الفعلي على مدار الساعة",
        "مدير حساب مخصص",
        "دعم وتقارير ذات أولوية",
        "حملات ومجموعات إعلانية غير محدودة"
    ] : [
        "Verified High-Trust Ad Accounts",
        "No Suspension Risk - Guaranteed",
        "AI-Generated Ad Images & Banners",
        "AI-Written Ad Copy & Headlines",
        "Complete Campaign Setup by AI",
        "Keyword Research & Bid Strategy",
        "Real-time 24/7 Optimization",
        "Dedicated Account Manager",
        "Priority Support & Reporting",
        "Unlimited Campaigns & Ad Groups"
    ];

    const getIcon = (id: string) => {
        switch (id) {
            case 'free': return <Rocket className="w-5 h-5" />;
            case 'basic': return <Users className="w-5 h-5" />;
            case 'pro': return <Crown className="w-5 h-5" />;
            case 'agency': return <Building2 className="w-5 h-5" />;
            case 'enterprise': return <Sparkles className="w-5 h-5" />;
            default: return <Users className="w-5 h-5" />;
        }
    };

    return (
        <Dialog>
            <section className="py-8 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="container mx-auto max-w-[1440px]">

                    {/* Section 1: Two Ways to Manage Your Ads */}
                    <div className="mb-12 text-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            {language === 'ar' ? 'طريقتان لإدارة إعلاناتك' : 'Two Ways to Manage Your Ads'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            {/* Self-Managed */}
                            <button
                                onClick={() => setBillingMode('self-managed')}
                                className={`relative p-6 rounded-xl border-2 text-left transition-all backdrop-blur-xl ${billingMode === 'self-managed'
                                    ? 'border-primary-500 bg-[#0a0f1a]/75'
                                    : 'border-white/10 hover:border-white/20 bg-[#0a0f1a]/75'
                                    }`}
                            >
                                {billingMode === 'self-managed' && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle className="w-5 h-5 text-primary-500" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">
                                        {language === 'ar' ? 'الإدارة الذاتية' : 'Self-Managed'}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">
                                    {language === 'ar'
                                        ? 'استخدم حساباتك الخاصة مع اشتراك شهري'
                                        : 'Use your own accounts with monthly subscription'}
                                </p>
                                <p className="text-primary-600 dark:text-primary-400 font-semibold">
                                    {language === 'ar' ? 'اشتراك شهري' : 'Monthly Subscription'}
                                </p>
                            </button>

                            {/* Verified Accounts */}
                            <button
                                onClick={() => setBillingMode('verified')}
                                className={`relative p-6 rounded-xl border-2 text-left transition-all backdrop-blur-xl ${billingMode === 'verified'
                                    ? 'border-purple-500 bg-[#0a0f1a]/75'
                                    : 'border-white/10 hover:border-white/20 bg-[#0a0f1a]/75'
                                    }`}
                            >
                                {/* Most Popular Badge */}
                                <div className="absolute -top-3 right-4">
                                    <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                                    </span>
                                </div>
                                {billingMode === 'verified' && (
                                    <div className="absolute top-4 right-4">
                                        <CheckCircle className="w-5 h-5 text-purple-500" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="font-semibold text-white">
                                        {language === 'ar' ? 'حساباتنا الموثوقة' : 'Our Verified Accounts'}
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">
                                    {language === 'ar'
                                        ? 'حسابات موثوقة متميزة - لا خطر تعليق'
                                        : 'Premium verified accounts - No suspension risk'}
                                </p>
                                <p className="text-purple-600 dark:text-purple-400 font-semibold">
                                    {language === 'ar' ? 'عمولة 20% فقط' : '20% Commission Only'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    {language === 'ar' ? 'بدون رسوم شهرية' : 'No monthly fees'}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Choose Your Plan (Only for Self-Managed) */}
                    {billingMode === 'self-managed' && (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-6 flex-wrap gap-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {language === 'ar' ? 'اختر خطتك' : 'Choose Your Plan'}
                                </h2>

                                {/* Monthly/Yearly Toggle */}
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                                    <button
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly'
                                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {language === 'ar' ? 'شهري' : 'Monthly'}
                                    </button>
                                    <button
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        {language === 'ar' ? 'سنوي' : 'Yearly'}
                                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">-17%</span>
                                    </button>
                                </div>
                            </div>

                            {/* Plans Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                {plans.map((plan) => {
                                    const CardContent = (
                                        <>
                                            {/* Best Badge */}
                                            {plan.isBest && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                                    <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        {language === 'ar' ? 'الأفضل' : 'Best'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Current Badge */}
                                            {plan.isCurrent && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                                        {language === 'ar' ? 'الحالي' : 'Current'}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Plan Header */}
                                            <div className="flex items-center gap-2 mb-4 mt-2">
                                                <div className={`w-8 h-8 rounded-lg ${plan.bgColor} flex items-center justify-center ${plan.iconColor}`}>
                                                    {getIcon(plan.id)}
                                                </div>
                                                <h3 className="font-bold text-white">
                                                    {language === 'ar' ? plan.nameAr : plan.nameEn}
                                                </h3>
                                            </div>

                                            {/* Price */}
                                            <div className="mb-4">
                                                {plan.isEnterprise ? (
                                                    <span className="text-2xl font-bold text-white">
                                                        {language === 'ar' ? 'مخصص' : 'Custom'}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="text-3xl font-bold text-white">
                                                            ${billingCycle === 'monthly' ? plan.price : plan.yearlyPrice}
                                                        </span>
                                                        <span className="text-gray-500 text-sm">/{billingCycle === 'monthly' ? (language === 'ar' ? 'شهر' : 'mo') : (language === 'ar' ? 'سنة' : 'yr')}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-2 mb-6">
                                                {(language === 'ar' ? plan.featuresAr : plan.featuresEn).map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm">
                                                        {feature.included ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        )}
                                                        <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                                                            {feature.text}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA Button */}
                                            {/* CTA Button */}
                                            {plan.isEnterprise ? (
                                                <Link
                                                    href="/contact"
                                                    className={`block w-full py-2.5 rounded-lg text-center font-medium transition-all ${plan.isCurrent
                                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                        }`}
                                                >
                                                    {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                                                </Link>
                                            ) : (
                                                <DialogTrigger asChild>
                                                    <button
                                                        className={`block w-full py-2.5 rounded-lg text-center font-medium transition-all ${plan.isCurrent
                                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default'
                                                            : plan.isBest
                                                                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                                            }`}
                                                    >
                                                        {plan.isCurrent
                                                            ? (language === 'ar' ? 'الحالي' : 'Current')
                                                            : (language === 'ar' ? 'ترقية' : 'Upgrade')}
                                                    </button>
                                                </DialogTrigger>
                                            )}
                                        </>
                                    );

                                    if (plan.isBest) {
                                        return (
                                            <ElectroBorder
                                                key={plan.id}
                                                borderColor="#a855f7"
                                                borderWidth={2}
                                                radius="0.75rem"
                                                className="bg-[#0a0f1a]/75 backdrop-blur-xl p-5 hover:shadow-lg transition-all h-full"
                                            >
                                                {CardContent}
                                            </ElectroBorder>
                                        );
                                    }

                                    return (
                                        <div
                                            key={plan.id}
                                            className="relative bg-[#0a0f1a]/75 backdrop-blur-xl rounded-xl border border-white/10 p-5 hover:shadow-lg transition-all h-full"
                                        >
                                            {CardContent}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Verified Accounts Info (When selected) */}
                    {billingMode === 'verified' && (
                        <div className="max-w-md mx-auto">
                            <ElectroBorder
                                borderColor="#a855f7"
                                borderWidth={2}
                                radius="1rem"
                                className="bg-[#0a0f1a]/75 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative"
                            >
                                {/* Most Popular Badge */}
                                <div className="flex justify-center mb-4">
                                    <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                                    </span>
                                </div>

                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Crown className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        {language === 'ar' ? 'حسابات موثوقة' : 'Verified Accounts'}
                                    </h3>
                                </div>

                                {/* Price */}
                                <div className="mb-2">
                                    <span className="text-4xl font-bold text-purple-400">20%</span>
                                    <span className="text-gray-400 ml-2">{language === 'ar' ? 'عمولة فقط' : 'commission only'}</span>
                                </div>
                                <p className="text-green-400 text-sm mb-6">
                                    {language === 'ar' ? 'بدون رسوم شهرية' : 'No monthly fees'}
                                </p>

                                {/* Features */}
                                <ul className="space-y-3 mb-6">
                                    {verifiedFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3">
                                            <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <DialogTrigger asChild>
                                    <button
                                        className="block w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold text-center transition-all shadow-lg shadow-purple-500/30"
                                    >
                                        {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                                    </button>
                                </DialogTrigger>

                                {/* Guarantee */}
                                <p className="text-center text-gray-400 text-sm mt-4">
                                    {language === 'ar' ? 'ضمان استرداد الأموال لمدة 30 يوماً' : '30-day money-back guarantee'}
                                </p>
                            </ElectroBorder>
                        </div>
                    )}
                </div>
                <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                    <Login />
                </DialogContent>
            </section>
        </Dialog>
    );
}
