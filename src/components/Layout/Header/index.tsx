"use client";

import React, { useEffect } from "react";
import Settings from "./Settings";
import DarkMode from "./DarkMode";
import SearchForm from "./SearchForm";
import AppsMenu from "./AppsMenu";
import ChooseLanguage from "./ChooseLanguage";
import Fullscreen from "./Fullscreen";
import Notifications from "./Notifications";
import ProfileMenu from "./ProfileMenu";

const Header: React.FC = () => {
  useEffect(() => {
    const elementId = document.getElementById("header");
    const handleScroll = () => {
      if (window.scrollY > 100) {
        elementId?.classList.add("shadow-sm");
      } else {
        elementId?.classList.remove("shadow-sm");
      }
    };

    document.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, []); // Added empty dependency array to avoid repeated effect calls

  return (
    <>
      <div
        id="header"
        className="header-area py-[13px] px-[20px] md:px-[25px] fixed top-0 z-[90] rounded-b-md transition-all bg-white dark:bg-gray-800 shadow-sm"
      >
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center justify-center md:justify-normal">
            <SearchForm />

            <AppsMenu />
          </div>

          <div className="flex items-center justify-center md:justify-normal mt-[13px] md:mt-0">
            <DarkMode />

            <ChooseLanguage />

            <Fullscreen />

            <Notifications />

            <ProfileMenu />

            <Settings />
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
