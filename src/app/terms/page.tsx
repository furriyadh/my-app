"use client";

import React, { useEffect } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import SplashCursor from "@/components/ui/SplashCursor";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function TermsOfServicePage() {
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
                                {language === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-4">
                                {language === 'ar'
                                    ? 'نهدف دائماً لشروط استخدام عادلة وواضحة.'
                                    : 'We constantly aim for fair and clear terms of use.'}
                            </p>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">
                                {language === 'ar' ? 'آخر تحديث: 5 يناير 2026' : 'Last Updated January 5th, 2026'}
                            </div>
                        </div>
                    </div>

                    {/* Terms Content */}
                    <div className="container 2xl:max-w-[800px] mx-auto px-4 pb-20">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dir={isRTL ? 'rtl' : 'ltr'}>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <p>
                                {language === 'ar'
                                    ? 'بتحديد خانة "أوافق على شروط وأحكام Furriyadh"، فإنك توافق على الالتزام بهذه الشروط اعتباراً من تاريخ تسجيلك كعميل لدى Furriyadh (يُشار إليها بـ "نحن" أو "لنا" أو "Furriyadh").'
                                    : 'By checking the "I Agree with Furriyadh\'s Terms & Conditions" box, you agree to be bound by these Terms as of the date you register as a customer of Furriyadh (referred to as "We," "Us," "Our," or "Furriyadh").'}
                            </p>

                            <p>
                                {language === 'ar'
                                    ? 'شروط الاستخدام هذه ("الشروط") هي اتفاقية ملزمة قانونياً بين شركة Furriyadh Limited، وهي شركة خاصة محدودة مسجلة في إنجلترا وويلز (رقم الشركة 16983712) ومقرها المسجل في Office 7132KR, 182-184 High Street North, Area 1/1, East Ham, London, E6 2JA, United Kingdom، وبينك أنت المستخدم (يُشار إليك بـ "أنت" أو "العميل").'
                                    : 'These Terms of Use (the "Terms") are a legally binding agreement between Furriyadh Limited, a private limited company incorporated in England and Wales (company number 16983712) with a registered office at Office 7132KR, 182-184 High Street North, Area 1/1, East Ham, London, E6 2JA, United Kingdom, and you, the user (referred to as "You," "Your," or "Customer").'}
                            </p>

                            <p>
                                {language === 'ar'
                                    ? 'كل طلب يتم من خلال Furriyadh يتضمن هذه الشروط بالإشارة.'
                                    : 'Each order made through Furriyadh incorporates these Terms by reference.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '1. وصف Furriyadh' : '1. Description of Furriyadh'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'Furriyadh هو تطبيق ويب خاص ينشئ ويدير حملات إعلانية عبر الإنترنت لشبكات الإعلانات التابعة لجهات خارجية. خدماتنا متاحة من خلال موقعنا الإلكتروني على https://furriyadh.com/.'
                                    : 'Furriyadh is a proprietary web application that creates and manages online advertising campaigns for third-party advertising networks. Our services are available through our website at https://furriyadh.com/.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '2. الترخيص والوصول' : '2. License and Access'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'منح الترخيص' : 'Grant of License'}</strong>: {language === 'ar' ? 'نمنحك ترخيصاً غير قابل للتحويل وغير حصري للوصول إلى Furriyadh واستخدامه فقط لأغراض قانونية ووفقاً لهذه الشروط.' : 'We grant you a non-transferable, non-exclusive license to access and use Furriyadh solely for lawful purposes and in accordance with these Terms.'}</li>
                                <li><strong>{language === 'ar' ? 'مسؤولية المستخدم' : 'User Responsibility'}</strong>: {language === 'ar' ? 'أنت وحدك المسؤول عن استخدامك لـ Furriyadh، بما في ذلك الاستخدام من قبل موظفيك أو وكلائك أو غيرهم من الأشخاص المصرح لهم.' : 'You are solely responsible for your use of Furriyadh, including use by your employees, agents, or other authorized individuals.'}</li>
                                <li><strong>{language === 'ar' ? 'الأنشطة المحظورة' : 'Prohibited Activities'}</strong>: {language === 'ar' ? 'لا يجوز لك السماح لأي طرف ثالث باستخدام Furriyadh أو تعديل الكود الخاص به أو الحصول على وصول غير مصرح به إلى المنصة.' : 'You shall not allow any third party to use Furriyadh, modify its code, or gain unauthorized access to the platform.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '3. مسؤوليات العميل' : '3. Customer Responsibilities'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'معلومات دقيقة' : 'Accurate Information'}</strong>: {language === 'ar' ? 'يجب عليك تقديم والحفاظ على معلومات حساب صحيحة ودقيقة ومحدثة.' : 'You must provide and maintain true, accurate, and up-to-date account information.'}</li>
                                <li><strong>{language === 'ar' ? 'مسؤولية المحتوى' : 'Content Responsibility'}</strong>: {language === 'ar' ? 'أنت وحدك المسؤول عن جميع النصوص والشعارات والصور والمواد الأخرى ("محتوى العميل") التي يتم تحميلها إلى Furriyadh.' : 'You are solely responsible for all text, logos, images, and other materials ("Customer Content") uploaded to Furriyadh.'}</li>
                                <li><strong>{language === 'ar' ? 'الامتثال للقوانين' : 'Compliance with Laws'}</strong>: {language === 'ar' ? 'توافق على عدم استخدام Furriyadh لأي أغراض غير قانونية أو فاحشة أو غير أخلاقية.' : 'You agree not to use Furriyadh for any illegal, obscene, or immoral purposes.'}</li>
                                <li><strong>{language === 'ar' ? 'السلطة المؤسسية' : 'Corporate Authority'}</strong>: {language === 'ar' ? 'إذا كنت تتصرف نيابة عن شركة، فإنك تضمن أنك مخول بربط الشركة بهذه الشروط.' : 'If acting on behalf of a company, you warrant that you are authorized to bind the company to these Terms.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '4. بيانات العميل والخصوصية' : '4. Customer Data and Privacy'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'دقة البيانات' : 'Data Accuracy'}</strong>: {language === 'ar' ? 'العميل هو المسؤول الوحيد عن اسم المستخدم والبريد الإلكتروني وكلمة مرور الحساب.' : 'The Customer will be solely responsible for the user\'s name, email and password of the account.'}</li>
                                <li>{language === 'ar' ? 'نحن لا نملك أي بيانات كلمات مفتاحية أو معلومات أو بيانات أداء ترسلها إلينا.' : 'We do not own any keyword data, information, performance data that You submit to Us.'}</li>
                                <li><strong>{language === 'ar' ? 'ملكية البيانات' : 'Ownership of Data'}</strong>: {language === 'ar' ? 'أنت تحتفظ بملكية بيانات إعلاناتك ("بيانات العميل"). تقوم Furriyadh بمعالجة بيانات العميل فقط لتقديم الخدمات.' : 'You retain ownership of your advertising data ("Customer Data"). Furriyadh processes Customer Data solely to provide the Services.'}</li>
                                <li><strong>{language === 'ar' ? 'الامتثال للائحة العامة لحماية البيانات' : 'GDPR Compliance'}</strong>: {language === 'ar' ? 'نتصرف كمتحكم في البيانات بموجب اللائحة العامة لحماية البيانات. لديك الحق في الوصول إلى بياناتك الشخصية أو تعديلها أو حذفها.' : 'We act as a data controller under GDPR. You have the right to access, amend, or delete your personal data.'}</li>
                                <li><strong>{language === 'ar' ? 'المقاييس المجمعة' : 'Aggregated Metrics'}</strong>: {language === 'ar' ? 'قد تقوم Furriyadh بتجميع مقاييس البيانات المجمعة لأغراض التحليلات، مع ضمان عدم الكشف عن أي معلومات قابلة للتعريف بشكل فريد.' : 'Furriyadh may compile aggregated data metrics for analytics purposes, ensuring no uniquely identifiable information is disclosed.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '5. خدمات Furriyadh' : '5. Furriyadh Services'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'التعديلات' : 'Modifications'}</strong>: {language === 'ar' ? 'نحتفظ بالحق في تعديل الخدمات في أي وقت دون إشعار مسبق.' : 'We reserve the right to modify the Services at any time without prior notice.'}</li>
                                <li><strong>{language === 'ar' ? 'نطاق الخدمة' : 'Service Scope'}</strong>: {language === 'ar' ? 'يتم تقديم Furriyadh "كما هو" و"حسب التوفر". نحن غير مسؤولين عن نجاح أو فشل الحملات الإعلانية.' : 'Furriyadh is provided "as is" and "as available." We are not responsible for the success or failure of advertising campaigns.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '6. الملكية الفكرية' : '6. Intellectual Property'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'الملكية' : 'Ownership'}</strong>: {language === 'ar' ? 'جميع البرامج والخوارزميات والبيانات التي تتم معالجتها بواسطة Furriyadh هي ملكيتنا الحصرية.' : 'All software, algorithms, and data processed by Furriyadh are our exclusive property.'}</li>
                                <li><strong>{language === 'ar' ? 'القيود' : 'Restrictions'}</strong>: {language === 'ar' ? 'لا يجوز لك تأجير أو ترخيص أو توزيع أو نقل أو نسخ أو تعديل أو إجراء هندسة عكسية لـ Furriyadh.' : 'You may not rent, lease, sublicense, distribute, transfer, copy, modify, or reverse-engineer Furriyadh.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '7. الخصوصية والسرية' : '7. Privacy & Confidentiality'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'توافق على شروط سياسة خصوصية Furriyadh على https://furriyadh.com/privacy والتي قد يتم تعديلها من وقت لآخر.' : 'You agree to the terms of Furriyadh\'s privacy policy at https://furriyadh.com/privacy which may be modified from time to time.'}</li>
                                <li><strong>{language === 'ar' ? 'المعلومات السرية' : 'Confidential Information'}</strong>: {language === 'ar' ? 'توافق على حماية أي معلومات سرية يتم الكشف عنها أثناء استخدامك لـ Furriyadh.' : 'You agree to protect any confidential information disclosed during your use of Furriyadh.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '8. الدفع والرسوم' : '8. Payment and Fees'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>{language === 'ar' ? 'تستند أسعار الاشتراك إلى الخطة التي اخترتها، وتعكس العرض المعروض على موقعنا الإلكتروني في وقت إبرام هذه الاتفاقية.' : 'Subscription prices are based on Your chosen plan, and reflects the offering shown on Our website at the time You entered into this agreement.'}</li>
                                <li>{language === 'ar' ? 'يجب عليك تزويد Furriyadh ببطاقة ائتمان صالحة أو تحقق من غرفة المقاصة التلقائية للبنك كشرط للتسجيل في الخدمات.' : 'You must provide Furriyadh with a valid credit card or bank automatic clearing house validation as a condition to signing up for the Services.'}</li>
                                <li>{language === 'ar' ? 'يجب عليك دفع جميع الرسوم إلى حسابك وفقًا للرسوم وشروط الفوترة في الطلب المعمول به.' : 'You shall pay all fees to your account in accordance with the fees and billing terms in the applicable Order.'}</li>
                                <li><strong>{language === 'ar' ? 'التأخر في الدفع' : 'Late Payment'}</strong>: {language === 'ar' ? 'نحتفظ بالحق في تعليق الخدمات بسبب التأخر في الدفع.' : 'We reserve the right to suspend Services for late payments.'}</li>
                                <li><strong>{language === 'ar' ? 'رسوم الإعلان' : 'Advertising Fees'}</strong>: {language === 'ar' ? 'إذا كنت تستخدم ميزة شراء الإعلانات من Furriyadh، يتم تطبيق رسوم خدمة بنسبة 20%.' : 'If using Furriyadh\'s Advertising Buying Feature, a 20% service fee applies.'}</li>
                                <li><strong>{language === 'ar' ? 'معالجة الدفع' : 'Payment Processing'}</strong>: {language === 'ar' ? 'تتم معالجة المدفوعات بواسطة Paddle.com Market Ltd كتاجر السجل للمبيعات للعملاء في جميع أنحاء العالم.' : 'Payments are processed by Paddle.com Market Ltd as the Merchant of Record for sales to customers worldwide.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '9. قسائم ائتمان Furriyadh' : '9. Furriyadh Credit Vouchers'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'الأهلية' : 'Eligibility'}</strong>: {language === 'ar' ? 'تخضع قسائم الائتمان المجانية لشروط محددة متاحة في حسابك. قد يؤدي سوء الاستخدام إلى تعليق الحساب.' : 'Free credit vouchers are subject to specific terms available in your account. Misuse may result in account suspension.'}</li>
                                <li>{language === 'ar' ? 'لن يتم إخطارك بمجرد استخدام قسيمة Furriyadh المجانية.' : 'You will not be notified once the Furriyadh free voucher has been used up.'}</li>
                                <li><strong>{language === 'ar' ? 'القيود' : 'Limitations'}</strong>: {language === 'ar' ? 'قسائم الائتمان المجانية غير المستخدمة غير قابلة للاسترداد.' : 'Unused free credit vouchers are not refundable.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '10. ميزة شراء الإعلانات' : '10. Advertising Buying Feature'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'نطاق الخدمة' : 'Service Scope'}</strong>: {language === 'ar' ? 'يتيح لك شراء الإعلانات من خلال Furriyadh إنشاء حسابات إعلانية من جهات خارجية بسرعة وسهولة وشراء إعلانات Google وMicrosoft مباشرة من داخل حساب Furriyadh الخاص بك.' : 'Advertising Buying Through Furriyadh allows you to quickly and easily create third-party ad accounts and purchase Google and Microsoft advertisements directly from within your Furriyadh account.'}</li>
                                <li><strong>{language === 'ar' ? 'الامتثال' : 'Compliance'}</strong>: {language === 'ar' ? 'باستخدام ميزة شراء الإعلانات، فإنك توافق أيضًا على الامتثال لسياسات الإعلانات وشروط الخدمة والشروط التجارية الخاصة بـ Google وMicrosoft.' : 'By using the Advertising Buying Feature, you also agree to comply with Google & Microsoft\'s Advertising Policies, Terms of Service, and Commercial Terms.'}</li>
                                <li><strong>{language === 'ar' ? 'التعليقات' : 'Suspensions'}</strong>: {language === 'ar' ? 'إذا تم تعليق حسابك الإعلاني من قبل منصات إعلانية خارجية، فقد يُطلب منك تقديم مستندات التحقق من الهوية لاسترداد الأموال.' : 'If your ad account is suspended by external ad platforms, you may be required to provide identity verification documents for refunds.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '11. المدة' : '11. Term'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'تظل هذه الاتفاقية سارية المفعول طالما أنك مستخدم مسجل في Furriyadh.'
                                    : 'This agreement remains effective as long as you are a registered user of Furriyadh.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '12. الإنهاء' : '12. Termination'}
                            </h3>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li><strong>{language === 'ar' ? 'الإنهاء من قبل أي طرف' : 'Termination by Either Party'}</strong>: {language === 'ar' ? 'يجوز لأي طرف إنهاء هذه الاتفاقية مع إشعار.' : 'Either party may terminate this agreement with notice.'}</li>
                                <li><strong>{language === 'ar' ? 'المبالغ المستردة' : 'Refunds'}</strong>: {language === 'ar' ? 'سيتم استرداد الأرصدة غير المستخدمة؛ الأرصدة المستهلكة غير قابلة للاسترداد. الاشتراكات التي تتجاوز نافذة الإلغاء البالغة 48 ساعة غير قابلة للاسترداد.' : 'Unused credits will be refunded; consumed credits are non-refundable. Subscriptions beyond the 48-hour cancellation window are non-refundable.'}</li>
                            </ol>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '13. إخلاء المسؤولية عن الضمانات' : '13. Disclaimer of Warranties'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'يتم تقديم Furriyadh "كما هو" بدون أي ضمانات. نحن نتنصل من جميع الضمانات الضمنية إلى الحد الأقصى المسموح به بموجب القانون.'
                                    : 'Furriyadh is provided "as is" without any warranties. We disclaim all implied warranties to the maximum extent permitted by law.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '14. حدود المسؤولية' : '14. Limitation of Liability'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'لن يكون أي من أطراف Furriyadh مسؤولاً عن أي أضرار تبعية أو عرضية أو غير مباشرة أو خاصة أو عقابية أو أي أضرار أخرى. إجمالي مسؤوليتنا عن أي مطالبات بموجب هذه الشروط لن يتجاوز تسعة وأربعين دولاراً (49.00 دولار).'
                                    : 'In no event shall the Furriyadh parties be liable for any consequential, incidental, indirect, special, punitive, or other damages whatsoever. Our total liability for any claims under these Terms shall not exceed forty-nine dollars ($49.00).'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '15. التغييرات على الشروط' : '15. Changes to Terms'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'قد نقوم بتحديث هذه الشروط وسنخطرك عبر البريد الإلكتروني. الشروط المحدثة متاحة للتنزيل على موقعنا الإلكتروني.'
                                    : 'We may update these Terms and will notify you via email. Updated Terms are available for download on our website.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '16. القانون الحاكم والاختصاص القضائي' : '16. Governing Law and Jurisdiction'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'تخضع هذه الشروط لقوانين إنجلترا وويلز. سيتم حل أي نزاعات في محاكم لندن، المملكة المتحدة.'
                                    : 'These Terms are governed by the laws of England and Wales. Any disputes will be resolved in the courts of London, United Kingdom.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <p className="text-center">
                                {language === 'ar'
                                    ? 'للأسئلة، يرجى التواصل على ads@furriyadh.com.'
                                    : 'For questions, please contact ads@furriyadh.com.'}
                            </p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
