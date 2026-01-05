"use client";

import React, { useState, useEffect } from "react";

const LightDarkModeButton: React.FC = () => {
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
        className="light-dark-toggle leading-none inline-block transition-all text-[#fe7a36] fixed top-1/2 -translate-y-1/2 ltr:left-[20px] rtl:right-[20px] ltr:md:left-[25px] rtl:md:right-[25px] z-[9999]"
        onClick={handleToggle}
      >
        <i className="material-symbols-outlined !text-[20px] md:!text-[22px]">
          light_mode
        </i>
      </button>
    </>
  );
};

export default LightDarkModeButton;
