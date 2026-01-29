"use client";

import React, { useEffect } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import SplashCursor from "@/components/ui/SplashCursor";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function PrivacyPolicyPage() {
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
                {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-4">
                {language === 'ar'
                  ? 'في Furriyadh، نحن ملتزمون بحماية واحترام خصوصيتك.'
                  : 'At Furriyadh Limited, we are committed to protecting and respecting your privacy.'}
              </p>
              <div className="text-sm text-gray-400 uppercase tracking-wider">
                {language === 'ar' ? 'آخر تحديث: 5 يناير 2026' : 'Last Updated January 5th, 2026'}
              </div>
            </div>
          </div>

          {/* Privacy Content */}
          <div className="container 2xl:max-w-[800px] mx-auto px-4 pb-20">
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dir={isRTL ? 'rtl' : 'ltr'}>

              <p>
                {language === 'ar'
                  ? 'توضح سياسة الخصوصية هذه ("السياسة") متى ولماذا نجمع معلومات شخصية عن الأشخاص الذين يزورون موقعنا الإلكتروني، وكيف نستخدمها، والظروف التي قد نفصح عنها للآخرين، وكيف نحافظ على أمانها.'
                  : 'This Privacy Policy (the "Policy") explains when and why we collect personal information about people who visit our website, how we use it, the conditions under which we may disclose it to others, and how we keep it secure.'}
              </p>

              <p>
                {language === 'ar'
                  ? 'قد نقوم بتحديث هذه السياسة من وقت لآخر، لذا يرجى مراجعة هذه الصفحة أحياناً للتأكد من رضاك عن أي تغييرات. سنخطرك عبر البريد الإلكتروني عند تحديث هذه السياسة.'
                  : 'We may update this policy from time to time, so please check this page occasionally to ensure you are happy with any changes. We will notify you via email when this policy is updated.'}
              </p>

              <p>
                {language === 'ar'
                  ? 'يجب إرسال أي أسئلة بخصوص هذه السياسة وممارسات الخصوصية الخاصة بنا عبر البريد الإلكتروني إلى ads@furriyadh.com. بدلاً من ذلك، يمكنك التواصل مع مسؤول حماية البيانات (DPO) عبر البريد الإلكتروني privacy@furriyadh.com.'
                  : 'Any questions regarding this Policy and our privacy practices should be sent by email to ads@furriyadh.com. Alternatively, you can contact our Data Protection Officer (DPO) by email to privacy@furriyadh.com.'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'من نحن؟' : 'Who Are We?'}
              </h3>
              <p>
                {language === 'ar'
                  ? 'نحن Furriyadh Limited، شركة خاصة محدودة مسجلة في إنجلترا وويلز (رقم الشركة 16983712). موقعنا الرئيسي هو:'
                  : 'We are Furriyadh Limited, a private limited company incorporated in England and Wales (Company No. 16983712). Our main website is:'}
              </p>
              <ul className="list-disc pl-6">
                <li><a href="https://furriyadh.com/" className="text-primary-500 hover:underline">https://furriyadh.com/</a></li>
              </ul>
              <p>
                {language === 'ar'
                  ? 'يمكنك التواصل معنا على ads@furriyadh.com، أو التواصل مع مسؤول حماية البيانات لدينا على privacy@furriyadh.com'
                  : 'You can contact us at ads@furriyadh.com, or reach our DPO at privacy@furriyadh.com'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'كيف نجمع المعلومات منك؟' : 'How Do We Collect Information From You?'}
              </h3>
              <p>{language === 'ar' ? 'نجمع معلومات عنك عندما:' : 'We collect information about you when you:'}</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>{language === 'ar' ? 'تنشئ حساباً عبر الإنترنت.' : 'Create an online account.'}</li>
                <li>{language === 'ar' ? 'تشترك في نشرتنا الإخبارية.' : 'Subscribe to our newsletter.'}</li>
                <li>{language === 'ar' ? 'تستخدم تطبيقات الطرف الثالث المتكاملة مع Furriyadh.' : 'Use third-party applications integrated with Furriyadh.'}</li>
              </ol>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'ما نوع المعلومات التي نجمعها؟' : 'What Type of Information Do We Collect?'}
              </h3>
              <p>{language === 'ar' ? 'قد تشمل المعلومات الشخصية التي نجمعها:' : 'The personal information we collect may include:'}</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>{language === 'ar' ? 'الاسم الأول واسم العائلة، عنوان البريد الإلكتروني، عنوان العمل ورقم هاتف العمل.' : 'First and last name, email address, business address and business phone number.'}</li>
                <li>{language === 'ar' ? 'عنوان IP ومعلومات حول الصفحات التي تم الوصول إليها ومتى.' : 'IP address and information about pages accessed and when.'}</li>
                <li>{language === 'ar' ? 'عندما تختار ربط حسابات Google، Microsoft، Meta، Twitter، TikTok & LinkedIn الإعلانية، نجمع معلومات الحساب لنتمكن من تقديم خدماتنا لتحسين الحملات الإعلانية.' : 'When you choose to link your Google, Microsoft, Meta, Twitter, TikTok & LinkedIn advertiser accounts, we collect account information in order to be able to provide our services of optimising advertising campaigns.'}</li>
                <li>{language === 'ar' ? 'تفاصيل الدفع التي يتم جمعها من خلال معالجات الدفع من طرف ثالث (Paddle & Stripe). يتعامل هؤلاء المزودون مع بيانات الدفع الخاصة بك بشكل آمن؛ نحن لا نخزن معلومات بطاقات الائتمان أو الخصم.' : 'Payment details collected through our third-party payment processors (Paddle & Stripe). These providers securely handle your payment data; we do not store credit or debit card information.'}</li>
              </ol>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'كيف يتم استخدام معلوماتك؟' : 'How Is Your Information Used?'}
              </h3>
              <p>{language === 'ar' ? 'نستخدم معلوماتك من أجل:' : 'We use your information to:'}</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>{language === 'ar' ? 'تحسين حملاتك الإعلانية على شبكات الإعلانات المختلفة من طرف ثالث.' : 'Optimize your advertising campaigns on the different third-party advertising networks.'}</li>
                <li>{language === 'ar' ? 'الوفاء بالالتزامات التعاقدية.' : 'Fulfill contractual obligations.'}</li>
                <li>{language === 'ar' ? 'طلب ملاحظاتك حول خدماتنا.' : 'Seek your feedback on our services.'}</li>
                <li>{language === 'ar' ? 'إخطارك بالتغييرات على خدماتنا.' : 'Notify you of changes to our services.'}</li>
                <li>{language === 'ar' ? 'مشاركة المعلومات التي قد تهمك، بما في ذلك العروض الترويجية والتحديثات (إذا تم منح الموافقة).' : 'Share information that may interest you, including promotions and updates (if consent given).'}</li>
                <li>{language === 'ar' ? 'لأغراض الإعلان والتحليل.' : 'For advertising and analytical purposes.'}</li>
                <li>{language === 'ar' ? 'تحسين أعمالنا وموقعنا الإلكتروني واستراتيجياتنا الإعلانية.' : 'Improve our business, website, and advertising strategies.'}</li>
                <li>{language === 'ar' ? 'الامتثال للحقوق والالتزامات القانونية.' : 'Comply with legal rights and obligations.'}</li>
              </ol>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'من لديه حق الوصول إلى معلوماتك؟' : 'Who Has Access to Your Information?'}
              </h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>{language === 'ar' ? 'لا نبيع بياناتك:' : 'We Do Not Sell Your Data:'}</strong> {language === 'ar' ? 'لا نقوم ببيع أو تأجير معلوماتك لأطراف ثالثة.' : 'We do not sell or rent your information to third parties.'}</li>
                <li><strong>{language === 'ar' ? 'مقدمو خدمات الطرف الثالث:' : 'Third-Party Service Providers:'}</strong> {language === 'ar' ? 'قد نشارك معلوماتك مع مقدمي خدمات من طرف ثالث لأداء المهام أو تقديم الخدمات نيابة عنا.' : 'We may share your information with third-party service providers to perform tasks or provide services on our behalf.'}</li>
                <li><strong>{language === 'ar' ? 'الالتزامات القانونية:' : 'Legal Obligations:'}</strong> {language === 'ar' ? 'قد نفصح عن بياناتك إذا طُلب منا ذلك من قبل السلطات القانونية.' : 'We may disclose your data if we are required by legal authorities to do so.'}</li>
                <li><strong>{language === 'ar' ? 'نقل الأعمال:' : 'Business Transfers:'}</strong> {language === 'ar' ? 'قد تتم مشاركة بياناتك كجزء من إعادة هيكلة الأعمال أو البيع أو نقل الأصول.' : 'Your data may be shared as part of a business restructuring, sale, or transfer of assets.'}</li>
              </ol>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'خياراتك' : 'Your Choices'}
              </h3>
              <p>
                {language === 'ar'
                  ? 'يمكنك اختيار تلقي الاتصالات التسويقية منا عن طريق تحديد المربع المناسب عند تقديم معلوماتك. لن نتصل بك لأغراض تسويقية عبر البريد الإلكتروني ما لم تمنح موافقتك المسبقة.'
                  : 'You can choose to receive marketing communications from us by ticking the relevant box when providing your information. We will not contact you for marketing purposes by email unless you have given your prior consent.'}
              </p>
              <p>
                {language === 'ar'
                  ? 'يمكنك تغيير تفضيلاتك في أي وقت من خلال التواصل معنا على privacy@furriyadh.com'
                  : 'You can change your preferences at any time by contacting us at privacy@furriyadh.com'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'حقوقك بموجب اللائحة العامة لحماية البيانات' : 'Your Rights Under GDPR'}
              </h3>
              <p>{language === 'ar' ? 'بصفتك صاحب بيانات، لديك الحقوق التالية:' : 'As a data subject, you have the following rights:'}</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li><strong>{language === 'ar' ? 'الوصول:' : 'Access:'}</strong> {language === 'ar' ? 'طلب الوصول إلى بياناتك الشخصية.' : 'Request access to your personal data.'}</li>
                <li><strong>{language === 'ar' ? 'التصحيح:' : 'Rectification:'}</strong> {language === 'ar' ? 'تصحيح البيانات غير الدقيقة أو غير الكاملة.' : 'Correct inaccurate or incomplete data.'}</li>
                <li><strong>{language === 'ar' ? 'المسح:' : 'Erasure:'}</strong> {language === 'ar' ? 'طلب حذف بياناتك.' : 'Request deletion of your data.'}</li>
                <li><strong>{language === 'ar' ? 'التقييد:' : 'Restriction:'}</strong> {language === 'ar' ? 'تقييد معالجة بياناتك.' : 'Limit processing of your data.'}</li>
                <li><strong>{language === 'ar' ? 'الاعتراض:' : 'Objection:'}</strong> {language === 'ar' ? 'الاعتراض على معالجة البيانات.' : 'Object to data processing.'}</li>
                <li><strong>{language === 'ar' ? 'نقل البيانات:' : 'Data Portability:'}</strong> {language === 'ar' ? 'طلب بياناتك بتنسيق قابل للنقل.' : 'Request your data in a portable format.'}</li>
                <li><strong>{language === 'ar' ? 'سحب الموافقة:' : 'Withdraw Consent:'}</strong> {language === 'ar' ? 'سحب الموافقة على معالجة البيانات.' : 'Withdraw consent for data processing.'}</li>
                <li><strong>{language === 'ar' ? 'الشكوى:' : 'Complain:'}</strong> {language === 'ar' ? 'تقديم شكوى إلى سلطة إشرافية.' : 'Lodge a complaint with a supervisory authority.'}</li>
              </ol>
              <p>
                {language === 'ar'
                  ? 'لممارسة هذه الحقوق، تواصل معنا على privacy@furriyadh.com.'
                  : 'To exercise these rights, contact us at privacy@furriyadh.com.'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'أمان البيانات' : 'Data Security'}
              </h3>
              <ol className="list-decimal pl-6 space-y-1">
                <li>{language === 'ar' ? 'نتخذ خطوات معقولة لحماية بياناتك، بما في ذلك التشفير والتخزين الآمن.' : 'We take reasonable steps to protect your data, including encryption and secure storage.'}</li>
                <li>{language === 'ar' ? 'يتم تشفير المعلومات الحساسة (مثل تفاصيل الدفع) ونقلها بشكل آمن. لا يتم تخزين تفاصيل الدفع الكاملة مثل أرقام بطاقات الائتمان في قواعد بياناتنا.' : 'Sensitive information (e.g., payment details) is encrypted and transmitted securely. Complete payment details such as credit card numbers are never stored in our databases.'}</li>
              </ol>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'استخدام ملفات تعريف الارتباط' : 'Use of Cookies'}
              </h3>
              <p>
                {language === 'ar'
                  ? 'ملفات تعريف الارتباط هي أجزاء صغيرة من البيانات المخزنة على جهازك لتحسين تجربتك على موقعنا. يمكنك تعطيل ملفات تعريف الارتباط في إعدادات متصفحك؛ ومع ذلك، قد يقلل هذا من الوظائف.'
                  : 'Cookies are small pieces of data stored on your device to enhance your experience on our site. You can disable cookies in your browser settings; however, this may reduce functionality.'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'روابط لمواقع أخرى' : 'Links to Other Websites'}
              </h3>
              <p>
                {language === 'ar'
                  ? 'قد يحتوي موقعنا الإلكتروني على روابط لمواقع طرف ثالث. نحن غير مسؤولين عن ممارسات الخصوصية الخاصة بهم. يرجى مراجعة سياساتهم.'
                  : 'Our website may contain links to third-party websites. We are not responsible for their privacy practices. Please review their policies.'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'الأطفال دون سن 16' : 'Children Under 16'}
              </h3>
              <p>
                {language === 'ar'
                  ? 'نحن لا نجمع بيانات من الأطفال دون سن 16 عمداً. إذا كان عمرك أقل من 16 عاماً، يرجى الحصول على موافقة الوالدين قبل تقديم معلومات شخصية.'
                  : 'We do not knowingly collect data from children under 16. If you are under 16, please obtain parental consent before providing personal information.'}
              </p>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'إشعارات خرق البيانات' : 'Data Breach Notifications'}
              </h3>
              <p>{language === 'ar' ? 'في حالة حدوث خرق للبيانات، سنقوم بـ:' : 'In the event of a data breach, we will:'}</p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>{language === 'ar' ? 'إخطار المستخدمين المتأثرين في غضون 72 ساعة إذا كان الخرق يشكل خطراً على حقوقك وحرياتك.' : 'Notify affected users within 72 hours if the breach poses a risk to your rights and freedoms.'}</li>
                <li>{language === 'ar' ? 'الإبلاغ عن الخرق إلى السلطة المختصة إذا لزم الأمر.' : 'Report the breach to the relevant authority if required.'}</li>
              </ol>

              <hr className="border-gray-200 dark:border-gray-700 my-8" />

              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'ar' ? 'مراجعة هذه السياسة' : 'Review of This Policy'}
              </h3>
              <p>
                {language === 'ar'
                  ? 'نحن نراجع هذه السياسة بانتظام. سيتم التواصل بشأن التحديثات عبر البريد الإلكتروني وستكون متاحة على موقعنا الإلكتروني.'
                  : 'We review this Policy regularly. Updates will be communicated via email and available on our website.'}
              </p>
              <p className="text-center mt-8">
                {language === 'ar'
                  ? 'لمزيد من الأسئلة، تواصل معنا على privacy@furriyadh.com'
                  : 'For further questions, contact us at privacy@furriyadh.com'}
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
