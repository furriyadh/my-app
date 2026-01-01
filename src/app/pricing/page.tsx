"use client";

import React, { useState } from "react";
import Navbar from "@/components/FrontPage/Navbar";
import Footer from "@/components/FrontPage/Footer";
import Cta from "@/components/FrontPage/Cta";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
    Zap, CreditCard, Crown, Users, Building2, Check, X, Sparkles, Star, Shield, Clock, Rocket
} from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const { language, isRTL } = useTranslation();
    const [billingMode, setBillingMode] = useState<'self_managed' | 'verified'>('verified');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const selfManagedPlans = [
        {
            id: 'free',
            name: language === 'ar' ? 'مجاني' : 'Free',
            icon: Zap,
            price: 0,
            yearlyPrice: 0,
            color: 'gray',
            features: [
                { text: language === 'ar' ? '1 حملة' : '1 Campaign', included: true },
                { text: language === 'ar' ? '1 حساب Google Ads' : '1 Google Ads Account', included: true },
                { text: language === 'ar' ? 'ميزانية شهرية $100' : '$100 Monthly Budget', included: true },
                { text: language === 'ar' ? 'تقارير أساسية' : 'Basic Reports', included: true },
                { text: language === 'ar' ? 'تحسين AI' : 'AI Optimization', included: false },
                { text: language === 'ar' ? 'دعم أولوية' : 'Priority Support', included: false },
            ]
        },
        {
            id: 'basic',
            name: 'Basic',
            icon: CreditCard,
            price: 49,
            yearlyPrice: 490,
            color: 'blue',
            features: [
                { text: language === 'ar' ? '3 حملات' : '3 Campaigns', included: true },
                { text: language === 'ar' ? '1 حساب Google Ads' : '1 Google Ads Account', included: true },
                { text: language === 'ar' ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: language === 'ar' ? 'تقارير متقدمة' : 'Advanced Reports', included: true },
                { text: language === 'ar' ? 'دعم البريد الإلكتروني' : 'Email Support', included: true },
                { text: language === 'ar' ? 'تحسين AI' : 'AI Optimization', included: false },
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
            features: [
                { text: language === 'ar' ? '10 حملات' : '10 Campaigns', included: true },
                { text: language === 'ar' ? '3 حسابات Google Ads' : '3 Google Ads Accounts', included: true },
                { text: language === 'ar' ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: language === 'ar' ? 'تحسين AI متقدم' : 'Advanced AI Optimization', included: true },
                { text: language === 'ar' ? 'دعم أولوية' : 'Priority Support', included: true },
                { text: language === 'ar' ? 'تقارير مخصصة' : 'Custom Reports', included: true },
            ]
        },
        {
            id: 'agency',
            name: 'Agency',
            icon: Users,
            price: 249,
            yearlyPrice: 2490,
            color: 'orange',
            features: [
                { text: language === 'ar' ? 'حملات غير محدودة' : 'Unlimited Campaigns', included: true },
                { text: language === 'ar' ? '10 حسابات Google Ads' : '10 Google Ads Accounts', included: true },
                { text: language === 'ar' ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: language === 'ar' ? 'تحسين AI متقدم' : 'Advanced AI Optimization', included: true },
                { text: language === 'ar' ? 'لوحة تحكم العملاء' : 'Client Dashboard', included: true },
                { text: language === 'ar' ? 'White Label' : 'White Label', included: true },
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            icon: Building2,
            price: -1,
            yearlyPrice: -1,
            color: 'purple',
            features: [
                { text: language === 'ar' ? 'حملات غير محدودة' : 'Unlimited Campaigns', included: true },
                { text: language === 'ar' ? 'حسابات غير محدودة' : 'Unlimited Accounts', included: true },
                { text: language === 'ar' ? 'ميزانية غير محدودة' : 'Unlimited Budget', included: true },
                { text: language === 'ar' ? 'مدير حساب مخصص' : 'Dedicated Account Manager', included: true },
                { text: language === 'ar' ? 'API + تكاملات مخصصة' : 'API + Custom Integrations', included: true },
                { text: language === 'ar' ? 'SLA مضمون' : 'Guaranteed SLA', included: true },
            ]
        }
    ];

    const verifiedAccountFeatures = [
        { text: language === 'ar' ? 'حسابات موثقة عالية الثقة' : 'Verified High-Trust Ad Accounts', icon: Shield },
        { text: language === 'ar' ? 'لا خطر إيقاف - مضمون' : 'No Suspension Risk - Guaranteed', icon: Check },
        { text: language === 'ar' ? 'صور وبانرات إعلانية بالـ AI' : 'AI-Generated Ad Images & Banners', icon: Sparkles },
        { text: language === 'ar' ? 'نصوص وعناوين إعلانية بالـ AI' : 'AI-Written Ad Copy & Headlines', icon: Sparkles },
        { text: language === 'ar' ? 'إعداد كامل للحملة بالـ AI' : 'Complete Campaign Setup by AI', icon: Rocket },
        { text: language === 'ar' ? 'بحث الكلمات المفتاحية واستراتيجية المزايدة' : 'Keyword Research & Bid Strategy', icon: Star },
        { text: language === 'ar' ? 'تحسين 24/7 في الوقت الفعلي' : 'Real-time 24/7 Optimization', icon: Clock },
        { text: language === 'ar' ? 'مدير حساب مخصص' : 'Dedicated Account Manager', icon: Users },
        { text: language === 'ar' ? 'دعم أولوية وتقارير' : 'Priority Support & Reporting', icon: Crown },
        { text: language === 'ar' ? 'حملات ومجموعات إعلانية غير محدودة' : 'Unlimited Campaigns & Ad Groups', icon: Zap },
    ];

    return (
        <div className="front-page-body overflow-hidden bg-white dark:bg-[#0a0e19] min-h-screen" dir="ltr">
            <Navbar />

            <div className="relative z-[1]">
                {/* Background Shapes */}
                <div className="absolute top-0 w-full h-full -z-[1] overflow-hidden pointer-events-none">
                    <div className="absolute bottom-0 -z-[1] ltr:-right-[30px] rtl:-left-[30px] blur-[250px]">
                        <Image src="/images/front-pages/shape3.png" alt="shape" width={685} height={685} />
                    </div>
                    <div className="absolute -top-[220px] -z-[1] ltr:-left-[50px] rtl:-right-[50px] blur-[150px]">
                        <Image src="/images/front-pages/shape5.png" alt="shape" width={658} height={656} />
                    </div>
                </div>

                {/* Hero Section */}
                <div className="pt-[140px] md:pt-[160px] lg:pt-[180px] pb-8 text-center">
                    <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
                        <div className="inline-block mb-4">
                            <span className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 border border-purple-600/30 dark:border-purple-400/30 py-[6px] px-[18px] rounded-full text-sm font-medium bg-purple-50 dark:bg-purple-900/20">
                                <Sparkles className="w-4 h-4" />
                                {language === 'ar' ? 'أسعار بسيطة وشفافة' : 'Simple & Transparent Pricing'}
                            </span>
                        </div>
                        <h1 className="!mb-4 !text-[28px] md:!text-[36px] lg:!text-[48px] font-bold text-black dark:text-white leading-tight" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'اختر الطريقة الأنسب لك' : 'Choose The Way That Works For You'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg mb-10" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'طريقتان للبدء مع إدارة إعلانات Google المدعومة بالذكاء الاصطناعي'
                                : 'Two ways to get started with AI-powered Google Ads management'
                            }
                        </p>
                    </div>
                </div>

                {/* Billing Mode Selector - Compact Cards */}
                <div className="container 2xl:max-w-[500px] mx-auto px-[12px] pb-6">
                    <div className="grid grid-cols-2 gap-2">

                        {/* Self-Managed Mode Card */}
                        <button
                            onClick={() => setBillingMode('self_managed')}
                            className={`relative p-3 rounded-lg border transition-all duration-300 text-left ${billingMode === 'self_managed'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-blue-300'
                                }`}
                        >
                            {billingMode === 'self_managed' && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-4 h-4 text-blue-500" />
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-black dark:text-white">
                                    {language === 'ar' ? 'إدارة ذاتية' : 'Self-Managed'}
                                </h3>
                                <Users className={`w-5 h-5 ${billingMode === 'self_managed' ? 'text-blue-500' : 'text-blue-600 dark:text-blue-400'}`} />
                            </div>
                            <p className="text-gray-500 text-xs mb-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'استخدم حساباتك الخاصة' : 'Use your own accounts'}
                            </p>
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {language === 'ar' ? 'اشتراك شهري' : 'Monthly Subscription'}
                            </div>
                        </button>

                        {/* Verified Accounts Mode Card */}
                        <button
                            onClick={() => setBillingMode('verified')}
                            className={`relative p-3 pt-5 rounded-lg border transition-all duration-300 text-left ${billingMode === 'verified'
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-purple-300'
                                }`}
                        >
                            {/* Popular Badge */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    {language === 'ar' ? 'الأشهر' : 'Popular'}
                                </span>
                            </div>

                            {billingMode === 'verified' && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-4 h-4 text-purple-500" />
                                </div>
                            )}
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-black dark:text-white">
                                    {language === 'ar' ? 'حسابات موثقة' : 'Verified Accounts'}
                                </h3>
                                <Crown className={`w-5 h-5 ${billingMode === 'verified' ? 'text-purple-500' : 'text-purple-600 dark:text-purple-400'}`} />
                            </div>
                            <p className="text-gray-500 text-xs mb-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'بدون خطر إيقاف' : 'No suspension risk'}
                            </p>
                            <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {language === 'ar' ? '20% عمولة فقط' : '20% Commission Only'}
                            </div>
                        </button>
                    </div>
                </div>

                {/* Conditional Content Based on Mode */}
                <div className="container 2xl:max-w-[1200px] mx-auto px-[12px] pb-16">

                    {/* VERIFIED ACCOUNTS - Wide Premium Card */}
                    {billingMode === 'verified' && (
                        <div className="max-w-md mx-auto animate-fadeIn">
                            <div className="relative bg-white dark:bg-white/5 border-2 border-purple-500 rounded-2xl p-6 shadow-lg shadow-purple-500/10">
                                {/* Popular Badge */}
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                                        <Sparkles className="w-3 h-3" />
                                        {language === 'ar' ? 'الأشهر' : 'Most Popular'}
                                    </span>
                                </div>

                                {/* Header with Icon */}
                                <div className="flex items-center gap-3 mb-4 mt-2">
                                    <div className="p-3 rounded-xl bg-purple-500">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-lg font-bold text-black dark:text-white">
                                        {language === 'ar' ? 'حساباتنا الموثقة' : 'Verified Accounts'}
                                    </h4>
                                </div>

                                {/* Price */}
                                <div className="mb-5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">20%</span>
                                        <span className="text-gray-500 text-sm">{language === 'ar' ? 'عمولة فقط' : 'commission only'}</span>
                                    </div>
                                    <p className="text-green-600 dark:text-green-400 text-xs font-semibold mt-1">
                                        {language === 'ar' ? 'بدون رسوم شهرية' : 'No monthly fees'}
                                    </p>
                                </div>

                                {/* Features List - Same style as subscription cards */}
                                <ul className="space-y-2.5 mb-6">
                                    {verifiedAccountFeatures.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <Link
                                    href="/authentication/sign-up"
                                    className="w-full block text-center py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30"
                                >
                                    {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                                </Link>

                                <div className="text-center mt-3 text-gray-500 text-xs">
                                    {language === 'ar' ? 'ضمان استرداد 30 يوم' : '30-day money-back guarantee'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SELF-MANAGED - Subscription Plans Grid */}
                    {billingMode === 'self_managed' && (
                        <div className="animate-fadeIn">
                            {/* Monthly/Yearly Toggle */}
                            <div className="flex items-center justify-center gap-2 mb-10">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'monthly'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {language === 'ar' ? 'شهري' : 'Monthly'}
                                </button>
                                <button
                                    onClick={() => setBillingCycle('yearly')}
                                    className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${billingCycle === 'yearly'
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {language === 'ar' ? 'سنوي' : 'Yearly'}
                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">-17%</span>
                                </button>
                            </div>

                            {/* Plans Grid - 5 cards on one row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                                {selfManagedPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`relative bg-white dark:bg-white/5 border-2 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular
                                            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                                            : 'border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-600'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                                                    <Sparkles className="w-3 h-3" />
                                                    {language === 'ar' ? 'الأفضل' : 'Best'}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-2.5 rounded-xl ${plan.color === 'primary' ? 'bg-blue-50 dark:bg-blue-900/20' :
                                                plan.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                                                    plan.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20' :
                                                        plan.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20' :
                                                            'bg-gray-100 dark:bg-gray-800'
                                                }`}>
                                                <plan.icon className={`w-5 h-5 ${plan.color === 'primary' ? 'text-blue-600 dark:text-blue-400' :
                                                    plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                                        plan.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                                            plan.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                                                                'text-gray-600 dark:text-gray-400'
                                                    }`} />
                                            </div>
                                            <h4 className="text-lg font-bold text-black dark:text-white">{plan.name}</h4>
                                        </div>

                                        <div className="mb-5">
                                            {plan.price === -1 ? (
                                                <span className="text-3xl font-bold text-black dark:text-white">
                                                    {language === 'ar' ? 'مخصص' : 'Custom'}
                                                </span>
                                            ) : (
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-bold text-black dark:text-white">
                                                        ${billingCycle === 'monthly' ? plan.price : plan.yearlyPrice}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">
                                                        /{billingCycle === 'monthly' ? (language === 'ar' ? 'شهر' : 'mo') : (language === 'ar' ? 'سنة' : 'yr')}
                                                    </span>
                                                </div>
                                            )}
                                            {billingCycle === 'yearly' && plan.price > 0 && (
                                                <p className="text-green-600 dark:text-green-400 text-xs font-semibold mt-1">
                                                    {language === 'ar' ? `وفّر $${(plan.price * 12) - plan.yearlyPrice}` : `Save $${(plan.price * 12) - plan.yearlyPrice}`}
                                                </p>
                                            )}
                                        </div>

                                        <ul className="space-y-2.5 mb-6">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    {feature.included ? (
                                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                                    )}
                                                    <span className={feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Link
                                            href="/authentication/sign-up"
                                            className={`w-full block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
                                                : plan.price === -1
                                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                                    : 'border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {plan.price === -1
                                                ? (language === 'ar' ? 'تواصل معنا' : 'Contact Us')
                                                : plan.price === 0
                                                    ? (language === 'ar' ? 'ابدأ مجانًا' : 'Start Free')
                                                    : (language === 'ar' ? 'اختر الخطة' : 'Choose Plan')}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Cta />
            </div>

            <Footer />

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}
