"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react";

const ContactUs: React.FC = () => {
  const { language, isRTL } = useTranslation();

  return (
    <>
      <div className="pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[150px]">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-start">

            {/* Left Side - Contact Info */}
            <div className="space-y-8">
              {/* Header */}
              <div>
                <div className="inline-block relative mt-[10px] mb-[20px]">
                  <span className="inline-block text-purple-600 border border-purple-600 py-[5.5px] px-[17.2px] rounded-md text-sm font-medium">
                    {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </span>
                </div>
                <h2 className="!mb-4 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] text-black dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                  {language === 'ar'
                    ? 'كيف يمكننا مساعدتك؟ نحب أن نسمع منك!'
                    : 'How Can We Help? We Love to Hear From You!'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400" dir={isRTL ? 'rtl' : 'ltr'}>
                  {language === 'ar'
                    ? 'فريقنا متاح لمساعدتك في أي استفسار. لا تتردد في التواصل معنا.'
                    : 'Our team is available to assist you with any inquiries. Do not hesitate to reach out.'}
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-4 p-5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:border-purple-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-purple-400" />
                  </div>
                  <div dir={isRTL ? 'rtl' : 'ltr'}>
                    <h3 className="text-black dark:text-white font-semibold mb-1">
                      {language === 'ar' ? 'اتصل بنا' : 'Call Us'}
                    </h3>
                    <a href="tel:+15303504377" className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors">
                      +1 530 350 4377
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div dir={isRTL ? 'rtl' : 'ltr'}>
                    <h3 className="text-black dark:text-white font-semibold mb-1">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email Us'}
                    </h3>
                    <a href="mailto:ads@furriyadh.com" className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors">
                      ads@furriyadh.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <div dir={isRTL ? 'rtl' : 'ltr'}>
                    <h3 className="text-black dark:text-white font-semibold mb-1">
                      {language === 'ar' ? 'العنوان' : 'Our Address'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Office 7132KR, 182-184 High Street North<br />
                      Area 1/1, East Ham, London, E6 2JA, UK
                    </p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div dir={isRTL ? 'rtl' : 'ltr'}>
                    <h3 className="text-black dark:text-white font-semibold mb-1">
                      {language === 'ar' ? 'ساعات العمل' : 'Business Hours'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'ar'
                        ? 'الأحد - الخميس: 9 صباحاً - 6 مساءً (EST)'
                        : 'Sun - Thu: 9 AM - 6 PM (EST)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form */}
            <div className="p-6 md:p-8 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white">
                  {language === 'ar' ? 'أرسل رسالة' : 'Send a Message'}
                </h3>
              </div>

              <form className="space-y-5">
                <div>
                  <label className="mb-2 text-black dark:text-white font-medium block text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    className="h-[50px] rounded-xl text-black dark:text-white border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 block w-full outline-0 transition-all placeholder:text-gray-500 focus:border-purple-500"
                    placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your full name'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <label className="mb-2 text-black dark:text-white font-medium block text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    className="h-[50px] rounded-xl text-black dark:text-white border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 block w-full outline-0 transition-all placeholder:text-gray-500 focus:border-purple-500"
                    placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your email address'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div>
                  <label className="mb-2 text-black dark:text-white font-medium block text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    className="h-[50px] rounded-xl text-black dark:text-white border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 block w-full outline-0 transition-all placeholder:text-gray-500 focus:border-purple-500"
                    placeholder={language === 'ar' ? 'رقم هاتفك' : 'Your phone number'}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="mb-2 text-black dark:text-white font-medium block text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    className="h-[120px] rounded-xl text-black dark:text-white border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 block w-full outline-0 transition-all placeholder:text-gray-500 focus:border-purple-500 resize-none"
                    placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl transition-all font-semibold hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
