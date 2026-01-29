"use client";

import React, { useEffect } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import SplashCursor from "@/components/ui/SplashCursor";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function CookiePolicyPage() {
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
                                {language === 'ar' ? 'سياسة ملفات تعريف الارتباط في Furriyadh' : 'Furriyadh Cookie Policy'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-4">
                                {language === 'ar'
                                    ? 'نهدف إلى إبقائك على اطلاع.'
                                    : 'We aim to keep you informed.'}
                            </p>
                            <div className="text-sm text-gray-400 uppercase tracking-wider">
                                {language === 'ar' ? 'آخر تحديث: 5 يناير 2026' : 'Last Updated January 5th, 2026'}
                            </div>
                        </div>
                    </div>

                    {/* Cookie Content */}
                    <div className="container 2xl:max-w-[800px] mx-auto px-4 pb-20">
                        <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dir={isRTL ? 'rtl' : 'ltr'}>

                            <p>
                                {language === 'ar'
                                    ? 'في Furriyadh، نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتحسين أداء موقعنا، وضمان تقديم محتوى وإعلانات مخصصة. توضح سياسة ملفات تعريف الارتباط هذه ماهية ملفات تعريف الارتباط، وكيف نستخدمها، وخياراتك بشأن استخدامها.'
                                    : 'At Furriyadh, we use cookies to enhance your experience, improve our website\'s performance, and ensure that we deliver tailored content and advertising. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '1. ما هي ملفات تعريف الارتباط؟' : '1. What Are Cookies?'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك (الكمبيوتر، الهاتف الذكي، الجهاز اللوحي) عند زيارة موقع ويب. تساعد هذه الملفات الموقع على التعرف على جهازك وتذكر المعلومات حول زيارتك، مثل تفضيلاتك أو تفاصيل تسجيل الدخول.'
                                    : 'Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website. They help the site recognize your device and remember information about your visit, such as your preferences or login details.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '2. أنواع ملفات تعريف الارتباط التي نستخدمها' : '2. Types of Cookies We Use'}
                            </h3>

                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">
                                {language === 'ar' ? 'أ) ملفات تعريف الارتباط الضرورية' : 'a) Necessary Cookies'}
                            </h4>
                            <p>
                                {language === 'ar'
                                    ? 'هذه الملفات ضرورية للعمل السليم لموقعنا. تمكّن الميزات الأساسية مثل التنقل بين الصفحات والوصول الآمن ومصادقة المستخدم.'
                                    : 'These cookies are essential for the proper functioning of our website. They enable core features such as page navigation, secure access, and user authentication.'}
                            </p>
                            <ul className="list-disc pl-6">
                                <li>{language === 'ar' ? 'ملفات تعريف الجلسة لصيانة تسجيل الدخول.' : 'Session cookies for login maintenance.'}</li>
                                <li>{language === 'ar' ? 'ملفات تعريف الارتباط المتعلقة بالأمان لحماية حسابات المستخدمين.' : 'Security-related cookies to protect user accounts.'}</li>
                            </ul>

                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">
                                {language === 'ar' ? 'ب) ملفات تعريف الارتباط الوظيفية' : 'b) Functional Cookies'}
                            </h4>
                            <p>
                                {language === 'ar'
                                    ? 'تعزز ملفات تعريف الارتباط الوظيفية قابلية استخدام الموقع من خلال تذكر تفضيلاتك وتمكين ميزات مثل إعدادات اللغة أو المحتوى المخصص.'
                                    : 'Functional cookies enhance website usability by remembering your preferences and enabling features like language settings or customized content.'}
                            </p>

                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">
                                {language === 'ar' ? 'ج) ملفات تعريف الارتباط التحليلية' : 'c) Analytical Cookies'}
                            </h4>
                            <p>
                                {language === 'ar'
                                    ? 'تساعدنا هذه الملفات على فهم كيفية تفاعل المستخدمين مع موقعنا من خلال جمع بيانات مجهولة الهوية حول حركة الموقع والسلوك والأداء.'
                                    : 'These cookies help us understand how users interact with our website by collecting anonymized data on site traffic, behavior, and performance.'}
                            </p>
                            <ul className="list-disc pl-6">
                                <li>{language === 'ar' ? 'Google Analytics لتتبع نشاط المستخدم' : 'Google Analytics to track user activity'}</li>
                                <li>{language === 'ar' ? 'Facebook Pixel لتتبع نشاط المستخدم' : 'Facebook Pixel to track user activity'}</li>
                            </ul>

                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">
                                {language === 'ar' ? 'د) ملفات تعريف الارتباط الإعلانية' : 'd) Advertising Cookies'}
                            </h4>
                            <p>
                                {language === 'ar'
                                    ? 'تُستخدم ملفات تعريف الارتباط الإعلانية لتقديم إعلانات ذات صلة بك وباهتماماتك. كما أنها تحد من عدد مرات مشاهدة الإعلان وتساعد في قياس فعالية الحملات.'
                                    : 'Advertising cookies are used to deliver ads that are relevant to you and your interests. They also limit the number of times you see an ad and help measure the effectiveness of campaigns.'}
                            </p>

                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4">
                                {language === 'ar' ? 'هـ) ملفات تعريف الارتباط من الطرف الثالث' : 'e) Third-Party Cookies'}
                            </h4>
                            <p>
                                {language === 'ar'
                                    ? 'يتم تعيين هذه الملفات بواسطة خدمات الطرف الثالث المدمجة في موقعنا، مثل منصات التواصل الاجتماعي أو مزودي المحتوى المضمن.'
                                    : 'These cookies are set by third-party services integrated into our website, such as social media platforms or embedded content providers.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '3. لماذا نستخدم ملفات تعريف الارتباط' : '3. Why We Use Cookies'}
                            </h3>
                            <p>{language === 'ar' ? 'نستخدم ملفات تعريف الارتباط من أجل:' : 'We use cookies to:'}</p>
                            <ul className="list-disc pl-6">
                                <li>{language === 'ar' ? 'توفير تجربة تصفح سلسة.' : 'Provide a seamless browsing experience.'}</li>
                                <li>{language === 'ar' ? 'تحليل حركة مرور الموقع وتحسين الأداء.' : 'Analyze website traffic and improve performance.'}</li>
                                <li>{language === 'ar' ? 'تخصيص المحتوى والإعلانات.' : 'Personalize content and ads.'}</li>
                                <li>{language === 'ar' ? 'تسهيل المعاملات الآمنة.' : 'Facilitate secure transactions.'}</li>
                            </ul>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '4. كيفية إدارة تفضيلات ملفات تعريف الارتباط' : '4. How to Manage Your Cookie Preferences'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'لديك الحق في التحكم في ملفات تعريف الارتباط وإدارتها. عند زيارة موقعنا، سترى شعار موافقة على ملفات تعريف الارتباط يسمح لك بـ:'
                                    : 'You have the right to control and manage cookies. When visiting our website, you will see a cookie consent banner allowing you to:'}
                            </p>
                            <ul className="list-disc pl-6">
                                <li>{language === 'ar' ? 'قبول جميع ملفات تعريف الارتباط.' : 'Accept all cookies.'}</li>
                                <li>{language === 'ar' ? 'رفض ملفات تعريف الارتباط غير الضرورية.' : 'Reject non-essential cookies.'}</li>
                                <li>{language === 'ar' ? 'تخصيص تفضيلات ملفات تعريف الارتباط الخاصة بك.' : 'Customize your cookie preferences.'}</li>
                            </ul>
                            <p>
                                {language === 'ar'
                                    ? 'يمكنك أيضاً إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح. يرجى ملاحظة أن تعطيل ملفات تعريف الارتباط قد يؤثر على وظائف موقعنا.'
                                    : 'You can also manage cookies through your browser settings. Please note that disabling cookies may affect the functionality of our website.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '5. خدمات الطرف الثالث' : '5. Third-Party Services'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'نستخدم خدمات الطرف الثالث مثل Google Ads و Meta Ads و Microsoft Ads لتحسين جهودنا التسويقية. قد تضع هذه الخدمات ملفات تعريف الارتباط الخاصة بها على جهازك. لمزيد من التفاصيل، راجع سياسات الخصوصية الخاصة بها:'
                                    : 'We use third-party services such as Google Ads, Meta Ads, and Microsoft Ads to optimize our marketing efforts. These services may place their own cookies on your device. For more details, refer to their respective privacy policies:'}
                            </p>
                            <ul className="list-disc pl-6">
                                <li><a href="https://policies.google.com/privacy" className="text-primary-500 hover:underline">Google Privacy Policy</a></li>
                                <li><a href="https://www.facebook.com/policy.php" className="text-primary-500 hover:underline">Meta Privacy Policy</a></li>
                                <li><a href="https://privacy.microsoft.com/" className="text-primary-500 hover:underline">Microsoft Privacy Statement</a></li>
                            </ul>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '6. تحديثات هذه السياسة' : '6. Updates to This Policy'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'قد نقوم بتحديث سياسة ملفات تعريف الارتباط هذه بشكل دوري لتعكس التغييرات في التكنولوجيا أو المتطلبات القانونية أو ممارساتنا. ستكون أحدث نسخة متاحة دائماً على هذه الصفحة مع تاريخ السريان المحدث.'
                                    : 'We may update this Cookie Policy periodically to reflect changes in technology, legal requirements, or our practices. The latest version will always be available on this page with the updated effective date.'}
                            </p>

                            <hr className="border-gray-200 dark:border-gray-700 my-8" />

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === 'ar' ? '7. تواصل معنا' : '7. Contact Us'}
                            </h3>
                            <p>
                                {language === 'ar'
                                    ? 'إذا كانت لديك أي أسئلة حول سياسة ملفات تعريف الارتباط هذه أو كيفية استخدامنا لها، يرجى التواصل معنا:'
                                    : 'If you have any questions about this Cookie Policy or how we use cookies, please contact us:'}
                            </p>
                            <ul className="list-disc pl-6">
                                <li><strong>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> privacy@furriyadh.com</li>
                                <li><strong>{language === 'ar' ? 'العنوان:' : 'Address:'}</strong> Furriyadh Limited, Office 7132KR, 182-184 High Street North, Area 1/1, East Ham, London, E6 2JA, UK</li>
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
