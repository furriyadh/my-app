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

              <p className="leading-[1.6]" dir={isRTL ? 'rtl' : 'ltr'}>
                {t.footer.description}
              </p>

              <div className="mt-[20px] md:mt-[35px]">
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  className="inline-block leading-none text-[20px] text-primary-600 transition-all hover:text-primary-500 ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <i className="ri-facebook-fill"></i>
                </a>
                <a
                  href="https://x.com/?lang=en"
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
                  href="https://www.dribbble.com/"
                  target="_blank"
                  className="inline-block leading-none text-[20px] text-primary-600 transition-all hover:text-primary-500 ltr:mr-[8px] rtl:ml-[8px] ltr:last:mr-0 rtl:last:ml-0"
                >
                  <i className="ri-dribbble-fill"></i>
                </a>
              </div>
            </div>

            <div className="ltr:xl:pl-[142px] rtl:xl:pr-[142px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>
                {t.footer.products}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.trezoDashboard}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <a
                    href="#"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.tagusAdmin}
                  </a>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <a
                    href="#"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.eCademyLMS}
                  </a>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <a
                    href="#"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.admashTemplate}
                  </a>
                </li>
              </ul>
            </div>

            <div className="ltr:xl:pl-[130px] rtl:xl:pr-[130px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>
                {t.footer.quickLinks}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.home}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-page/features/"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.features}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-page/team"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.navbar.team}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/front-page/contact"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.contact}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="ltr:xl:pl-[80px] rtl:xl:pr-[80px]">
              <h3 className="!leading-[1.2] !text-[16px] md:!text-lg !mb-[18px] !font-semibold" dir={isRTL ? 'rtl' : 'ltr'}>
                {t.footer.privacy}
              </h3>
              <ul>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/terms"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.termsConditions}
                  </Link>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <a
                    href="#"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.cookiePolicy}
                  </a>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <a
                    href="#"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.noticeAtCollection}
                  </a>
                </li>
                <li className="mb-[10px] last:mb-0">
                  <Link
                    href="/privacy"
                    className="lg:text-[16px] inline-block text-gray-500 dark:text-gray-400 transition-all hover:text-primary-600"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-[15px] md:py-[20px] mt-[60px] md:mt-[80px] lg:mt-[100px] bg-white dark:bg-[#0c1427] text-center">
          <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
            <p className="leading-[1.6]" dir={isRTL ? 'rtl' : 'ltr'}>
              © <span className="text-purple-500">2025, Furriyadh</span> {t.footer.copyright}{" "}
              <a
                href="https://furriyadh.com/"
                target="_blank"
                className="text-primary-500 transition-all hover:underline"
              >
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
