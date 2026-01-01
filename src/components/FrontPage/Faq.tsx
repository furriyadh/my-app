"use client";

import React from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ChevronDown } from "lucide-react";

const Faq: React.FC = () => {
  const { language, isRTL } = useTranslation();
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const faqItems = [
    {
      questionEn: "What is Furriyadh?",
      questionAr: "ما هو Furriyadh؟",
      answerEn: "Furriyadh is an AI-powered Google Ads management platform that helps businesses create, optimize, and manage their advertising campaigns with ease. We use artificial intelligence to maximize your ad performance and ROI.",
      answerAr: "Furriyadh هي منصة إدارة إعلانات Google مدعومة بالذكاء الاصطناعي تساعد الشركات على إنشاء وتحسين وإدارة حملاتها الإعلانية بسهولة. نستخدم الذكاء الاصطناعي لزيادة أداء إعلاناتك والعائد على الاستثمار."
    },
    {
      questionEn: "How does the AI optimization work?",
      questionAr: "كيف يعمل التحسين بالذكاء الاصطناعي؟",
      answerEn: "Our AI analyzes your campaign data in real-time, identifying patterns and opportunities for improvement. It automatically adjusts bids, targets, and ad placements to ensure you get the best results within your budget. You can review and approve AI recommendations or let them apply automatically.",
      answerAr: "يحلل الذكاء الاصطناعي لدينا بيانات حملتك في الوقت الفعلي، ويحدد الأنماط وفرص التحسين. يقوم تلقائياً بتعديل العروض والأهداف ومواضع الإعلانات لضمان أفضل النتائج ضمن ميزانيتك. يمكنك مراجعة توصيات الذكاء الاصطناعي والموافقة عليها أو تركها تطبق تلقائياً."
    },
    {
      questionEn: "What are the two account types available?",
      questionAr: "ما هما نوعا الحسابات المتاحة؟",
      answerEn: "We offer two systems: 1) Manage Your Own Account - Connect your existing Google Ads account and pay a monthly subscription fee. 2) Our Verified Accounts - Use our pre-verified Google Ads accounts with a 20% commission on ad spend. The second option is ideal for businesses that don't have verified accounts or want hassle-free management.",
      answerAr: "نقدم نظامين: 1) أدر حسابك الخاص - اربط حسابك الحالي في Google Ads وادفع رسوم اشتراك شهرية. 2) حساباتنا الموثقة - استخدم حسابات Google Ads الموثقة لدينا مع عمولة 20% على الإنفاق الإعلاني. الخيار الثاني مثالي للشركات التي ليس لديها حسابات موثقة أو تريد إدارة خالية من المتاعب."
    },
    {
      questionEn: "How do I get started?",
      questionAr: "كيف أبدأ؟",
      answerEn: "Getting started is easy: 1) Sign up for a free account. 2) Choose your plan (Manage Your Account or Verified Accounts). 3) Connect your Google Ads account or let us set one up for you. 4) Create your first campaign with AI assistance. 5) Watch your ads perform and optimize automatically!",
      answerAr: "البدء سهل: 1) سجل حساباً مجانياً. 2) اختر خطتك (إدارة حسابك أو الحسابات الموثقة). 3) اربط حساب Google Ads الخاص بك أو دعنا نعد واحداً لك. 4) أنشئ حملتك الأولى بمساعدة الذكاء الاصطناعي. 5) شاهد إعلاناتك تعمل وتتحسن تلقائياً!"
    },
    {
      questionEn: "What payment methods do you accept?",
      questionAr: "ما طرق الدفع التي تقبلونها؟",
      answerEn: "We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. For enterprise customers, we also offer invoicing options. All payments are processed securely through our payment partners.",
      answerAr: "نقبل بطاقات الائتمان الرئيسية (Visa، Mastercard، American Express)، PayPal، والتحويلات البنكية. للعملاء من الشركات الكبيرة، نقدم أيضاً خيارات الفواتير. تتم معالجة جميع المدفوعات بشكل آمن من خلال شركائنا في الدفع."
    },
    {
      questionEn: "Can I cancel my subscription anytime?",
      questionAr: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
      answerEn: "Yes! You can cancel your subscription at any time from your account settings. Your subscription will remain active until the end of your current billing period. We offer a 14-day money-back guarantee for new subscribers.",
      answerAr: "نعم! يمكنك إلغاء اشتراكك في أي وقت من إعدادات حسابك. سيظل اشتراكك نشطاً حتى نهاية فترة الفوترة الحالية. نقدم ضمان استرداد الأموال لمدة 14 يوماً للمشتركين الجدد."
    },
    {
      questionEn: "Do you provide customer support?",
      questionAr: "هل تقدمون دعم العملاء؟",
      answerEn: "Absolutely! We offer 24/7 customer support via email, live chat, and phone. Our dedicated support team is ready to help you with any questions about campaign setup, optimization, billing, or technical issues. Pro and Agency plans get priority support.",
      answerAr: "بالتأكيد! نقدم دعم العملاء على مدار الساعة عبر البريد الإلكتروني والدردشة الحية والهاتف. فريق الدعم المخصص لدينا جاهز لمساعدتك في أي أسئلة حول إعداد الحملات والتحسين والفواتير أو المشكلات التقنية. تحصل خطط Pro و Agency على دعم ذي أولوية."
    },
    {
      questionEn: "Is my data secure?",
      questionAr: "هل بياناتي آمنة؟",
      answerEn: "Your security is our top priority. We use industry-standard encryption (TLS 1.3, AES-256) for all data in transit and at rest. We're SOC 2 compliant and never share your data with third parties. OAuth tokens are stored securely and you can revoke access anytime.",
      answerAr: "أمانك هو أولويتنا القصوى. نستخدم تشفيراً بمعايير الصناعة (TLS 1.3، AES-256) لجميع البيانات أثناء النقل وأثناء التخزين. نحن متوافقون مع SOC 2 ولا نشارك بياناتك أبداً مع أطراف ثالثة. يتم تخزين رموز OAuth بشكل آمن ويمكنك إلغاء الوصول في أي وقت."
    }
  ];

  return (
    <>
      <div className="relative z-[1] pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[150px]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="mx-auto text-center lg:max-w-[650px] xl:max-w-[810px] 2xl:max-w-[785px] mb-[35px] md:mb-[50px] lg:mb-[65px] xl:mb-[90px]">
            <div className="inline-block relative mt-[10px] mb-[20px]">
              <span className="inline-block text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] rounded-md text-sm font-medium">
                {language === 'ar' ? 'الأسئلة الشائعة' : "FAQ's"}
              </span>
            </div>
            <h2 className="!mb-4 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] text-black dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'ar'
                ? 'هل لديك أسئلة؟ لدينا الإجابات!'
                : 'Do You Have Questions? We Have Answers!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'ar'
                ? 'اعثر على إجابات لأسئلتك الأكثر شيوعاً حول خدماتنا وأسعارنا والمزيد.'
                : 'Find answers to your most common questions about our services, pricing, and more.'}
            </p>
          </div>

          <div className="mx-auto md:max-w-[800px] space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`bg-gray-100 dark:bg-white/5 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-purple-500/30' : 'border-gray-200 dark:border-white/10'
                  }`}
              >
                <button
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="text-black dark:text-white font-medium text-base md:text-lg pr-4" dir={isRTL ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? item.questionAr : item.questionEn}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? item.answerAr : item.answerEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Faq;
