"use client";

import React from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { RefreshCw, CreditCard, Clock, CheckCircle, AlertTriangle, HelpCircle, Mail } from "lucide-react";

export default function RefundPolicyPage() {
    const { language, isRTL } = useTranslation();

    const sections = [
        {
            icon: <CreditCard className="w-6 h-6" />,
            titleEn: "Subscription Refunds",
            titleAr: "استرداد رسوم الاشتراك",
            contentEn: [
                "Full refund is available for subscription fees if requested within 14 days of purchase.",
                "Refund requests must be submitted through your account dashboard or by contacting our support team.",
                "Refunds will be processed within 5-7 business days to the original payment method.",
                "After the 14-day period, subscription fees are non-refundable but you can cancel future renewals."
            ],
            contentAr: [
                "استرداد كامل متاح لرسوم الاشتراك إذا تم الطلب خلال 14 يوماً من الشراء.",
                "يجب تقديم طلبات الاسترداد من خلال لوحة تحكم حسابك أو بالتواصل مع فريق الدعم.",
                "سيتم معالجة الاستردادات خلال 5-7 أيام عمل إلى طريقة الدفع الأصلية.",
                "بعد فترة الـ 14 يوماً، رسوم الاشتراك غير قابلة للاسترداد ولكن يمكنك إلغاء التجديدات المستقبلية."
            ]
        },
        {
            icon: <Clock className="w-6 h-6" />,
            titleEn: "Ad Budget Refunds",
            titleAr: "استرداد الميزانية الإعلانية",
            contentEn: [
                "Unused advertising budget can be refunded within 7 days of deposit.",
                "Once funds are spent on active campaigns, they cannot be refunded.",
                "Budget transfers between campaigns are available at no additional cost.",
                "For verified account users (20% commission model), unused budget is fully refundable upon request."
            ],
            contentAr: [
                "يمكن استرداد الميزانية الإعلانية غير المستخدمة خلال 7 أيام من الإيداع.",
                "بمجرد إنفاق الأموال على الحملات النشطة، لا يمكن استردادها.",
                "تحويلات الميزانية بين الحملات متاحة بدون تكلفة إضافية.",
                "لمستخدمي الحسابات الموثوقة (نظام عمولة 20%)، الميزانية غير المستخدمة قابلة للاسترداد بالكامل عند الطلب."
            ]
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            titleEn: "How to Request a Refund",
            titleAr: "كيفية طلب الاسترداد",
            contentEn: [
                "Step 1: Log into your Furriyadh account dashboard.",
                "Step 2: Navigate to Billing > Transaction History.",
                "Step 3: Click 'Request Refund' next to the eligible transaction.",
                "Step 4: Fill out the refund request form with your reason.",
                "Step 5: Our team will review and process your request within 48 hours."
            ],
            contentAr: [
                "الخطوة 1: سجّل الدخول إلى لوحة تحكم حسابك في Furriyadh.",
                "الخطوة 2: انتقل إلى الفوترة > سجل المعاملات.",
                "الخطوة 3: انقر على 'طلب استرداد' بجانب المعاملة المؤهلة.",
                "الخطوة 4: املأ نموذج طلب الاسترداد مع ذكر السبب.",
                "الخطوة 5: سيقوم فريقنا بمراجعة ومعالجة طلبك خلال 48 ساعة."
            ]
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            titleEn: "Non-Refundable Items",
            titleAr: "عناصر غير قابلة للاسترداد",
            contentEn: [
                "Subscription fees after the 14-day refund period.",
                "Ad budget that has already been spent on campaigns.",
                "Custom development or integration services.",
                "White-label setup fees for Agency plan users.",
                "Refund requests made after account termination for policy violations."
            ],
            contentAr: [
                "رسوم الاشتراك بعد فترة الاسترداد البالغة 14 يوماً.",
                "الميزانية الإعلانية التي تم إنفاقها بالفعل على الحملات.",
                "خدمات التطوير أو التكامل المخصصة.",
                "رسوم إعداد العلامة البيضاء لمستخدمي خطة Agency.",
                "طلبات الاسترداد المقدمة بعد إنهاء الحساب بسبب انتهاكات السياسة."
            ]
        },
        {
            icon: <HelpCircle className="w-6 h-6" />,
            titleEn: "Cancellation Policy",
            titleAr: "سياسة الإلغاء",
            contentEn: [
                "You can cancel your subscription at any time from your account settings.",
                "Cancellation takes effect at the end of your current billing period.",
                "You will retain access to all features until the end of your paid period.",
                "Active campaigns will continue running until you pause or delete them.",
                "Your data will be retained for 30 days after cancellation for potential reactivation."
            ],
            contentAr: [
                "يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك.",
                "يصبح الإلغاء ساري المفعول في نهاية فترة الفوترة الحالية.",
                "ستحتفظ بالوصول إلى جميع الميزات حتى نهاية فترتك المدفوعة.",
                "ستستمر الحملات النشطة في العمل حتى تقوم بإيقافها أو حذفها.",
                "سيتم الاحتفاظ ببياناتك لمدة 30 يوماً بعد الإلغاء لإمكانية إعادة التفعيل."
            ]
        }
    ];

    return (
        <>
            <div className="front-page-body overflow-hidden bg-white dark:bg-black min-h-screen" dir="ltr">
                <Navbar />

                {/* Hero Section */}
                <div className="pt-[125px] md:pt-[145px] lg:pt-[185px] xl:pt-[195px] pb-16 text-center relative">
                    <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 mb-6 shadow-lg shadow-green-500/30">
                            <RefreshCw className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="!mb-4 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px] text-black dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'سياسة الاسترداد والإلغاء' : 'Refund & Cancellation Policy'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'نحن نقدر ثقتك ونسعى لتوفير تجربة شفافة. تعرف على سياساتنا للاسترداد والإلغاء.'
                                : 'We value your trust and strive to provide a transparent experience. Learn about our refund and cancellation policies.'}
                        </p>
                        <p className="text-gray-500 text-sm mt-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'آخر تحديث: يناير 2026' : 'Last updated: January 2026'}
                        </p>
                    </div>

                    {/* Background decorations */}
                    <div className="absolute bottom-0 -z-[1] ltr:-right-[30px] rtl:-left-[30px] blur-[250px]">
                        <Image
                            src="/images/front-pages/shape3.png"
                            alt="shape"
                            width={685}
                            height={685}
                        />
                    </div>
                    <div className="absolute -top-[220px] -z-[1] ltr:-left-[50px] rtl:-right-[50px] blur-[150px]">
                        <Image
                            src="/images/front-pages/shape5.png"
                            alt="shape"
                            width={658}
                            height={656}
                        />
                    </div>
                </div>

                {/* Quick Summary */}
                <div className="container 2xl:max-w-[1000px] mx-auto px-[12px] mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                            <div className="text-gray-700 dark:text-gray-300 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'استرداد كامل للاشتراك' : 'Full Subscription Refund'}
                            </div>
                            <div className="text-gray-500 text-xs mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'خلال 14 يوم' : 'Within 14 days'}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-blue-400 mb-2">7</div>
                            <div className="text-gray-300 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'أيام لاسترداد الميزانية' : 'Days for Budget Refund'}
                            </div>
                            <div className="text-gray-500 text-xs mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'للميزانية غير المستخدمة' : 'For unused budget'}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
                            <div className="text-3xl font-bold text-purple-400 mb-2">48h</div>
                            <div className="text-gray-300 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'معالجة الطلب' : 'Request Processing'}
                            </div>
                            <div className="text-gray-500 text-xs mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                {language === 'ar' ? 'أيام عمل' : 'Business hours'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="container 2xl:max-w-[1000px] mx-auto px-[12px] pb-20">
                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:border-green-500/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 flex items-center justify-center text-green-400">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">
                                        {language === 'ar' ? section.titleAr : section.titleEn}
                                    </h2>
                                </div>
                                <ul className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {(language === 'ar' ? section.contentAr : section.contentEn).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2.5 flex-shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-2xl p-6 md:p-8 text-center">
                        <Mail className="w-10 h-10 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-black dark:text-white mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'تحتاج مساعدة؟' : 'Need Help?'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'فريق الدعم متاح لمساعدتك في أي استفسار حول الاسترداد أو الإلغاء.'
                                : 'Our support team is available to help you with any refund or cancellation inquiries.'}
                        </p>
                        <a
                            href="mailto:support@furriyadh.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
                        >
                            <Mail className="w-4 h-4" />
                            support@furriyadh.com
                        </a>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
