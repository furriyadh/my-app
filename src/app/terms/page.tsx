"use client";

import React from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { FileText, CheckCircle, AlertTriangle, CreditCard, Ban, Scale, Gavel, RefreshCw, Mail } from "lucide-react";

export default function TermsOfServicePage() {
    const { t, language, isRTL } = useTranslation();

    const sections = [
        {
            icon: <CheckCircle className="w-6 h-6" />,
            titleEn: "Acceptance of Terms",
            titleAr: "قبول الشروط",
            contentEn: [
                "By accessing or using Furriyadh's AI-powered Google Ads management platform, you agree to be bound by these Terms of Service.",
                "If you do not agree to these terms, you may not access or use our services.",
                "We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.",
                "You must be at least 18 years old and have the legal authority to enter into this agreement."
            ],
            contentAr: [
                "من خلال الوصول إلى منصة Furriyadh لإدارة إعلانات Google المدعومة بالذكاء الاصطناعي أو استخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه.",
                "إذا لم توافق على هذه الشروط، فلا يجوز لك الوصول إلى خدماتنا أو استخدامها.",
                "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يشكل الاستخدام المستمر بعد التغييرات قبولاً للشروط الجديدة.",
                "يجب أن يكون عمرك 18 عاماً على الأقل وأن تكون لديك الصلاحية القانونية للدخول في هذه الاتفاقية."
            ]
        },
        {
            icon: <FileText className="w-6 h-6" />,
            titleEn: "Service Description",
            titleAr: "وصف الخدمة",
            contentEn: [
                "Furriyadh provides an AI-powered platform for managing and optimizing Google Ads campaigns.",
                "Our services include campaign creation, performance analytics, AI-driven recommendations, and automated optimization.",
                "We integrate with Google Ads, Google Analytics, Google Tag Manager, and Meta Ads platforms through official APIs.",
                "Service availability and features may vary based on your subscription plan.",
                "We strive to maintain 99.9% uptime but do not guarantee uninterrupted service."
            ],
            contentAr: [
                "توفر Furriyadh منصة مدعومة بالذكاء الاصطناعي لإدارة وتحسين حملات إعلانات Google.",
                "تشمل خدماتنا إنشاء الحملات، وتحليلات الأداء، والتوصيات المدعومة بالذكاء الاصطناعي، والتحسين الآلي.",
                "نتكامل مع منصات Google Ads و Google Analytics و Google Tag Manager و Meta Ads من خلال واجهات برمجة التطبيقات الرسمية.",
                "يختلف توفر الخدمة والميزات بناءً على خطة اشتراكك.",
                "نسعى جاهدين للحفاظ على وقت تشغيل بنسبة 99.9٪ لكننا لا نضمن خدمة غير منقطعة."
            ]
        },
        {
            icon: <CreditCard className="w-6 h-6" />,
            titleEn: "Billing & Payments",
            titleAr: "الفواتير والمدفوعات",
            contentEn: [
                "Subscription fees are charged in advance on a monthly or annual basis as selected.",
                "All fees are non-refundable except as required by law or as stated in our refund policy.",
                "You are responsible for providing accurate billing information and keeping your payment method current.",
                "We may change our pricing with 30 days notice. Existing subscriptions will be honored until renewal.",
                "Failure to pay may result in suspension or termination of your account.",
                "Ad spend budgets are separate from subscription fees and are charged directly by Google/Meta."
            ],
            contentAr: [
                "يتم تحصيل رسوم الاشتراك مقدماً على أساس شهري أو سنوي حسب اختيارك.",
                "جميع الرسوم غير قابلة للاسترداد إلا كما يتطلبه القانون أو كما هو مذكور في سياسة الاسترداد الخاصة بنا.",
                "أنت مسؤول عن تقديم معلومات فوترة دقيقة والحفاظ على طريقة الدفع الخاصة بك محدثة.",
                "قد نغير أسعارنا مع إشعار مسبق بـ 30 يوماً. سيتم احترام الاشتراكات الحالية حتى التجديد.",
                "قد يؤدي عدم الدفع إلى تعليق أو إنهاء حسابك.",
                "ميزانيات الإنفاق الإعلاني منفصلة عن رسوم الاشتراك ويتم تحصيلها مباشرة من Google/Meta."
            ]
        },
        {
            icon: <AlertTriangle className="w-6 h-6" />,
            titleEn: "User Responsibilities",
            titleAr: "مسؤوليات المستخدم",
            contentEn: [
                "You are responsible for maintaining the security of your account credentials.",
                "You must comply with Google Ads, Meta Ads, and other platform policies when using our service.",
                "You agree not to use our service for any illegal, fraudulent, or harmful purposes.",
                "You are responsible for the content and legality of your advertising campaigns.",
                "You must not attempt to reverse-engineer, decompile, or hack our platform.",
                "You agree not to resell or redistribute our services without written permission."
            ],
            contentAr: [
                "أنت مسؤول عن الحفاظ على أمان بيانات اعتماد حسابك.",
                "يجب عليك الامتثال لسياسات Google Ads و Meta Ads والمنصات الأخرى عند استخدام خدمتنا.",
                "توافق على عدم استخدام خدمتنا لأي أغراض غير قانونية أو احتيالية أو ضارة.",
                "أنت مسؤول عن محتوى وقانونية حملاتك الإعلانية.",
                "يجب عليك عدم محاولة الهندسة العكسية أو فك تجميع أو اختراق منصتنا.",
                "توافق على عدم إعادة بيع أو إعادة توزيع خدماتنا دون إذن كتابي."
            ]
        },
        {
            icon: <Scale className="w-6 h-6" />,
            titleEn: "Intellectual Property",
            titleAr: "الملكية الفكرية",
            contentEn: [
                "All platform features, designs, algorithms, and content are owned by Furriyadh.",
                "You retain ownership of your advertising content, campaign data, and business information.",
                "Our AI-generated recommendations and insights are provided for your use but remain our intellectual property.",
                "You may not copy, modify, or create derivative works of our platform without permission.",
                "Trademarks, logos, and brand names are property of their respective owners."
            ],
            contentAr: [
                "جميع ميزات المنصة والتصاميم والخوارزميات والمحتوى مملوكة لـ Furriyadh.",
                "تحتفظ بملكية محتوى الإعلانات وبيانات الحملات ومعلومات عملك.",
                "التوصيات والرؤى المولدة بالذكاء الاصطناعي مقدمة لاستخدامك لكنها تبقى ملكيتنا الفكرية.",
                "لا يجوز لك نسخ أو تعديل أو إنشاء أعمال مشتقة من منصتنا دون إذن.",
                "العلامات التجارية والشعارات وأسماء العلامات التجارية ملك لأصحابها."
            ]
        },
        {
            icon: <Ban className="w-6 h-6" />,
            titleEn: "Disclaimers & Limitations",
            titleAr: "إخلاء المسؤولية والقيود",
            contentEn: [
                "Our service is provided \"as is\" without warranties of any kind, express or implied.",
                "We do not guarantee specific advertising results, ROI, or campaign performance.",
                "AI recommendations are suggestions only; you are responsible for final campaign decisions.",
                "We are not liable for losses resulting from Google/Meta policy violations on your campaigns.",
                "Our total liability is limited to the fees you paid in the 12 months preceding any claim.",
                "We are not responsible for third-party service outages or API changes."
            ],
            contentAr: [
                "خدمتنا مقدمة \"كما هي\" بدون ضمانات من أي نوع، صريحة أو ضمنية.",
                "لا نضمن نتائج إعلانية محددة أو عائد الاستثمار أو أداء الحملات.",
                "توصيات الذكاء الاصطناعي هي اقتراحات فقط؛ أنت مسؤول عن قرارات الحملة النهائية.",
                "لسنا مسؤولين عن الخسائر الناتجة عن انتهاكات سياسة Google/Meta في حملاتك.",
                "إجمالي مسؤوليتنا محدود بالرسوم التي دفعتها في الـ 12 شهراً السابقة لأي مطالبة.",
                "لسنا مسؤولين عن انقطاع خدمات الطرف الثالث أو تغييرات واجهات برمجة التطبيقات."
            ]
        },
        {
            icon: <RefreshCw className="w-6 h-6" />,
            titleEn: "Termination",
            titleAr: "الإنهاء",
            contentEn: [
                "You may cancel your subscription at any time through your account settings.",
                "Cancellation takes effect at the end of your current billing period.",
                "We may suspend or terminate your account for violation of these terms.",
                "Upon termination, your access to the platform and data will be revoked.",
                "We will retain your data for 30 days after termination, after which it will be deleted.",
                "You may request data export before account deletion."
            ],
            contentAr: [
                "يمكنك إلغاء اشتراكك في أي وقت من خلال إعدادات حسابك.",
                "يصبح الإلغاء ساري المفعول في نهاية فترة الفوترة الحالية.",
                "قد نعلق أو ننهي حسابك لانتهاك هذه الشروط.",
                "عند الإنهاء، سيتم إلغاء وصولك إلى المنصة والبيانات.",
                "سنحتفظ ببياناتك لمدة 30 يوماً بعد الإنهاء، وبعد ذلك سيتم حذفها.",
                "يمكنك طلب تصدير البيانات قبل حذف الحساب."
            ]
        },
        {
            icon: <Gavel className="w-6 h-6" />,
            titleEn: "Governing Law",
            titleAr: "القانون الحاكم",
            contentEn: [
                "These terms are governed by the laws of the Kingdom of Saudi Arabia.",
                "Any disputes will be resolved through binding arbitration in Riyadh, Saudi Arabia.",
                "You agree to waive any right to participate in class action lawsuits.",
                "If any provision is found unenforceable, the remaining provisions remain in effect."
            ],
            contentAr: [
                "تخضع هذه الشروط لقوانين المملكة العربية السعودية.",
                "سيتم حل أي نزاعات من خلال التحكيم الملزم في الرياض، المملكة العربية السعودية.",
                "توافق على التنازل عن أي حق للمشاركة في الدعاوى الجماعية.",
                "إذا وُجد أي حكم غير قابل للتنفيذ، تظل الأحكام المتبقية سارية المفعول."
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
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-6 shadow-lg shadow-blue-500/30">
                            <FileText className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="!mb-4 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'يرجى قراءة هذه الشروط بعناية قبل استخدام منصة Furriyadh لإدارة إعلانات Google المدعومة بالذكاء الاصطناعي.'
                                : 'Please read these terms carefully before using Furriyadh\'s AI-powered Google Ads management platform.'}
                        </p>
                        <p className="text-gray-500 text-sm mt-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'آخر تحديث: ديسمبر 2025' : 'Last updated: December 2025'}
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
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:border-blue-500/30 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center text-blue-400">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white">
                                        {language === 'ar' ? section.titleAr : section.titleEn}
                                    </h2>
                                </div>
                                <ul className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
                                    {(language === 'ar' ? section.contentAr : section.contentEn).map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-gray-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-2xl p-6 md:p-8 text-center">
                        <Mail className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? 'أسئلة؟' : 'Questions?'}
                        </h3>
                        <p className="text-gray-400 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
                            {language === 'ar'
                                ? 'إذا كانت لديك أي أسئلة حول شروط الخدمة هذه، يرجى التواصل معنا:'
                                : 'If you have any questions about these Terms of Service, please contact us:'}
                        </p>
                        <a
                            href="mailto:legal@furriyadh.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                        >
                            <Mail className="w-4 h-4" />
                            legal@furriyadh.com
                        </a>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
