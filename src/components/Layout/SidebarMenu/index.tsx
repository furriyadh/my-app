"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarMenuProps {
  toggleActive: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ toggleActive }) => {
  const pathname = usePathname();
  const [supabase, setSupabase] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/client').then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("cached_google_ads_accounts");
      localStorage.removeItem("oauth_user_info");
      localStorage.removeItem("userEmail");
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("account_stats_")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    try {
      await fetch("/api/oauth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) { }

    window.location.href = "/";
  };

  // Initialize openIndex to 0 to open the first item by default
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <>
      <div className="sidebar-area bg-white dark:bg-[#0c1427] fixed z-[7] top-0 h-screen transition-all rounded-r-md">
        <div className="logo bg-white dark:bg-[#0c1427] border-b border-gray-100 dark:border-[#172036] px-[25px] pt-[19px] pb-[15px] absolute z-[2] right-0 top-0 left-0">
          <Link
            href="/dashboard/google-ads/"
            className="transition-none relative flex items-center outline-none"
          >
            <Image
              src="/images/logo-icon.svg"
              alt="Furriyadh"
              width={26}
              height={26}
            />
            <span className="font-bold text-black dark:text-white relative ltr:ml-[8px] rtl:mr-[8px] top-px text-xl">
              Furriyadh
            </span>
          </Link>

          <button
            type="button"
            className="burger-menu inline-block absolute z-[3] top-[24px] ltr:right-[25px] rtl:left-[25px] transition-all hover:text-primary-500"
            onClick={toggleActive}
          >
            <i className="material-symbols-outlined">close</i>
          </button>
        </div>

        <div className="pt-[89px] px-[22px] pb-[20px] h-screen overflow-y-scroll sidebar-custom-scrollbar">
          <div className="accordion">

            {/* AI Assistant Section - Premium Design */}
            <div className="mb-6">
              <Link
                href="/dashboard/"
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02] ${pathname === "/dashboard/" ? "ring-2 ring-white/30" : ""}`}
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />

                {/* Icon with sparkle animation */}
                <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm">
                  <i className="material-symbols-outlined !text-[22px] text-white">auto_awesome</i>
                </div>

                {/* Text content */}
                <div className="relative flex-1">
                  <span className="block font-semibold text-sm">AI Assistant</span>
                  <span className="block text-[10px] text-white/70">Create campaigns with AI</span>
                </div>

                {/* Arrow icon */}
                <i className="material-symbols-outlined relative !text-[18px] text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all">arrow_forward</i>
              </Link>
            </div>

            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs">
              Main
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 0 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(0)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  dashboard
                </i>
                <span className="title leading-none">Dashboard</span>
                <span className="rounded-full font-medium inline-block text-center w-[20px] h-[20px] text-[11px] leading-[20px] text-orange-500 bg-orange-50 dark:bg-[#ffffff14] ltr:ml-auto rtl:mr-auto">
                  31
                </span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 0 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/google-ads/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/dashboard/google-ads/" ? "active" : ""
                          }`}
                      >
                        Google Ads
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-[8px] rtl:mr-[8px] text-white bg-blue-500 inline-block rounded-sm">
                          New
                        </span>
                      </Link>
                    </li>
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        eCommerce
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        CRM
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Project Management
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        LMS
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        HelpDesk
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Analytics
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Crypto
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Sales
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Hospital
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        HRM
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        School
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Call Center
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Marketing
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        NFT
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        SaaS
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Real Estate
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Shipment
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Finance
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        POS System
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Podcast
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Social Media
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Doctor
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Beauty Salon
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Store Analysis
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Restaurant
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Hotel
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Real Estate Agent
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Credit Card
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Crypto Trader
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <div className="sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] w-full text-left cursor-not-allowed opacity-60">
                        Crypto Perf.
                        <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                          Soon
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>



            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs [&:not(:first-child)]:mt-[22px]">
              PAGES
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 25 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(25)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  campaign
                </i>
                <span className="title leading-none">Google Ads</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 25 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/google-ads/campaigns/website-url/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname?.includes("/dashboard/google-ads/campaigns/") ? "active" : ""
                          }`}
                      >
                        Create Campaign
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/google-ads/integrations/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/dashboard/google-ads/integrations/" ? "active" : ""
                          }`}
                      >
                        Integrations
                      </Link>
                    </li>



                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/google-ads/assets/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/dashboard/google-ads/assets/" ? "active" : ""
                          }`}
                      >
                        Assets
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/dashboard/google-ads/billing/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/dashboard/google-ads/billing/" ? "active" : ""
                          }`}
                      >
                        Billing
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  shopping_cart
                </i>
                <span className="title leading-none">eCommerce</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 4 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/products-grid/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/products-grid/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Products Grid
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/products-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/products-list/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Products List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/product-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/product-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Product Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/create-product/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/create-product/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Create Product
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/edit-product/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/edit-product/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Edit Product
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/cart/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/cart/" ? "active" : ""
                          }`}
                      >
                        Cart
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/checkout/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/checkout/" ? "active" : ""
                          }`}
                      >
                        Checkout
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/orders/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/orders/" ? "active" : ""
                          }`}
                      >
                        Orders
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/order-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/order-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Order Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/create-order/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/create-order/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Create Order
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/order-tracking/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/order-tracking/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Order Tracking
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/customers/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/customers/" ? "active" : ""
                          }`}
                      >
                        Customers
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/customer-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/customer-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Customer Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/categories/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/categories/" ? "active" : ""
                          }`}
                      >
                        Categories
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/sellers/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/sellers/" ? "active" : ""
                          }`}
                      >
                        Sellers
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/seller-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/seller-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Seller Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/create-seller/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/create-seller/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Create Seller
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/reviews/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/reviews/" ? "active" : ""
                          }`}
                      >
                        Reviews
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/ecommerce/refunds/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/ecommerce/refunds/" ? "active" : ""
                          }`}
                      >
                        Refunds
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  handshake
                </i>
                <span className="title leading-none">CRM</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 5 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crm/contacts/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crm/contacts/" ? "active" : ""
                          }`}
                      >
                        Contacts
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crm/customers/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crm/customers/" ? "active" : ""
                          }`}
                      >
                        Customers
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crm/leads/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crm/leads/" ? "active" : ""
                          }`}
                      >
                        Leads
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crm/deals/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crm/deals/" ? "active" : ""
                          }`}
                      >
                        Deals
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  description
                </i>
                <span className="title leading-none">Project Management</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 6 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/project-overview/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/project-overview/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Project Overview
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/projects-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/projects-list/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Projects List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/create-project/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/create-project/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Create Project
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/clients/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/clients/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Clients
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/teams/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/teams/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Teams
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/kanban-board/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/kanban-board/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Kanban Board
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/project-management/users/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/project-management/users/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Users
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  auto_stories
                </i>
                <span className="title leading-none">LMS</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 7 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/lms/courses-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/lms/courses-list/" ? "active" : ""
                          }`}
                      >
                        Courses List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/lms/course-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/lms/course-details/" ? "active" : ""
                          }`}
                      >
                        Course Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/lms/lesson-preview/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/lms/lesson-preview/" ? "active" : ""
                          }`}
                      >
                        Lesson Preview
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/lms/create-course/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/lms/create-course/" ? "active" : ""
                          }`}
                      >
                        Create Course
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/lms/edit-course/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/lms/edit-course/" ? "active" : ""
                          }`}
                      >
                        Edit Course
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/lms/instructors/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/lms/instructors/" ? "active" : ""
                          }`}
                      >
                        Instructors
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  support
                </i>
                <span className="title leading-none">HelpDesk</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 8 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/helpdesk/tickets/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/helpdesk/tickets/" ? "active" : ""
                          }`}
                      >
                        Tickets
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/helpdesk/ticket-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/helpdesk/ticket-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Ticket Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/helpdesk/agents/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/helpdesk/agents/" ? "active" : ""
                          }`}
                      >
                        Agents
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/helpdesk/reports/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/helpdesk/reports/" ? "active" : ""
                          }`}
                      >
                        Reports
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  store
                </i>
                <span className="title leading-none">NFT Marketplace</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 9 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/marketplace/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/marketplace/" ? "active" : ""
                          }`}
                      >
                        Marketplace
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/explore-all/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/explore-all/" ? "active" : ""
                          }`}
                      >
                        Explore All
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/live-auction/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/live-auction/" ? "active" : ""
                          }`}
                      >
                        Live Auction
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/nft-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/nft-details/" ? "active" : ""
                          }`}
                      >
                        NFT Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/creators/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/creators/" ? "active" : ""
                          }`}
                      >
                        Creators
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/creator-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/creator-details/" ? "active" : ""
                          }`}
                      >
                        Creator Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/wallet-connect/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/wallet-connect/" ? "active" : ""
                          }`}
                      >
                        Wallet Connect
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/nft/create-nft/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/nft/create-nft/" ? "active" : ""
                          }`}
                      >
                        Create NFT
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  real_estate_agent
                </i>
                <span className="title leading-none">Real Estate</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 10 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/property-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/property-list/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Property List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/property-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/property-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Property Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/add-property/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/add-property/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Add Property
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/agents/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/agents/" ? "active" : ""
                          }`}
                      >
                        Agents
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/agent-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/agent-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Agent Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/add-agent/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/add-agent/" ? "active" : ""
                          }`}
                      >
                        Add Agent
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate/customers/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate/customers/" ? "active" : ""
                          }`}
                      >
                        Customers
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  calculate
                </i>
                <span className="title leading-none">Finance</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 11 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/finance/wallet/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/finance/wallet/" ? "active" : ""
                          }`}
                      >
                        Wallet
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/finance/transactions/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/finance/transactions/" ? "active" : ""
                          }`}
                      >
                        Transactions
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  badge
                </i>
                <span className="title leading-none">Doctor</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 12 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/doctor/patients-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/doctor/patients-list/" ? "active" : ""
                          }`}
                      >
                        Patients List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/doctor/add-patient/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/doctor/add-patient/" ? "active" : ""
                          }`}
                      >
                        Add Patient
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/doctor/patient-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/doctor/patient-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Patient Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/doctor/appointments/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/doctor/appointments/" ? "active" : ""
                          }`}
                      >
                        Appointments
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/doctor/prescriptions/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/doctor/prescriptions/" ? "active" : ""
                          }`}
                      >
                        Prescriptions
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/doctor/write-prescription/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/doctor/write-prescription/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Write a Prescription
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  lunch_dining
                </i>
                <span className="title leading-none">Restaurant</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 13 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/restaurant/menus/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/restaurant/menus/" ? "active" : ""
                          }`}
                      >
                        Menus
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/restaurant/dish-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/restaurant/dish-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Dish Details
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  hotel
                </i>
                <span className="title leading-none">Hotel</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 14 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/hotel/rooms-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/hotel/rooms-list/" ? "active" : ""
                          }`}
                      >
                        Rooms List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/hotel/room-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/hotel/room-details/" ? "active" : ""
                          }`}
                      >
                        Room Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/hotel/guests-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/hotel/guests-list/" ? "active" : ""
                          }`}
                      >
                        Guests List
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  location_away
                </i>
                <span className="title leading-none">Real Estate Agent</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 15 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate-agent/properties/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate-agent/properties/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Properties
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/real-estate-agent/property-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/real-estate-agent/property-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Property Details
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <div
                className="accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative text-left cursor-not-allowed opacity-60"
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  paid
                </i>
                <span className="title leading-none">Crypto Trader</span>
                <span className="text-[10px] font-medium py-[1px] px-[8px] ltr:ml-auto rtl:mr-auto text-white bg-gray-400 inline-block rounded-sm">
                  Soon
                </span>
              </div>

              <div
                className={`accordion-collapse ${openIndex === 16 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crypto-trader/transactions/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crypto-trader/transactions/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Transactions
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crypto-trader/gainers-losers/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crypto-trader/gainers-losers/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Gainers Losers
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/crypto-trader/wallet/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/crypto-trader/wallet/" ? "active" : ""
                          }`}
                      >
                        Wallet
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 17 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(17)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  local_activity
                </i>
                <span className="title leading-none">Events</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 17 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/events/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/events/" ? "active" : ""
                          }`}
                      >
                        Events Grid
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/events/events-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/events/events-list/" ? "active" : ""
                          }`}
                      >
                        Events List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/events/event-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/events/event-details/" ? "active" : ""
                          }`}
                      >
                        Event Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/events/create-an-event/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/events/create-an-event/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Create An Event
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/events/edit-an-event/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/events/edit-an-event/" ? "active" : ""
                          }`}
                      >
                        Edit An Event
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 18 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(18)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  share
                </i>
                <span className="title leading-none">Social</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 18 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/social/profile/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/social/profile/" ? "active" : ""
                          }`}
                      >
                        Profile
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/social/settings/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/social/settings/" ? "active" : ""
                          }`}
                      >
                        Settings
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 19 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(19)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  content_paste
                </i>
                <span className="title leading-none">Invoices</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 19 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/invoices/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/invoices/" ? "active" : ""
                          }`}
                      >
                        Invoices
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/invoices/invoice-details/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/invoices/invoice-details/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Invoice Details
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/invoices/create-invoice/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/invoices/create-invoice/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Create Invoice
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/invoices/edit-invoice/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/invoices/edit-invoice/" ? "active" : ""
                          }`}
                      >
                        Edit Invoice
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 20 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(20)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  person
                </i>
                <span className="title leading-none">Users</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 20 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/users/team-members/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/users/team-members/" ? "active" : ""
                          }`}
                      >
                        Team Members
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/users/users-list/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/users/users-list/" ? "active" : ""
                          }`}
                      >
                        Users List
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/users/add-user/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/users/add-user/" ? "active" : ""
                          }`}
                      >
                        Add User
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 21 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(21)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  account_box
                </i>
                <span className="title leading-none">Profile</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 21 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/profile/user-profile/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/profile/user-profile/" ? "active" : ""
                          }`}
                      >
                        User Profile
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/profile/teams/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/profile/teams/" ? "active" : ""
                          }`}
                      >
                        Teams
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/profile/projects/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/profile/projects/" ? "active" : ""
                          }`}
                      >
                        Projects
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/starter/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/starter/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  star_border
                </i>
                <span className="title leading-none">Starter</span>
              </Link>
            </div>

            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs [&:not(:first-child)]:mt-[22px]">
              Apps
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/apps/to-do-list/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/apps/to-do-list/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  format_list_bulleted
                </i>
                <span className="title leading-none">To Do List</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/apps/calendar/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/apps/calendar/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  date_range
                </i>
                <span className="title leading-none">Calendar</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/apps/contacts/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/apps/contacts/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  contact_page
                </i>
                <span className="title leading-none">Contacts</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/apps/chat/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/apps/chat/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  chat
                </i>
                <span className="title leading-none">Chat</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 2 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(2)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  mail
                </i>
                <span className="title leading-none">Email</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 2 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/email/inbox/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/email/inbox/" ? "active" : ""
                          }`}
                      >
                        Inbox
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/email/compose/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/email/compose/" ? "active" : ""
                          }`}
                      >
                        Compose
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/email/read/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/email/read/" ? "active" : ""
                          }`}
                      >
                        Read
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/apps/kanban-board/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/apps/kanban-board/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  team_dashboard
                </i>
                <span className="title leading-none">Kanban Board</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 3 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(3)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  folder_open
                </i>
                <span className="title leading-none">File Manager</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 3 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/my-drive/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/my-drive/"
                          ? "active"
                          : ""
                          }`}
                      >
                        My Drive
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/assets/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/assets/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Assets
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/projects/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/projects/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Projects
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/personal/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/personal/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Personal
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/applications/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/applications/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Applications
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/documents/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/documents/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Documents
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/apps/file-manager/media/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/apps/file-manager/media/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Media
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>



            <span className="block relative font-medium uppercase text-gray-400 mb-[8px] text-xs [&:not(:first-child)]:mt-[22px]">
              Others
            </span>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <Link
                href="/profile/user-profile/"
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${pathname === "/profile/user-profile/" ? "active" : ""
                  }`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  account_circle
                </i>
                <span className="title leading-none">My Profile</span>
              </Link>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                className={`accordion-button toggle flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c] ${openIndex === 29 ? "open" : ""
                  }`}
                type="button"
                onClick={() => toggleAccordion(29)}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  settings
                </i>
                <span className="title leading-none">Settings</span>
              </button>

              <div
                className={`accordion-collapse ${openIndex === 29 ? "open" : "hidden"
                  }`}
              >
                <div className="pt-[4px]">
                  <ul className="sidebar-sub-menu">
                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/settings/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/settings/" ? "active" : ""
                          }`}
                      >
                        Account Settings
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/settings/change-password/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/settings/change-password/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Change Password
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/settings/connections/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/settings/connections/" ? "active" : ""
                          }`}
                      >
                        Connections
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/settings/privacy-policy/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/settings/privacy-policy/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Privacy Policy
                      </Link>
                    </li>

                    <li className="sidemenu-item mb-[4px] last:mb-0">
                      <Link
                        href="/settings/terms-conditions/"
                        className={`sidemenu-link rounded-md flex items-center relative transition-all font-medium text-gray-500 dark:text-gray-400 py-[9px] ltr:pl-[38px] ltr:pr-[30px] rtl:pr-[38px] rtl:pl-[30px] hover:text-primary-500 hover:bg-primary-50 w-full text-left dark:hover:bg-[#15203c] ${pathname === "/settings/terms-conditions/"
                          ? "active"
                          : ""
                          }`}
                      >
                        Terms & Conditions
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="accordion-item rounded-md text-black dark:text-white mb-[5px] whitespace-nowrap">
              <button
                type="button"
                onClick={handleLogout}
                className={`accordion-button flex items-center transition-all py-[9px] ltr:pl-[14px] ltr:pr-[30px] rtl:pr-[14px] rtl:pl-[30px] rounded-md font-medium w-full relative hover:bg-gray-50 text-left dark:hover:bg-[#15203c]`}
              >
                <i className="material-symbols-outlined transition-all text-gray-500 dark:text-gray-400 ltr:mr-[7px] rtl:ml-[7px] !text-[22px] leading-none relative -top-px">
                  logout
                </i>
                <span className="title leading-none">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidebarMenu;