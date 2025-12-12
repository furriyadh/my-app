"use client";

import React from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Shield, Lock, Eye, Database, Cookie, Users, Mail, Globe } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { t, language, isRTL } = useTranslation();

  const sections = [
    {
      icon: <Database className="w-6 h-6" />,
      titleEn: "Information We Collect",
      titleAr: "المعلومات التي نجمعها",
      contentEn: [
        "Account Information: When you register, we collect your name, email address, and password.",
        "Google Ads Data: When you connect your Google Ads account, we access campaign performance data, keywords, ad metrics, and billing information through secure OAuth authentication.",
        "Analytics Data: If you connect Google Analytics, we access website traffic, user behavior, and conversion data.",
        "Payment Information: We collect billing details when you subscribe to our premium plans. Payment processing is handled by secure third-party providers.",
        "Usage Data: We automatically collect information about how you interact with our platform, including pages visited, features used, and time spent."
      ],
      contentAr: [
        "معلومات الحساب: عند التسجيل، نجمع اسمك وبريدك الإلكتروني وكلمة المرور.",
        "بيانات إعلانات Google: عند ربط حسابك في Google Ads، نصل إلى بيانات أداء الحملات والكلمات المفتاحية ومقاييس الإعلانات ومعلومات الفواتير من خلال مصادقة OAuth الآمنة.",
        "بيانات التحليلات: إذا قمت بربط Google Analytics، نصل إلى حركة مرور الموقع وسلوك المستخدم وبيانات التحويل.",
        "معلومات الدفع: نجمع تفاصيل الفواتير عند اشتراكك في خططنا المميزة. تتم معالجة الدفع من خلال مزودين آمنين من طرف ثالث.",
        "بيانات الاستخدام: نجمع تلقائياً معلومات حول كيفية تفاعلك مع منصتنا، بما في ذلك الصفحات التي تزورها والميزات المستخدمة والوقت المستغرق."
      ]
    },
    {
      icon: <Eye className="w-6 h-6" />,
      titleEn: "How We Use Your Information",
      titleAr: "كيف نستخدم معلوماتك",
      contentEn: [
        "Provide AI-powered campaign optimization and recommendations",
        "Display your advertising performance metrics and analytics",
        "Process your subscription payments and manage your account",
        "Send you important updates about our service and your campaigns",
        "Improve our platform and develop new features",
        "Ensure security and prevent fraudulent activities"
      ],
      contentAr: [
        "تقديم تحسينات وتوصيات الحملات المدعومة بالذكاء الاصطناعي",
        "عرض مقاييس أداء إعلاناتك والتحليلات",
        "معالجة مدفوعات اشتراكك وإدارة حسابك",
        "إرسال تحديثات مهمة حول خدمتنا وحملاتك",
        "تحسين منصتنا وتطوير ميزات جديدة",
        "ضمان الأمان ومنع الأنشطة الاحتيالية"
      ]
    },
    {
      icon: <Lock className="w-6 h-6" />,
      titleEn: "Data Security",
      titleAr: "أمان البيانات",
      contentEn: [
        "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
        "OAuth tokens are stored securely and never shared with third parties.",
        "We implement industry-standard security practices including regular security audits.",
        "Access to user data is strictly limited to authorized personnel only.",
        "We use secure, SOC 2 compliant cloud infrastructure (Supabase, Vercel)."
      ],
      contentAr: [
        "جميع البيانات مشفرة أثناء النقل باستخدام TLS 1.3 وأثناء التخزين باستخدام تشفير AES-256.",
        "يتم تخزين رموز OAuth بشكل آمن ولا يتم مشاركتها أبداً مع أطراف ثالثة.",
        "نطبق ممارسات أمان معيارية صناعية بما في ذلك عمليات تدقيق أمني منتظمة.",
        "الوصول إلى بيانات المستخدم مقتصر بشكل صارم على الموظفين المصرح لهم فقط.",
        "نستخدم بنية تحتية سحابية آمنة ومتوافقة مع SOC 2 (Supabase، Vercel)."
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      titleEn: "Third-Party Services",
      titleAr: "خدمات الطرف الثالث",
      contentEn: [
        "Google Ads API: To manage and optimize your advertising campaigns",
        "Google Analytics API: To provide website performance insights",
        "Google Tag Manager API: To manage tracking and analytics tags",
        "Meta Ads API: To manage Facebook and Instagram advertising",
        "Payment Processors: To securely handle subscription payments"
      ],
      contentAr: [
        "واجهة برمجة Google Ads: لإدارة وتحسين حملاتك الإعلانية",
        "واجهة برمجة Google Analytics: لتقديم رؤى أداء الموقع",
        "واجهة برمجة Google Tag Manager: لإدارة علامات التتبع والتحليلات",
        "واجهة برمجة Meta Ads: لإدارة إعلانات Facebook و Instagram",
        "معالجات الدفع: للتعامل مع مدفوعات الاشتراك بشكل آمن"
      ]
    },
    {
      icon: <Cookie className="w-6 h-6" />,
      titleEn: "Cookies & Tracking",
      titleAr: "ملفات تعريف الارتباط والتتبع",
      contentEn: [
        "Essential Cookies: Required for authentication and session management",
        "Preference Cookies: Remember your language and display preferences",
        "Analytics Cookies: Help us understand how you use our platform",
        "You can manage cookie preferences through your browser settings"
      ],
      contentAr: [
        "ملفات تعريف الارتباط الأساسية: مطلوبة للمصادقة وإدارة الجلسات",
        "ملفات تعريف الارتباط للتفضيلات: تتذكر لغتك وتفضيلات العرض",
        "ملفات تعريف الارتباط للتحليلات: تساعدنا على فهم كيفية استخدامك لمنصتنا",
        "يمكنك إدارة تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح"
      ]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      titleEn: "Your Rights",
      titleAr: "حقوقك",
      contentEn: [
        "Access: Request a copy of your personal data at any time",
        "Correction: Update or correct your information through your account settings",
        "Deletion: Request deletion of your account and associated data",
        "Portability: Export your data in a machine-readable format",
        "Disconnect: Revoke access to connected third-party accounts at any time",
        "Opt-out: Unsubscribe from marketing communications"
      ],
      contentAr: [
        "الوصول: اطلب نسخة من بياناتك الشخصية في أي وقت",
        "التصحيح: حدّث أو صحح معلوماتك من خلال إعدادات حسابك",
        "الحذف: اطلب حذف حسابك والبيانات المرتبطة به",
        "قابلية النقل: صدّر بياناتك بتنسيق قابل للقراءة آلياً",
        "إلغاء الربط: ألغِ الوصول إلى حسابات الطرف الثالث المتصلة في أي وقت",
        "إلغاء الاشتراك: ألغِ الاشتراك في الاتصالات التسويقية"
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-6 shadow-lg shadow-purple-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="!mb-4 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'ar' 
                ? 'نحن ملتزمون بحماية خصوصيتك وتأمين بياناتك. تعرف على كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك.'
                : 'We are committed to protecting your privacy and securing your data. Learn how we collect, use, and protect your information.'}
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
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center text-purple-400">
                    {section.icon}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {language === 'ar' ? section.titleAr : section.titleEn}
                  </h2>
                </div>
                <ul className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
                  {(language === 'ar' ? section.contentAr : section.contentEn).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 bg-gradient-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6 md:p-8 text-center">
            <Mail className="w-10 h-10 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
            </h3>
            <p className="text-gray-400 mb-4" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'ar' 
                ? 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا:'
                : 'If you have any questions about this Privacy Policy, please contact us:'}
            </p>
            <a 
              href="mailto:privacy@furriyadh.com" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
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
