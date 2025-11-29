"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Dynamic import للـ supabase client لتجنب مشاكل prerendering
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("@/utils/supabase/client").then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);

  return supabase;
};

const ProfileMenu: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [active, setActive] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container

  const handleDropdownToggle = () => {
    setActive((prevState) => !prevState);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      if (supabase) {
        // إنهاء جلسة Supabase (حماية الداشبورد)
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("خطأ في تسجيل الخروج من Supabase:", error);
        }
      }

      // محاولة تنظيف جلسة Google Ads والكوكيز عبر الـ API (اختياري)
      try {
        await fetch("/api/oauth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.warn("⚠️ تعذر إنهاء جلسة Google Ads بالكامل:", err);
      }

      // مسح localStorage بالكامل لضمان عدم ظهور بيانات المستخدم السابق
      if (typeof window !== "undefined") {
        localStorage.removeItem("cached_google_ads_accounts");
        localStorage.removeItem("oauth_user_info");
        localStorage.removeItem("userEmail");
        // مسح إحصائيات الحسابات
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("account_stats_")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        console.log("✅ تم مسح localStorage بالكامل");
      }
    } catch (err) {
      console.error("خطأ غير متوقع أثناء تسجيل الخروج:", err);
    } finally {
      setActive(false);
      setIsLoggingOut(false);
    }
    
    // نقل المستخدم مباشرة إلى صفحة تسجيل الدخول بدون إظهار صفحة وسيطة
    // استخدام window.location للتأكد من إعادة تحميل الصفحة بالكامل
    if (typeof window !== "undefined") {
      window.location.href = "/authentication/sign-in";
    }
  };

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false); // Close the dropdown if clicked outside
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className="relative profile-menu mx-[8px] md:mx-[10px] lg:mx-[12px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={handleDropdownToggle}
        className={`flex items-center -mx-[5px] relative ltr:pr-[14px] rtl:pl-[14px] text-black dark:text-white ${
          active ? "active" : ""
        }`}
      >
        <Image
          src="/images/admin.png"
          className="w-[35px] h-[35px] md:w-[42px] md:h-[42px] rounded-full ltr:md:mr-[2px] ltr:lg:mr-[8px] rtl:md:ml-[2px] rtl:lg:ml-[8px] border-[2px] border-primary-200 inline-block"
          alt="admin-image"
          width={35}
          height={35}
        />
        <span className="block font-semibold text-[0px] lg:text-base">
          Olivia
        </span>
        <i className="ri-arrow-down-s-line text-[15px] absolute ltr:-right-[3px] rtl:-left-[3px] top-1/2 -translate-y-1/2 mt-px"></i>
      </button>

      {active && (
        <div className="profile-menu-dropdown bg-white dark:bg-[#0c1427] transition-all shadow-3xl dark:shadow-none py-[22px] absolute mt-[13px] md:mt-[14px] w-[195px] z-[1] top-full ltr:right-0 rtl:left-0 rounded-md">
          <div className="flex items-center border-b border-gray-100 dark:border-[#172036] pb-[12px] mx-[20px] mb-[10px]">
            <Image
              src="/images/admin.png"
              className="rounded-full w-[31px] h-[31px] ltr:mr-[9px] rtl:ml-[9px] border-2 border-primary-200 inline-block"
              alt="admin-image"
              width={31}
              height={31}
            />
            <div>
              <span className="block text-black dark:text-white font-medium">
                Olivia John
              </span>
              <span className="block text-xs">Marketing Manager</span>
            </div>
          </div>

          <ul>
            <li>
              <Link
                href="/my-profile/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/my-profile/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  account_circle
                </i>
                My Profile
              </Link>
            </li>
            <li>
              <Link
                href="/apps/chat/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/apps/chat/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  chat
                </i>
                Messages
              </Link>
            </li>
            <li>
              <Link
                href="/apps/to-do-list/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/apps/to-do-list/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  format_list_bulleted
                </i>
                My Task
              </Link>
            </li>
            <li>
              <Link
                href="/ecommerce/checkout/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/ecommerce/checkout/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  credit_card
                </i>
                Billing
              </Link>
            </li>
          </ul>

          <div className="border-t border-gray-100 dark:border-[#172036] mx-[20px] my-[9px]"></div>

          <ul>
            <li>
              <Link
                href="/settings/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/settings/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  settings
                </i>
                Settings
              </Link>
            </li>
            <li>
              <Link
                href="/faq/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/faq/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  support
                </i>
                Support
              </Link>
            </li>
            <li>
              <Link
                href="/authentication/lock-screen/"
                className={`block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 ${
                  pathname === "/authentication/lock-screen/" ? "text-primary-500" : ""
                }`}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  lock
                </i>
                Lock Screen
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left block relative py-[7px] ltr:pl-[50px] ltr:pr-[20px] rtl:pr-[50px] rtl:pl-[20px] text-black dark:text-white transition-all hover:text-primary-500 disabled:opacity-60"
                disabled={isLoggingOut}
              >
                <i className="material-symbols-outlined top-1/2 -translate-y-1/2 !text-[22px] absolute ltr:left-[20px] rtl:right-[20px]">
                  logout
                </i>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
