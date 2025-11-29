"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/hooks/useTranslation";

const ChooseLanguage: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as SupportedLanguage);
    
    // إلغاء المؤقت وإغلاق القائمة فوراً
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActive(false);
  };

  const handleDropdownToggle = () => {
    setActive((prevState) => !prevState);
  };

  const handleMouseEnter = () => {
    // إلغاء أي مؤقت سابق
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActive(true);
    
    // إغلاق تلقائي بعد 2 ثانية
    closeTimeoutRef.current = setTimeout(() => {
      setActive(false);
      closeTimeoutRef.current = null;
    }, 2000);
  };

  const handleMouseLeave = () => {
    // عند مغادرة المنطقة، إبقاء المؤقت يعمل
    // القائمة ستغلق بعد 2 ثانية من الدخول
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
        className="relative language-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
        ref={dropdownRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={handleDropdownToggle}
          className={`leading-none pr-[12px] inline-block transition-all relative top-[2px] hover:text-primary-500 font-semibold text-[15px] md:text-[16px] ${
            active ? "active" : ""
          }`}
        >
          <span className="uppercase">{language}</span>
          <i className="ri-arrow-down-s-line text-[15px] absolute -right-[3px] top-1/2 -translate-y-1/2 -mt-[2px]"></i>
        </button>

        {active && (
          <div className="language-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-3xl dark:shadow-none pt-[13px] md:pt-[14px] absolute mt-[18px] md:mt-[21px] w-[240px] md:w-[280px] z-[1] top-full ltr:left-0 ltr:md:left-auto ltr:lg:right-0 rtl:right-0 rtl:md:right-auto rtl:lg:left-0 rounded-lg">
            <span className="block text-black dark:text-white font-semibold px-[20px] pb-[14px] text-sm md:text-[15px]">
              {language === "ar" ? "اختر اللغة" : "Choose Language"}
            </span>

            <ul className="max-h-[500px] overflow-y-auto custom-scrollbar">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <li
                  key={lang.code}
                  className="border-t border-dashed border-gray-100 dark:border-[#172036]"
                >
                  <button
                    type="button"
                    className={`text-black dark:text-white px-[20px] py-[12px] d-block w-full font-medium hover:bg-gray-50 dark:hover:bg-[#172036] transition-colors ${
                      language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                    }`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={lang.flag}
                        alt={lang.name}
                        width={28}
                        height={28}
                        className="rounded-sm"
                      />
                      <span className={`flex-1 text-left ${language === lang.code ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}>
                        {lang.name}
                      </span>
                      {language === lang.code && (
                        <i className="material-symbols-outlined !text-[16px] text-primary-600 dark:text-primary-400">
                          check
                        </i>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default ChooseLanguage;
