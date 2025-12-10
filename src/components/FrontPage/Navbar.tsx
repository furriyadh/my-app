"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/hooks/useTranslation";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleToggle = () => setMenuOpen(!isMenuOpen);

  const NAV_ITEMS = [
    { name: t.navbar.home, path: "/" },
    { name: t.navbar.features, path: "/front-pages/features/" },
    { name: t.navbar.team, path: "/front-pages/team/" },
    { name: t.navbar.faq, path: "/front-pages/faq/" },
    { name: t.navbar.contact, path: "/front-pages/contact/" },
    { name: t.navbar.admin, path: "/dashboard/ecommerce/", isAdmin: true },
  ];

  // Switch language function
  const switchLanguage = (langCode: string) => {
    setLanguage(langCode as SupportedLanguage);
    
    // إلغاء المؤقت وإغلاق القائمة فوراً
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setLanguageDropdownOpen(false);
  };

  const handleLanguageMouseEnter = () => {
    // إلغاء أي مؤقت سابق
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setLanguageDropdownOpen(true);
    
    // إغلاق تلقائي بعد 2 ثانية
    closeTimeoutRef.current = setTimeout(() => {
      setLanguageDropdownOpen(false);
      closeTimeoutRef.current = null;
    }, 2000);
  };

  const handleLanguageMouseLeave = () => {
    // عند مغادرة المنطقة، إبقاء المؤقت يعمل
    // القائمة ستغلق بعد 2 ثانية من الدخول
  };


  // handleScroll
  useEffect(() => {
    const elementId = document.getElementById("navbar");
    const handleScroll = () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("is-sticky");
      } else {
        elementId?.classList.remove("is-sticky");
      }
    };

    document.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("scroll", handleScroll);
      // تنظيف المؤقت عند unmount
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
      <div
        className="fixed top-0 right-0 left-0 transition-all h-auto z-[5] py-[20px]"
        id="navbar"
      >
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="flex items-center relative flex-wrap lg:flex-nowrap justify-between lg:justify-start">
            <Link
              href="/"
              className="inline-block max-w-[130px] ltr:mr-[15px] rtl:ml-[15px]"
            >
              <Image
                src="/images/logo-big.svg"
                alt="logo"
                className="inline-block dark:hidden"
                width={126}
                height={36}
              />
              <Image
                src="/images/white-logo-big.svg"
                alt="logo"
                className="hidden dark:inline-block"
                width={126}
                height={36}
              />
            </Link>

            <button
              type="button"
              className="relative w-[36px] h-[36px] flex flex-col items-center justify-center gap-[6px] p-1 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 lg:hidden group"
              onClick={handleToggle}
              aria-label="Toggle menu"
            >
              <span className={`h-[3px] w-[24px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 pointer-events-none ${isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
              <span className={`h-[3px] w-[24px] rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 pointer-events-none ${isMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
              <span className={`h-[3px] w-[24px] rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 pointer-events-none ${isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
              
              {/* AI Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300 pointer-events-none"></div>
            </button>

            {/* For Big Devices */}
            <div className="hidden lg:flex items-center grow basis-full">
              <ul className="flex ltr:ml-[30px] rtl:mr-[30px] ltr:xl:ml-[55px] rtl:xl:mr-[55px] flex-row gap-[30px] xl:gap-[50px]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`font-medium transition-all hover:text-primary-600 text-[15px] xl:text-md dark:text-gray-400 ${
                        pathname === item.path
                          ? "text-primary-600 dark:text-primary-600"
                          : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                
                {/* Languages Dropdown */}
                <li 
                  className="relative"
                  onMouseEnter={handleLanguageMouseEnter}
                  onMouseLeave={handleLanguageMouseLeave}
                >
                  <button
                    className="font-medium transition-all hover:text-primary-600 text-[15px] xl:text-md dark:text-gray-400 flex items-center gap-1"
                  >
                    <span className="font-semibold text-[16px]">{language.toUpperCase()}</span>
                    <i className="material-symbols-outlined !text-[18px]">
                      expand_more
                    </i>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isLanguageDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[280px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <div className="py-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                              language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                          >
                            <Image 
                              src={lang.flag} 
                              alt={lang.name} 
                              width={28} 
                              height={28} 
                              className="rounded-sm"
                            />
                            <span className="text-base font-medium text-gray-900 dark:text-white">
                              {lang.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              </ul>

              <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-[15px]">
                <Link
                  href="/authentication/sign-in"
                  className="inline-block text-purple-600 lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] rounded-md transition-all font-medium border border-purple-600 hover:text-white hover:bg-purple-500 hover:border-purple-500"
                >
                  <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                      login
                    </i>
                    {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                  </span>
                </Link>

                <Link
                  href="/authentication/sign-up"
                  className="inline-block lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] bg-purple-600 text-white rounded-md transition-all font-medium border border-purple-600 hover:bg-purple-500 hover:border-purple-500"
                >
                  <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                      person
                    </i>
                    {language === 'ar' ? 'تسجيل حساب' : 'Register'}
                  </span>
                </Link>
              </div>
            </div>

            {/* For Resposive */}
            <div
              className={`fixed left-0 right-0 top-[76px] bg-black/95 dark:bg-black/95 backdrop-blur-xl border-t border-white/10 p-[20px] md:p-[30px] w-full lg:hidden shadow-2xl shadow-purple-500/10 max-h-[calc(100vh-76px)] overflow-y-auto z-[999] ${
                isMenuOpen ? "block" : "hidden"
              }`}
              id="navbar-collapse"
            >
              <ul>
                {NAV_ITEMS.map((item) => (
                  <li
                    key={item.path}
                    className="my-[14px] md:my-[16px] first:mt-0 last:mb-0"
                  >
                    <Link
                      href={item.path}
                      className={`font-medium dark:text-primary-600 transition-all hover:text-primary-600 ${
                        pathname === item.path ? "text-primary-600" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                
                {/* Languages for Mobile - Collapsible */}
                <li className="my-[14px] md:my-[16px]">
                  <button
                    onClick={() => setMobileLanguageOpen(!isMobileLanguageOpen)}
                    className="w-full flex items-center justify-between font-semibold text-gray-900 dark:text-white text-base py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <i className="material-symbols-outlined !text-[20px] text-purple-600">
                        language
                      </i>
                      <span>{t.common.languages}</span>
                  </div>
                    <i className={`material-symbols-outlined !text-[20px] transition-transform duration-300 ${isMobileLanguageOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </i>
                  </button>
                  
                  {/* Dropdown Content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isMobileLanguageOpen ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pl-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                          onClick={() => {
                            switchLanguage(lang.code);
                            setMobileLanguageOpen(false);
                          }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                            language === lang.code ? 'bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-600' : ''
                        }`}
                      >
                        <Image 
                          src={lang.flag} 
                          alt={lang.name} 
                          width={24} 
                          height={24} 
                          className="rounded-sm"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {lang.name}
                        </span>
                      </button>
                    ))}
                    </div>
                  </div>
                </li>
              </ul>

              <div className="flex items-center gap-[15px] mt-[14px] md:mt-[16px]">
                <Link
                  href="/authentication/sign-in"
                  className="inline-block text-purple-600 lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] rounded-md transition-all font-medium border border-purple-600 hover:text-white hover:bg-purple-500 hover:border-purple-500"
                >
                  <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                      login
                    </i>
                    {t.common.login}
                  </span>
                </Link>

                <Link
                  href="/authentication/sign-up"
                  className="inline-block lg:text-[15px] xl:text-[16px] py-[11px] px-[17px] bg-purple-600 text-white rounded-md transition-all font-medium border border-purple-600 hover:bg-purple-500 hover:border-purple-500"
                >
                  <span className="inline-block relative ltr:pl-[25px] rtl:pr-[25px] ltr:md:pl-[29px] rtl:md:pr-[29px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 top-1/2 -translate-y-1/2 !text-[20px] md:!text-[24px]">
                      person
                    </i>
                    {t.common.register}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
