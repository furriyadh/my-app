"use client";

import React from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Cookie, Settings, BarChart3, Target, Globe, RefreshCw, Mail } from "lucide-react";

export default function CookiePolicyPage() {
    const { language, isRTL } = useTranslation();

    const sections = [
        {
            icon: <Cookie className="w-6 h-6" />,
            titleEn: "1. What Are Cookies?",
            titleAr: "1. ما هي ملفات تعريف الارتباط؟",
            contentEn: [
                "Cookies are small text files stored on your device (computer, smartphone, tablet) when you visit a website.",
                "They help the site recognize your device and remember information about your visit, such as your preferences or login details.",
                "Cookies are essential for providing a seamless browsing experience and enabling core website functionality."
            ],
            contentAr: [
                "ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك (الكمبيوتر، الهاتف الذكي، الجهاز اللوحي) عند زيارة موقع ويب.",
                "تساعد هذه الملفات الموقع على التعرف على جهازك وتذكر المعلومات حول زيارتك، مثل تفضيلاتك أو تفاصيل تسجيل الدخول.",
                "ملفات تعريف الارتباط ضرورية لتوفير تجربة تصفح سلسة وتمكين وظائف الموقع الأساسية."
            ]
        },
        {
            icon: <Settings className="w-6 h-6" />,
            titleEn: "2. Types of Cookies We Use",
            titleAr: "2. أنواع ملفات تعريف الارتباط التي نستخدمها",
            contentEn: [
                "**Necessary Cookies:** Essential for the proper functioning of our website. They enable core features such as page navigation, secure access, and user authentication.",
                "**Functional Cookies:** Enhance website usability by remembering your preferences and enabling features like language settings or customized content.",
                "**Analytical Cookies:** Help us understand how users interact with our website by collecting anonymized data on site traffic, behavior, and performance. We use Google Analytics to track user activity.",
                "**Advertising Cookies:** Used to deliver ads that are relevant to you and your interests. They also limit the number of times you see an ad and help measure the effectiveness of campaigns.",
                "**Third-Party Cookies:** Set by third-party services integrated into our website, such as social media platforms or embedded content providers."
            ],
            contentAr: [
                "**ملفات تعريف الارتباط الضرورية:** ضرورية للعمل السليم لموقعنا. تمكّن الميزات الأساسية مثل التنقل بين الصفحات والوصول الآمن ومصادقة المستخدم.",
                "**ملفات تعريف الارتباط الوظيفية:** تعزز قابلية استخدام الموقع من خلال تذكر تفضيلاتك وتمكين ميزات مثل إعدادات اللغة أو المحتوى المخصص.",
                "**ملفات تعريف الارتباط التحليلية:** تساعدنا على فهم كيفية تفاعل المستخدمين مع موقعنا من خلال جمع بيانات مجهولة الهوية حول حركة الموقع والسلوك والأداء. نستخدم Google Analytics لتتبع نشاط المستخدم.",
                "**ملفات تعريف الارتباط الإعلانية:** تُستخدم لتقديم إعلانات ذات صلة بك وباهتماماتك. كما أنها تحد من عدد مرات مشاهدة الإعلان وتساعد في قياس فعالية الحملات.",
                "**ملفات تعريف الارتباط من الطرف الثالث:** يتم تعيينها بواسطة خدمات الطرف الثالث المدمجة في موقعنا، مثل منصات التواصل الاجتماعي أو مزودي المحتوى المضمن."
            ]
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            titleEn: "3. Why We Use Cookies",
            titleAr: "3. لماذا نستخدم ملفات تعريف الارتباط",
            contentEn: [
                "Provide a seamless browsing experience across our platform.",
                "Analyze website traffic and improve performance.",
                "Personalize content and advertising recommendations.",
                "Facilitate secure transactions and user authentication.",
                "Remember your preferences and settings for future visits."
            ],
            contentAr: [
                "توفير تجربة تصفح سلسة عبر منصتنا.",
                "تحليل حركة مرور الموقع وتحسين الأداء.",
                "تخصيص المحتوى وتوصيات الإعلانات.",
                "تسهيل المعاملات الآمنة ومصادقة المستخدم.",
                "تذكر تفضيلاتك وإعداداتك للزيارات المستقبلية."
            ]
        },
        {
            icon: <Target className="w-6 h-6" />,
            titleEn: "4. How to Manage Your Cookie Preferences",
            titleAr: "4. كيفية إدارة تفضيلات ملفات تعريف الارتباط",
            contentEn: [
                "You have the right to control and manage cookies. When visiting our website, you will see a cookie consent banner allowing you to accept, reject, or customize your preferences.",
                "You can also manage cookies through your browser settings:",
                "• Google Chrome: Settings > Privacy and Security > Cookies",
                "• Mozilla Firefox: Settings > Privacy & Security > Cookies",
                "• Safari: Preferences > Privacy > Manage Website Data",
                "• Microsoft Edge: Settings > Cookies and Site Permissions",
                "Please note that disabling cookies may affect the functionality of our website."
            ],
            contentAr: [
                "لديك الحق في التحكم في ملفات تعريف الارتباط وإدارتها. عند زيارة موقعنا، سترى شعار موافقة على ملفات تعريف الارتباط يسمح لك بالقبول أو الرفض أو تخصيص تفضيلاتك.",
                "يمكنك أيضاً إدارة ملفات تعريف الارتباط من خلال إعدادات المتصفح:",
                "• Google Chrome: الإعدادات > الخصوصية والأمان > ملفات تعريف الارتباط",
                "• Mozilla Firefox: الإعدادات > الخصوصية والأمان > ملفات تعريف الارتباط",
                "• Safari: التفضيلات > الخصوصية > إدارة بيانات الموقع",
                "• Microsoft Edge: الإعدادات > ملفات تعريف الارتباط وأذونات الموقع",
                "يرجى ملاحظة أن تعطيل ملفات تعريف الارتباط قد يؤثر على وظائف موقعنا."
            ]
        },
        {
            icon: <Globe className="w-6 h-6" />,
            titleEn: "5. Third-Party Services",
            titleAr: "5. خدمات الطرف الثالث",
            contentEn: [
                "We use third-party services such as Google Ads to optimize our marketing efforts. These services may place their own cookies on your device.",
                "For more details, refer to their respective privacy policies:",
                "• Google Privacy Policy: https://policies.google.com/privacy",
                "• Meta Privacy Policy: https://www.facebook.com/policy.php",
                "• PayPal Privacy Policy: https://www.paypal.com/privacy"
            ],
            contentAr: [
                "نستخدم خدمات الطرف الثالث مثل Google Ads لتحسين جهودنا التسويقية. قد تضع هذه الخدمات ملفات تعريف الارتباط الخاصة بها على جهازك.",
                "لمزيد من التفاصيل، راجع سياسات الخصوصية الخاصة بها:",
                "• سياسة خصوصية Google: https://policies.google.com/privacy",
                "• سياسة خصوصية Meta: https://www.facebook.com/policy.php",
                "• سياسة خصوصية PayPal: https://www.paypal.com/privacy"
            ]
        },
        {
            icon: <RefreshCw className="w-6 h-6" />,
            titleEn: "6. Updates to This Policy",
            titleAr: "6. تحديثات هذه السياسة",
            contentEn: [
                "We may update this Cookie Policy periodically to reflect changes in technology, legal requirements, or our practices.",
                "The latest version will always be available on this page with the updated effective date.",
                "We encourage you to review this policy regularly to stay informed about how we use cookies."
            ],
            contentAr: [
                "قد نقوم بتحديث سياسة ملفات تعريف الارتباط هذه بشكل دوري لتعكس التغييرات في التكنولوجيا أو المتطلبات القانونية أو ممارساتنا.",
                "ستكون أحدث نسخة متاحة دائماً على هذه الصفحة مع تاريخ السريان المحدث.",
                "نشجعك على مراجعة هذه السياسة بانتظام للبقاء على اطلاع حول كيفية استخدامنا لملفات تعريف الارتباط."
            ]
        }
    ];

    return (
        <>
            <div className="front-page-body overflow-hidden bg-black min-h-screen" dir="ltr">
                <Navbar />

                {/* Hero Section */}
                <div className="pt-[125px] md:pt-[145px] lg:pt-[185px] xl:pt-[195px] pb-16 text-center relative">
                    <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-600 mb-6 shadow-lg shadow-orange-500/30">
                            <Cookie className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="!mb-4 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'تعرف على كيفية استخدام Furriyadh لملفات تعريف الارتباط لتحسين تجربتك على منصتنا.'
                                : 'Learn how Furriyadh uses cookies to enhance your experience on our platform.'}
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

                {/* Content Sections */}
                <div className="container 2xl:max-w-[1000px] mx-auto px-[12px] pb-20">
                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:border-orange-500/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600/20 to-amber-600/20 flex items-center justify-center text-orange-400">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white">
                                        {language === 'ar' ? section.titleAr : section.titleEn}
                                    </h2>
                                </div>
                                <ul className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {(language === 'ar' ? section.contentAr : section.contentEn).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2.5 flex-shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-gradient-to-br from-orange-600/10 to-amber-600/10 border border-orange-500/20 rounded-2xl p-6 md:p-8 text-center">
                        <Mail className="w-10 h-10 text-orange-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'أسئلة؟' : 'Questions?'}
                        </h3>
                        <p className="text-gray-400 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'إذا كانت لديك أي أسئلة حول سياسة ملفات تعريف الارتباط أو كيفية استخدامنا لها، يرجى التواصل معنا:'
                                : 'If you have any questions about this Cookie Policy or how we use cookies, please contact us:'}
                        </p>
                        <a
                            href="mailto:privacy@furriyadh.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                        >
                            <Mail className="w-4 h-4" />
                            privacy@furriyadh.com
                        </a>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
