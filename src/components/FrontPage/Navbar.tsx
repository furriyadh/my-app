"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/hooks/useTranslation";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const handleToggle = () => setMenuOpen(!isMenuOpen);

  // Initialize theme state from DOM (the head script already applied the class)
  useEffect(() => {
    // Read the current state from DOM - don't modify it
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark');
    setIsDarkMode(isDark);
    setMounted(true);
  }, []);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Update localStorage and DOM immediately
    localStorage.setItem("theme", newMode ? "dark" : "light");
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      if (newMode) {
        htmlElement.classList.add("dark");
      } else {
        htmlElement.classList.remove("dark");
      }
    }
  };


  const NAV_ITEMS = [
    { name: t.navbar.home, path: "/" },
    { name: t.navbar.features, path: "/features" },
    { name: language === 'ar' ? 'الأسعار' : 'Pricing', path: "/pricing" },
    { name: t.navbar.team, path: "/team" },
    { name: t.navbar.faq, path: "/faq" },
    { name: t.navbar.contact, path: "/contact" },
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
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 100);
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
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
        className={`fixed top-0 right-0 left-0 transition-all h-auto z-[999] ${isSticky
          ? "bg-white/95 dark:bg-[#0a0e19]/95 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 py-[12px] shadow-lg shadow-black/10 dark:shadow-black/20"
          : "bg-white/80 dark:bg-[#0a0e19]/80 backdrop-blur-md py-[16px]"
          }`}
        id="navbar"
      >
        <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
          <div className="flex items-center relative flex-wrap lg:flex-nowrap justify-between lg:justify-start">
            {/* Logo */}
            <Link
              href="/"
              className="inline-block max-w-[130px] ltr:mr-[15px] rtl:ml-[15px]"
            >
              <Image
                src="/images/logo-big.svg"
                alt="Furriyadh"
                width={126}
                height={36}
              />
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="relative w-[40px] h-[40px] flex flex-col items-center justify-center gap-[5px] p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-purple-500/40 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-white/10 lg:hidden group"
              onClick={handleToggle}
              aria-label="Toggle menu"
            >
              <span className={`h-[2px] w-[20px] rounded-full bg-gray-800 dark:bg-white transition-all duration-300 pointer-events-none ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
              <span className={`h-[2px] w-[20px] rounded-full bg-gray-800 dark:bg-white transition-all duration-300 pointer-events-none ${isMenuOpen ? 'opacity-0 scale-0' : ''}`}></span>
              <span className={`h-[2px] w-[20px] rounded-full bg-gray-800 dark:bg-white transition-all duration-300 pointer-events-none ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center grow basis-full">
              {/* Nav Links */}
              <ul className="flex ltr:ml-[40px] rtl:mr-[40px] ltr:xl:ml-[60px] rtl:xl:mr-[60px] flex-row gap-[8px]">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`font-medium transition-all text-[14px] xl:text-[15px] px-4 py-2 rounded-full hover:bg-purple-500/10 ${pathname === item.path
                        ? 'bg-purple-600 !text-white'
                        : ''
                        }`}
                      style={{ color: pathname === item.path ? '#ffffff' : (isDarkMode ? '#d1d5db' : '#374151') }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Right Side Controls */}
              <div className="flex items-center ltr:ml-auto rtl:mr-auto gap-[15px]">
                {/* Theme Toggle Button - Same as other pages */}
                <button
                  type="button"
                  className="leading-none inline-block transition-all hover:opacity-80"
                  onClick={handleThemeToggle}
                  aria-label="Toggle theme"
                >
                  <i className="material-symbols-outlined !text-[22px] text-[#fe7a36]">
                    light_mode
                  </i>
                </button>

                {/* Language Dropdown - Dashboard Style */}
                <div
                  className="relative"
                  onMouseEnter={handleLanguageMouseEnter}
                  onMouseLeave={handleLanguageMouseLeave}
                >
                  <button
                    className="leading-none pr-[12px] inline-block transition-all relative hover:text-primary-500 font-semibold text-[15px] text-gray-800 dark:text-white"
                  >
                    <span className="uppercase">{language}</span>
                    <i className="ri-arrow-down-s-line text-[15px] absolute -right-[3px] top-1/2 -translate-y-1/2"></i>
                  </button>

                  {/* Dropdown Menu */}
                  {isLanguageDropdownOpen && (
                    <div className="absolute top-full ltr:right-0 rtl:left-0 mt-4 w-[280px] bg-white dark:bg-[#0c1427] rounded-lg shadow-2xl border border-gray-100 dark:border-[#172036] overflow-hidden z-50">
                      <span className="block text-black dark:text-white font-semibold px-[20px] py-[14px] text-sm border-b border-gray-100 dark:border-[#172036]">
                        {language === 'ar' ? 'اختر اللغة' : 'Choose Language'}
                      </span>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => switchLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-[20px] py-[12px] transition-all hover:bg-gray-50 dark:hover:bg-[#172036] cursor-pointer ${language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                              }`}
                          >
                            <Image
                              src={lang.flag}
                              alt={lang.name}
                              width={28}
                              height={28}
                              className="rounded-sm"
                            />
                            <span className={`flex-1 ltr:text-left rtl:text-right text-black dark:text-white ${language === lang.code ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}>
                              {lang.name}
                            </span>
                            {language === lang.code && (
                              <i className="material-symbols-outlined !text-[16px] text-primary-600 dark:text-primary-400">
                                check
                              </i>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Login Button */}
                <Link
                  href="/authentication/sign-in"
                  className="inline-flex items-center gap-2 text-[14px] py-[10px] px-[18px] rounded-full transition-all font-medium text-gray-800 dark:text-white border border-gray-300 dark:border-white/20 hover:border-purple-500 hover:bg-purple-500/10"
                >
                  <i className="material-symbols-outlined !text-[18px]">
                    login
                  </i>
                  {language === 'ar' ? 'دخول' : 'Login'}
                </Link>

                {/* Register Button */}
                <Link
                  href="/authentication/sign-up"
                  className="inline-flex items-center gap-2 text-[14px] py-[10px] px-[20px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full transition-all font-semibold hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25"
                >
                  <i className="material-symbols-outlined !text-[18px]">
                    person_add
                  </i>
                  {language === 'ar' ? 'سجل الآن' : 'Get Started'}
                </Link>
              </div>
            </div>

            {/* Mobile Menu */}
            <div
              className={`fixed left-0 right-0 top-[68px] bg-white/98 dark:bg-[#0a0e19]/98 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 p-[20px] md:p-[30px] w-full lg:hidden shadow-2xl max-h-[calc(100vh-68px)] overflow-y-auto z-[999] transform transition-all duration-300 ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                }`}
              id="navbar-collapse"
            >
              <ul className="space-y-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block font-medium transition-all px-4 py-3 rounded-xl ${pathname === item.path
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}

                {/* Languages for Mobile - Collapsible */}
                <li>
                  <button
                    onClick={() => setMobileLanguageOpen(!isMobileLanguageOpen)}
                    className="w-full flex items-center justify-between font-medium text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <i className="material-symbols-outlined !text-[20px] text-purple-400">
                        language
                      </i>
                      <span>{t.common.languages}</span>
                    </div>
                    <i className={`material-symbols-outlined !text-[20px] transition-transform duration-300 ${isMobileLanguageOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </i>
                  </button>

                  {/* Dropdown Content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isMobileLanguageOpen ? 'max-h-[400px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-1 max-h-[350px] overflow-y-auto custom-scrollbar pl-4">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            switchLanguage(lang.code);
                            setMobileLanguageOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer ${language === lang.code ? 'bg-purple-600/20 border-l-2 border-purple-500' : ''
                            }`}
                        >
                          <Image
                            src={lang.flag}
                            alt={lang.name}
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {lang.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              </ul>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                <Link
                  href="/authentication/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-[15px] py-3 px-4 rounded-xl transition-all font-medium text-gray-800 dark:text-white border border-gray-300 dark:border-white/20 hover:border-purple-500 hover:bg-purple-500/10"
                >
                  <i className="material-symbols-outlined !text-[20px]">
                    login
                  </i>
                  {t.common.login}
                </Link>

                <Link
                  href="/authentication/sign-up"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-[15px] py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl transition-all font-semibold hover:from-purple-500 hover:to-indigo-500"
                >
                  <i className="material-symbols-outlined !text-[20px]">
                    person_add
                  </i>
                  {t.common.register}
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
