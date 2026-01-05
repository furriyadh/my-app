"use client";

import React, { useState, useEffect } from "react";

const DarkMode: React.FC = () => {
  // Light/Dark Mode - Initialize to null, read from DOM
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);

  // Read theme from DOM on mount (the layout script already set it)
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    // Update localStorage and DOM only on toggle
    localStorage.setItem("theme", newMode ? "dark" : "light");
    const htmlElement = document.documentElement;
    if (newMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
  };

  return (
    <>
      <div className="relative mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
        <button
          type="button"
          className="light-dark-toggle leading-none inline-block transition-all relative top-[2px] text-[#fe7a36]"
          onClick={handleToggle}
        >
          <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
            light_mode
          </i>
        </button>
      </div>
    </>
  );
};

export default DarkMode;
