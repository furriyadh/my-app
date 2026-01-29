"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Facebook, Twitter, Linkedin, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  const { t, language, isRTL } = useTranslation();

  return (
    <>
      <div className="pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[150px] border-t border-purple-500/20 backdrop-blur-md dark:bg-black/10 relative z-10">
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
                  alt="Furriyadh"
                  width={132}
                  height={53}
                />
              </Link>

              <p className="leading-[1.7] text-gray-600 dark:text-gray-300 text-base md:text-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar'
                  ? 'منصة متقدمة لإدارة حملات إعلانات جوجل بالذكاء الاصطناعي، نقدم لوحة تحكم ذكية لمتابعة الأداء والميزانيات.'
                  : 'AI-powered Google Ads management platform with smart dashboards for real-time performance and budget monitoring.'}
              </p>

              {/* Contact Info */}
              <div className="mt-[15px] space-y-2">
                <a
                  href="tel:+15303504377"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all text-sm"
                >
                  <Phone className="w-4 h-4 text-primary-500" />
                  +1 530 350 4377
                </a>
                <a
                  href="mailto:ads@furriyadh.com"
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all text-sm"
                >
                  <Mail className="w-4 h-4 text-primary-500" />
                  ads@furriyadh.com
                </a>
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300 text-sm">
                  <MapPin className="w-4 h-4 text-primary-500 mt-1" />
                  <span>
                    <span>
                      Office 7132KR, 182-184 High Street North<br />
                      Area 1/1, East Ham, London, E6 2JA<br />
                      United Kingdom
                    </span>
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-[20px] md:mt-[25px] flex items-center">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Facebook page"
                  className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full leading-none text-purple-500 transition-all hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://x.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Twitter profile"
                  className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full leading-none text-purple-500 transition-all hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our LinkedIn profile"
                  className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full leading-none text-purple-500 transition-all hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Instagram profile"
                  className="inline-flex items-center justify-center w-[35px] h-[35px] rounded-full leading-none text-purple-500 transition-all hover:text-purple-400 hover:bg-purple-500/10 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="ltr:xl:pl-[80px] rtl:xl:pr-[80px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold text-black dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'خدماتنا' : 'Our Services'}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/dashboard/google-ads"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all whitespace-nowrap"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'إدارة إعلانات جوجل' : 'Google Ads Management'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/dashboard/google-ads/campaigns"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all whitespace-nowrap"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'إنشاء الحملات بالذكاء الاصطناعي' : 'AI Campaign Creation'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/pricing"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all whitespace-nowrap"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الخطط والأسعار' : 'Pricing Plans'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/features"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all whitespace-nowrap"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الميزات' : 'Features'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="ltr:xl:pl-[60px] rtl:xl:pr-[60px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold text-black dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/team"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'فريقنا' : 'Our Team'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/faq"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/contact"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="ltr:xl:pl-[40px] rtl:xl:pr-[40px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold text-black dark:text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {language === 'ar' ? 'القانونية' : 'Legal'}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/terms"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/privacy"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/cookies"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/refund"
                    className="lg:text-[16px] inline-block text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-white transition-all"
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
        <div className="py-[15px] md:py-[20px] mt-[60px] md:mt-[80px] lg:mt-[100px] text-center border-t border-purple-500/10">
          <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
            <p className="leading-[1.6] text-gray-600 dark:text-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
              © <span className="text-purple-500">2026, Furriyadh</span> {language === 'ar' ? '. جميع الحقوق محفوظة.' : '. All rights reserved.'}
            </p>
            <p className="leading-[1.6] text-gray-500 dark:text-gray-400 mt-0.5">
              Designed with <span className="text-red-500">♥</span> by <a href="https://furriyadh.com" className="text-purple-500 hover:text-purple-400 transition-colors">Furriyadh.com</a>
            </p>
          </div>
        </div>
      </div >
    </>
  );
};

export default Footer;
