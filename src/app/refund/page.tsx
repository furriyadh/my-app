"use client";

import React, { useEffect } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import SplashCursor from "@/components/ui/SplashCursor";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function RefundPolicyPage() {
    const { language, isRTL } = useTranslation();

    // Force dark mode on external pages
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <>
            <div className="front-page-body overflow-hidden min-h-screen" dir="ltr">
                <Navbar />
                <SplashCursor />

                <div className="relative z-[1]">
                    {/* Hero Section */}
                    <div className="pt-[140px] pb-12 text-center">
                        <div className="container 2xl:max-w-[1000px] mx-auto px-4">
                            <h1 className="!mb-4 !text-[32px] md:!text-[42px] lg:!text-[52px] font-medium -tracking-[1px] text-gray-900 dark:text-white leading-tight">
                                {language === 'ar' ? 'سياسة الاسترداد والإلغاء' : 'Refund & Cancellation Policy'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-4">
                                {language === 'ar'
                                    ? 'نحن نقدر ثقتك ونسعى لتوفير تجربة شفافة.'
                                    : 'We value your trust and strive to provide a transparent experience.'}
                            </p>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">
                                {language === 'ar' ? 'آخر تحديث: 5 يناير 2026' : 'Last Updated January 5th, 2026'}
                            </div>
                        </div>
                    </div>

                    {/* Refund Content */}
                    <div className="container 2xl:max-w-[800px] mx-auto px-4 pb-20">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dir={isRTL ? 'rtl' : 'ltr'}>

                            <p>
                                {language === 'ar'
                                    ? 'في Furriyadh Limited، نسعى لضمان رضاك عن خدماتنا. توضح هذه السياسة شروط وأحكام استرداد الأموال والإلغاء.'
                                    : 'At Furriyadh Limited, we strive to ensure your satisfaction with our services. This policy outlines our refund and cancellation terms and conditions.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '1. استرداد رسوم الاشتراك' : '1. Subscription Refunds'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'تقدم Furriyadh Limited ضمان استرداد الأموال لمدة 14 يوماً على جميع اشتراكات SaaS الجديدة.' : 'Furriyadh Limited offers a 14-day money-back guarantee on all new SaaS subscriptions.'}</li>
                                <li>{language === 'ar' ? 'إذا لم تكن راضياً، تواصل معنا خلال 14 يوماً من الشراء الأولي لاسترداد المبلغ بالكامل.' : 'If you are not satisfied, contact us within 14 days of your initial purchase for a full refund.'}</li>
                                <li>{language === 'ar' ? 'تتم معالجة الاستردادات بواسطة Paddle.com Market Ltd كتاجر السجل إلى طريقة الدفع الأصلية.' : 'Refunds are processed by Paddle.com Market Ltd as the Merchant of Record back to the original payment method.'}</li>
                                <li>{language === 'ar' ? 'بعد 14 يوماً، لا يتم إصدار أي مبالغ مستردة، ولكن يمكنك الإلغاء في أي وقت لإيقاف الفوترة المستقبلية.' : 'After 14 days, no refunds are issued, but you can cancel anytime to stop future billing.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '2. استرداد الميزانية الإعلانية' : '2. Ad Budget Refunds'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'يمكن استرداد الميزانية الإعلانية غير المستخدمة المودعة لدينا خلال 7 أيام.' : 'Unused advertising budget deposited with us can be refunded within 7 days.'}</li>
                                <li>{language === 'ar' ? 'الأموال التي تم إنفاقها بالفعل على شبكات الإعلانات (Google/Meta) لا يمكن استردادها لأنها تستهلك فورياً.' : 'Funds already spent on ad networks (Google/Meta) cannot be refunded as they are consumed instantly.'}</li>
                                <li>{language === 'ar' ? 'بالنسبة للحسابات الموثقة، أي ميزانية غير منفقة متبقية في الحساب قابلة للاسترداد عند إغلاق الحساب، مع خصم 5% رسوم معالجة.' : 'For Verified Accounts, any unspent budget remaining in the account is refundable upon account closure, subject to a 5% processing fee.'}</li>
                                <li>{language === 'ar' ? 'تحويل الميزانية بين حملاتك مجاني دائماً.' : 'Budget transfer between your campaigns is always free.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '3. عملية طلب الاسترداد' : '3. Refund Request Process'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'لطلب استرداد، أرسل بريداً إلكترونياً إلى ads@furriyadh.com مع رقم المعاملة.' : 'To request a refund, email ads@furriyadh.com with your Transaction ID.'}</li>
                                <li>{language === 'ar' ? 'يتم مراجعة الطلبات خلال 24-48 ساعة عمل.' : 'Requests are reviewed within 24-48 business hours.'}</li>
                                <li>{language === 'ar' ? 'في حالة الموافقة، سيظهر المبلغ المسترد في حسابك البنكي خلال 5-10 أيام عمل حسب البنك الذي تتعامل معه.' : 'If approved, the refund will appear in your bank account within 5-10 business days depending on your bank.'}</li>
                                <li>{language === 'ar' ? 'نلتزم بصرامة بإرشادات الاسترداد الخاصة بـ Paddle.' : 'We strictly adhere to Paddle\'s refund guidelines.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '4. الاستثناءات' : '4. Exceptions'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'لا توجد مبالغ مستردة للحسابات التي تم إنهاؤها بسبب انتهاك شروط الخدمة (مثل الاحتيال، الإعلانات غير القانونية).' : 'No refunds for accounts terminated due to violation of our Terms of Service (e.g., fraud, illegal ads).'}</li>
                                <li>{language === 'ar' ? 'رسوم إعداد المؤسسات المخصصة غير قابلة للاسترداد بمجرد بدء العمل في الإعداد.' : 'Custom enterprise setup fees are non-refundable once the setup work has commenced.'}</li>
                                <li>{language === 'ar' ? 'التجديدات غير قابلة للاسترداد ما لم يتم إلغاؤها قبل 24 ساعة على الأقل من تاريخ التجديد.' : 'Renewals are non-refundable unless cancelled at least 24 hours before the renewal date.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '5. الإلغاء' : '5. Cancellation'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'يمكنك إلغاء اشتراكك فوراً عبر صفحة الإعدادات > الفوترة.' : 'You may cancel your subscription instantly via the Settings > Billing page.'}</li>
                                <li>{language === 'ar' ? 'يوقف الإلغاء التجديد التلقائي. تحتفظ بالوصول حتى نهاية الفترة المدفوعة.' : 'Cancellation stops the auto-renewal. You keep access until the end of the paid term.'}</li>
                                <li>{language === 'ar' ? 'لا تطبق أي رسوم إلغاء.' : 'No cancellation fees apply.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '6. تواصل معنا' : '6. Contact Us'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'إذا كانت لديك أي أسئلة حول سياسة الاسترداد والإلغاء، يرجى التواصل معنا:'
                                    : 'If you have any questions about this Refund & Cancellation Policy, please contact us:'}
                            </p>
                            <ul className="list-disc pl-6">
                                <li><strong>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> ads@furriyadh.com</li>
                                <li><strong>{language === 'ar' ? 'الشركة:' : 'Company:'}</strong> Furriyadh Limited (Company No. 16983712)</li>
                                <li><strong>{language === 'ar' ? 'العنوان:' : 'Address:'}</strong> Office 7132KR, 182-184 High Street North, Area 1/1, East Ham, London, E6 2JA, UK</li>
                            </ul>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <p className="text-center">
                                {language === 'ar'
                                    ? 'شكراً لثقتك في Furriyadh!'
                                    : 'Thank you for trusting Furriyadh!'}
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
