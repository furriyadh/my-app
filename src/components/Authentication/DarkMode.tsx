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
      <button
        type="button"
        className="light-dark-toggle leading-none inline-block transition-all text-[#fe7a36] absolute top-[20px] md:top-[25px] ltr:right-[20px] rtl:left-[20px] ltr:md:right-[25px] rtl:md:left-[25px]"
        onClick={handleToggle}
      >
        <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
          light_mode
        </i>
      </button>
    </>
  );
};

export default DarkMode;
