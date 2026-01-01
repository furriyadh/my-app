"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";

const Footer: React.FC = () => {
  const { t, language, isRTL } = useTranslation();

  return (
    <>
      <div className="pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[150px] border-t border-purple-500/40 bg-black/80 backdrop-blur-sm">
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px]">
            {/* Logo & Description */}
            <div className="ltr:xl:-mr-[35px] rtl:xl:-ml-[35px]">
              <Link
                href="/"
                className="inline-block max-w-[132px] mb-[20px] md:mb-[23px]"
              >
                <Image
                  src="/images/logo-big.svg"
                  alt="logo"
                  className="inline-block dark:hidden"
                  width={132}
                  height={53}
                />
                <Image
                  src="/images/white-logo-big.svg"
                  alt="logo"
                  className="hidden dark:inline-block"
                  width={132}
                  height={53}
                />
              </Link>

              <p className="leading-[1.6] text-gray-300" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar'
                  ? 'منصة متقدمة لإدارة حملات إعلانات جوجل بالذكاء الاصطناعي، نقدم لوحة تحكم ذكية لمتابعة الأداء والميزانيات.'
                  : 'AI-powered Google Ads management platform with smart dashboards for real-time performance and budget monitoring.'}
              </p>

              {/* Contact Info */}
              <div className="mt-[15px] space-y-2">
                <a
                  href="tel:+15303504377"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-all text-sm"
                >
                  <i className="ri-phone-fill text-primary-500"></i>
                  +1 530 350 4377
                </a>
                <a
                  href="mailto:support@furriyadh.com"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-all text-sm"
                >
                  <i className="ri-mail-fill text-primary-500"></i>
                  support@furriyadh.com
                </a>
                <div className="flex items-start gap-2 text-gray-300 text-sm">
                  <i className="ri-map-pin-fill text-primary-500 mt-1"></i>
                  <span>
                    350 5th Avenue, Empire State Building<br />
                    New York, NY 10118
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-[20px] md:mt-[25px]">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  className="inline-block leading-none text-[20px] text-primary-600 transition-all hover:text-primary-500 ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <i className="ri-facebook-fill"></i>
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  className="inline-block leading-none text-[20px] text-primary-600 transition-all hover:text-primary-500 ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <i className="ri-twitter-x-fill"></i>
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  className="inline-block leading-none text-[20px] text-primary-600 transition-all hover:text-primary-500 ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <i className="ri-linkedin-fill"></i>
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  className="inline-block leading-none text-[20px] text-primary-600 transition-all hover:text-primary-500 ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <i className="ri-instagram-fill"></i>
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="ltr:xl:pl-[142px] rtl:xl:pr-[142px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold !text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'خدماتنا' : 'Our Services'}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/google-ads"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'إدارة إعلانات جوجل' : 'Google Ads Management'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/google-ads/campaigns"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'إنشاء الحملات بالذكاء الاصطناعي' : 'AI Campaign Creation'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/google-ads/billing"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الخطط والأسعار' : 'Pricing Plans'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-pages/features"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الميزات' : 'Features'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="ltr:xl:pl-[130px] rtl:xl:pr-[130px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold !text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-pages/team"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'فريقنا' : 'Our Team'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-pages/faq"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-pages/contact"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="ltr:xl:pl-[80px] rtl:xl:pr-[80px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold !text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'القانونية' : 'Legal'}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/terms"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/privacy"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/cookies"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/refund"
                    className="lg:text-[16px] inline-block text-gray-300 hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'سياسة الاسترجاع' : 'Refund Policy'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-[15px] md:py-[20px] mt-[60px] md:mt-[80px] lg:mt-[100px] bg-[#0a0e19]/90 backdrop-blur-md text-center border-t border-white/10">
          <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
            <p className="leading-[1.6] text-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
              © <span className="text-purple-500">2025, Furriyadh</span> {language === 'ar' ? '. جميع الحقوق محفوظة.' : '. All rights reserved.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
