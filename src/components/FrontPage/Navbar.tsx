"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/hooks/useTranslation";
import {
  Navbar as AceternityNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";
import SparkleNavbar from "@/components/lightswind/sparkle-navbar";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [isMobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize theme state and scroll listener
  useEffect(() => {
    const htmlElement = document.documentElement;
    const isDark = htmlElement.classList.contains('dark');
    setIsDarkMode(isDark);
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    const htmlElement = document.querySelector("html");
    if (htmlElement) {
      if (newMode) htmlElement.classList.add("dark");
      else htmlElement.classList.remove("dark");
    }
  };

  const NAV_ITEMS = [
    { name: t.navbar.home, link: "/" },
    { name: t.navbar.features, link: "/features" },
    { name: language === 'ar' ? 'الأسعار' : 'Pricing', link: "/pricing" },
  ];

  // Language handlers
  const switchLanguage = (langCode: string) => {
    setLanguage(langCode as SupportedLanguage);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setLanguageDropdownOpen(false);
  };

  const handleLanguageMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setLanguageDropdownOpen(true);
    closeTimeoutRef.current = setTimeout(() => setLanguageDropdownOpen(false), 2000);
  };

  return (
    <div className="relative w-full z-[100]">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; }
        
        /* Force White Text in Dark Mode */
        html.dark .nav-item-link {
          color: #ffffff !important;
        }
      `}</style>


      {/* Fixed Theme Toggle (Top Left) */}
      <button
        type="button"
        onClick={handleThemeToggle}
        className="fixed top-1/2 -translate-y-1/2 left-6 z-[110] p-2 hover:scale-110 transition-all duration-300 text-[#fe7a36]"
        aria-label="Toggle theme"
      >
        <i className="material-symbols-outlined !text-[20px]">light_mode</i>
      </button>

      <AceternityNavbar className="fixed top-4 md:top-6">
        {/* Desktop Navigation */}
        <NavBody>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-4 rtl:ml-4 rtl:mr-0 z-20">
            <Image
              src="/images/logo-circle.svg"
              alt="Furriyadh Icon"
              width={34}
              height={36}
              priority
              className={cn("w-auto h-9", !isScrolled && "hidden")}
            />
            <Image
              src="/images/logo-icon.svg"
              alt="Furriyadh"
              width={110}
              height={32}
              priority
              className={cn("w-auto h-8", isScrolled && "hidden")}
            />
          </Link>

          {/* Centered Links - SparkleNavbar */}
          <SparkleNavbar items={NAV_ITEMS.map(item => item.name)} color="#605dff" />

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-4 z-20">


            {/* Language Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={handleLanguageMouseEnter}
              onMouseLeave={() => { }}
            >
              <button className="flex items-center gap-1 text-sm font-semibold text-black dark:text-white uppercase px-2 py-1">
                {language}
                <i className="ri-arrow-down-s-line"></i>
              </button>

              {/* Dropdown Menu */}
              {isLanguageDropdownOpen && (
                <div className="absolute top-full ltr:right-0 rtl:left-0 mt-2 w-[340px] bg-white/80 dark:bg-[#0c1427]/80 backdrop-blur-md rounded-xl shadow-2xl border border-gray-100 dark:border-[#172036] overflow-hidden">
                  <div className="grid grid-cols-2 gap-1 p-1.5">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`lang-dropdown-btn w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all ${language === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-200'}`}
                      >
                        <Image src={lang.flag} alt={lang.name} width={20} height={20} className="rounded-sm flex-shrink-0" />
                        <span className="text-sm font-medium text-start truncate">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {/* Auth Buttons - Consolidated */}
            <NavbarButton
              as={Link}
              href="/authentication/sign-in"
              variant="primary"
              className="hidden md:inline-flex bg-gradient-to-r from-purple-600 to-indigo-600 border-0 px-8 py-2.5 text-base"
            >
              {language === 'ar' ? 'دخول' : 'Login'}
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo-big.svg"
                alt="Furriyadh"
                width={100}
                height={30}
                className="w-auto h-7"
              />
            </Link>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {/* Mobile Links */}
            {NAV_ITEMS.map((item, idx) => (
              <Link
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full py-2 text-lg font-medium transition-colors ${pathname === item.link ? 'text-purple-600' : 'text-neutral-600 dark:text-neutral-300'}`}
              >
                {item.name}
              </Link>
            ))}

            <hr className="w-full border-gray-100 dark:border-white/10 my-2" />

            {/* Mobile Language & Theme */}
            <div className="flex w-full items-center justify-between py-2">
              <button onClick={handleThemeToggle} className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                <i className="material-symbols-outlined">light_mode</i>
                <span className="text-sm">Theme</span>
              </button>

              <button
                onClick={() => setMobileLanguageOpen(!isMobileLanguageOpen)}
                className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 uppercase font-bold"
              >
                <i className="material-symbols-outlined">language</i>
                {language}
              </button>
            </div>

            {/* Mobile Language List */}
            {isMobileLanguageOpen && (
              <div className="grid grid-cols-2 gap-2 w-full mb-4 bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { switchLanguage(lang.code); setMobileLanguageOpen(false); }}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${language === lang.code ? 'bg-white dark:bg-black shadow-sm text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
                  >
                    <Image src={lang.flag} alt={lang.name} width={16} height={16} className="rounded-sm" />
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Auth Buttons */}
            <div className="flex w-full flex-col gap-3 mt-4">
              <NavbarButton
                as={Link}
                href="/authentication/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 border-0 justify-center"
              >
                {language === 'ar' ? 'دخول' : 'Login'}
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </AceternityNavbar>
    </div>
  );
};

export default Navbar;
