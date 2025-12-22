"use client";

import React, { useState, useEffect, useRef } from "react";
// تم إزالة RTLMode لأن RTL أصبح مرتبط باللغة تلقائياً
// import RTLMode from "./RTLMode";

export default function Settings() {
  const [active, setActive] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <>
      <div
        className="relative settings-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
        ref={dropdownRef}
      >
        <button
          type="button"
          onClick={handleDropdownToggle}
          className={`leading-none inline-block transition-all relative top-[2px] hover:text-primary-500 ${
            active ? "active" : ""
          }`}
        >
          <i className="material-symbols-outlined !text-[22px] md:!text-[24px]">
            settings
          </i>
        </button>

        {active && (
          <div className="settings-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-3xl dark:shadow-none p-[20px] absolute mt-[17px] md:mt-[20px] w-[195px] z-[1] top-full ltr:right-0 rtl:left-0 rounded-md">
            {/* تم إزالة RTLMode - الآن RTL يتم تطبيقه تلقائياً حسب اللغة المختارة */}
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              <i className="material-symbols-outlined !text-[32px] mb-2 block">
                language
              </i>
              <p>استخدم قائمة اللغات لتغيير الاتجاه</p>
              <p className="text-xs mt-1">Use language menu to change direction</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

