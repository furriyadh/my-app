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
                "Furriyadh L.L.C. offers a 14-day money-back guarantee on all new SaaS subscriptions.",
                "If you are not satisfied, contact us within 14 days of your initial purchase for a full refund.",
                "Refunds are processed by our Merchant of Record (Paddle/2Checkout) back to the original payment method.",
                "After 14 days, no refunds are issued, but you can cancel anytime to stop future billing."
            ],
            contentAr: [
                "تقدم Furriyadh L.L.C. ضمان استرداد الأموال لمدة 14 يوماً على جميع اشتراكات SaaS الجديدة.",
                "إذا لم تكن راضياً، تواصل معنا خلال 14 يوماً من الشراء الأولي لاسترداد المبلغ بالكامل.",
                "تتم معالجة الاستردادات بواسطة تاجر السجل لدينا (Paddle/2Checkout) إلى طريقة الدفع الأصلية.",
                "بعد 14 يوماً، لا يتم إصدار أي مبالغ مستردة، ولكن يمكنك الإلغاء في أي وقت لإيقاف الفوترة المستقبلية."
            ]
        },
        {
            icon: <Clock className="w-6 h-6" />,
            titleEn: "Ad Budget Refunds",
            titleAr: "استرداد الميزانية الإعلانية",
            contentEn: [
                "Unused advertising budget deposited with us can be refunded within 7 days.",
                "Funds already spent on ad networks (Google/Meta) cannot be refunded as they are consumed instantly.",
                "For 'Verified Accounts', any unspent budget remaining in the account is refundable upon account closure, subject to a 5% processing fee.",
                "Budget transfer between your campaigns is always free."
            ],
            contentAr: [
                "يمكن استرداد الميزانية الإعلانية غير المستخدمة المودعة لدينا خلال 7 أيام.",
                "الأموال التي تم إنفاقها بالفعل على شبكات الإعلانات (Google/Meta) لا يمكن استردادها لأنها تستهلك فورياً.",
                "بالنسبة لـ 'الحسابات الموثقة'، أي ميزانية غير منفقة متبقية في الحساب قابلة للاسترداد عند إغلاق الحساب، مع خصم 5% رسوم معالجة.",
                "تحويل الميزانية بين حملاتك مجاني دائماً."
            ]
        },
        {
            icon: <CheckCircle className="w-6 h-6" />,
            titleEn: "Request Process",
            titleAr: "عملية الطلب",
            contentEn: [
                "To request a refund, email billing@furriyadh.com with your Transaction ID.",
                "Requests are reviewed within 24-48 business hours.",
                "If approved, the refund will appear in your bank account within 5-10 business days depending on your bank.",
                "We strictly adhere to Paddle's and 2Checkout's refund guidelines."
            ],
            contentAr: [
                "لطلب استرداد، أرسل بريداً إلكترونياً إلى billing@furriyadh.com مع رقم المعاملة.",
                "يتم مراجعة الطلبات خلال 24-48 ساعة عمل.",
                "في حالة الموافقة، سيظهر المبلغ المسترد في حسابك البنكي خلال 5-10 أيام عمل حسب البنك الذي تتعامل معه.",
                "نلتزم بصرامة بإرشادات الاسترداد الخاصة بـ Paddle و 2Checkout."
            ]
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            titleEn: "Exceptions",
            titleAr: "استثناءات",
            contentEn: [
                "No refunds for accounts terminated due to violation of our Terms of Service (e.g., fraud, illegal ads).",
                "Custom enterprise setup fees are non-refundable once the setup work has commenced.",
                "Renewals are non-refundable unless cancelled at least 24 hours before the renewal date."
            ],
            contentAr: [
                "لا توجد مبالغ مستردة للحسابات التي تم إنهاؤها بسبب انتهاك شروط الخدمة (مثل الاحتيال، الإعلانات غير القانونية).",
                "رسوم إعداد المؤسسات المخصصة غير قابلة للاسترداد بمجرد بدء العمل في الإعداد.",
                "التجديدات غير قابلة للاسترداد ما لم يتم إلغاؤها قبل 24 ساعة على الأقل من تاريخ التجديد."
            ]
        },
        {
            icon: <HelpCircle className="w-6 h-6" />,
            titleEn: "Cancellation",
            titleAr: "الإلغاء",
            contentEn: [
                "You may cancel your subscription instantly via the Settings > Billing page.",
                "Cancellation stops the auto-renewal. You keep access until the end of the paid term.",
                "No cancellation fees apply."
            ],
            contentAr: [
                "يمكنك إلغاء اشتراكك فوراً عبر صفحة الإعدادات > الفوترة.",
                "يوقف الإلغاء التجديد التلقائي. تحتفظ بالوصول حتى نهاية الفترة المدفوعة.",
                "لا تطبق أي رسوم إلغاء."
            ]
        }
    ];

    return (
        <>
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
                    <div className="pt-[125px] md:pt-[145px] lg:pt-[185px] xl:pt-[195px] pb-16 text-center">
                        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
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
                    </div>

                    {/* Quick Summary */}
                    <div className="container 2xl:max-w-[1000px] mx-auto px-[12px] mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gradient-to-br dark:from-green-600/20 dark:to-emerald-600/20 border border-gray-200 dark:border-green-500/30 rounded-xl p-6 text-center shadow-lg dark:shadow-none">
                                <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                                <div className="text-gray-700 dark:text-gray-300 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {language === 'ar' ? 'استرداد كامل للاشتراك' : 'Full Subscription Refund'}
                                </div>
                                <div className="text-gray-500 text-xs mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {language === 'ar' ? 'خلال 14 يوم' : 'Within 14 days'}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gradient-to-br dark:from-blue-600/20 dark:to-cyan-600/20 border border-gray-200 dark:border-blue-500/30 rounded-xl p-6 text-center shadow-lg dark:shadow-none">
                                <div className="text-3xl font-bold text-blue-400 mb-2">7</div>
                                <div className="text-gray-300 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {language === 'ar' ? 'أيام لاسترداد الميزانية' : 'Days for Budget Refund'}
                                </div>
                                <div className="text-gray-500 text-xs mt-1" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {language === 'ar' ? 'للميزانية غير المستخدمة' : 'For unused budget'}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gradient-to-br dark:from-purple-600/20 dark:to-pink-600/20 border border-gray-200 dark:border-purple-500/30 rounded-xl p-6 text-center shadow-lg dark:shadow-none">
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
                                    className="bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 hover:shadow-xl transition-all duration-300"
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
                        <div className="mt-12 bg-green-50 dark:bg-gradient-to-br dark:from-green-600/10 dark:to-emerald-600/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 md:p-8 text-center">
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
                </div>

                <Footer />
            </div>
        </>
    );
}
