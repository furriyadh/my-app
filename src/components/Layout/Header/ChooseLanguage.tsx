"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

type Language = {
  name: string;
  code: string;
  flag: string;
  isRTL: boolean;
};

const languages: Language[] = [
  { name: "English", code: "en", flag: "/images/flags/usa.svg", isRTL: false },
  { name: "العربية", code: "ar", flag: "/images/flags/saudi-arabia.svg", isRTL: true },
  { name: "French", code: "fr", flag: "/images/flags/france.svg", isRTL: false },
  { name: "German", code: "de", flag: "/images/flags/germany.svg", isRTL: false },
  { name: "Portuguese", code: "pt", flag: "/images/flags/portugal.svg", isRTL: false },
  { name: "Spanish", code: "es", flag: "/images/flags/spain.svg", isRTL: false },
];

const ChooseLanguage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // تحميل اللغة المحفوظة عند بدء التطبيق
  useEffect(() => {
    const savedLanguageCode = localStorage.getItem("selectedLanguage");
    if (savedLanguageCode) {
      const savedLanguage = languages.find(lang => lang.code === savedLanguageCode);
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        applyLanguageSettings(savedLanguage);
      }
    } else {
      // تطبيق الإعدادات الافتراضية
      applyLanguageSettings(languages[0]);
    }
  }, []);

  const applyLanguageSettings = (language: Language) => {
    // تطبيق اتجاه النص حسب اللغة
    const direction = language.isRTL ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", direction);
    
    // حفظ الإعدادات في localStorage
    localStorage.setItem("selectedLanguage", language.code);
    localStorage.setItem("dirAttribute", direction);
    
    console.log(`Applied language: ${language.name} (${language.code}) - Direction: ${direction}`);
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    applyLanguageSettings(language);
    setActive(false); // إغلاق القائمة المنسدلة
  };

  const handleDropdownToggle = () => {
    setActive((prevState) => !prevState);
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative language-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={`leading-none pr-[12px] inline-block transition-all relative top-[2px] hover:text-primary-500 ${
          active ? "active" : ""
        }`}
      >
        <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
          translate
        </i>
        <i className="ri-arrow-down-s-line text-[15px] absolute -right-[3px] top-1/2 -translate-y-1/2 -mt-[2px]"></i>
      </button>

      {active && (
        <div className="language-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-3xl dark:shadow-none pt-[13px] md:pt-[14px] absolute mt-[18px] md:mt-[21px] w-[200px] md:w-[240px] z-[1] top-full ltr:left-0 ltr:md:left-auto ltr:lg:right-0 rtl:right-0 rtl:md:right-auto rtl:lg:left-0 rounded-md">
          <span className="block text-black dark:text-white font-semibold px-[20px] pb-[14px] text-sm md:text-[15px]">
            {selectedLanguage.code === "ar" ? "اختر اللغة" : "Choose Language"}
          </span>

          <ul>
            {languages.map((language) => (
              <li
                key={language.code}
                className="border-t border-dashed border-gray-100 dark:border-[#172036]"
              >
                <button
                  type="button"
                  className={`text-black dark:text-white px-[20px] py-[12px] d-block w-full font-medium hover:bg-gray-50 dark:hover:bg-[#172036] transition-colors ${
                    selectedLanguage.code === language.code ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                  onClick={() => handleLanguageChange(language)}
                >
                  <div className="flex items-center">
                    <Image
                      src={language.flag}
                      className="ltr:mr-[10px] rtl:ml-[10px]"
                      alt={language.name}
                      width={30}
                      height={30}
                    />
                    <span className={selectedLanguage.code === language.code ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}>
                      {language.name}
                    </span>
                    {selectedLanguage.code === language.code && (
                      <i className="material-symbols-outlined !text-[16px] text-primary-600 dark:text-primary-400 ltr:ml-auto rtl:mr-auto">
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
  );
};

export default ChooseLanguage;

