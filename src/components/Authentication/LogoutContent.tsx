"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const LogoutContent: React.FC = () => {
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState<string>("جاري تسجيل الخروج...");

  useEffect(() => {
    const performLogout = async () => {
      if (!supabase) return;

      try {
        setIsProcessing(true);

        // إلغاء جلسة Supabase (الحماية الأساسية للداشبورد)
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("خطأ في تسجيل الخروج من Supabase:", error);
          setMessage("حدث خطأ أثناء تسجيل الخروج من النظام.");
        } else {
          setMessage("تم تسجيل الخروج بنجاح.");
        }

        // محاولة تنظيف جلسة Google Ads والكوكيز عبر الـ API (اختياري لكن مفيد للأمان)
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
        setMessage("حدث خطأ غير متوقع أثناء تسجيل الخروج.");
      } finally {
        setIsProcessing(false);
        
        // التوجيه إلى صفحة تسجيل الدخول بعد 2 ثانية
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = "/authentication/sign-in";
          }
        }, 2000);
      }
    };

    performLogout();
  }, [supabase]);

  return (
    <>
      <div className="auth-main-content bg-white dark:bg-[#0a0e19] py-[60px] md:py-[80px] lg:py-[135px]">
        <div className="mx-auto px-[12.5px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1255px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[25px] items-center">
            <div className="xl:ltr:-mr-[25px] xl:rtl:-ml-[25px] 2xl:ltr:-mr-[45px] 2xl:rtl:-ml-[45px] rounded-[25px] order-2 lg:order-1">
              <Image
                src="/images/logout.jpg"
                alt="logout-image"
                className="rounded-[25px]"
                width={646}
                height={804}
              />
            </div>

            <div className="xl:ltr:pl-[90px] xl:rtl:pr-[90px] 2xl:ltr:pl-[120px] 2xl:rtl:pr-[120px] order-1 lg:order-2">
              <Image
                src="/images/logo-big.svg"
                alt="logo"
                className="inline-block dark:hidden"
                width={142}
                height={38}
              />
              <Image
                src="/images/white-logo-big.svg"
                alt="logo"
                className="hidden dark:inline-block"
                width={142}
                height={38}
              />

              <div className="my-[17px] md:my-[25px]">
                <h1 className="!font-semibold !text-[22px] md:!text-xl lg:!text-2xl !mb-[5px] md:!mb-[10px]">
                  تم تسجيل الخروج
                </h1>
                <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                  {message}
                </p>
              </div>

              <div className="flex items-center mb-[20px]">
                <Image
                  src="/images/admin.png"
                  alt="admin-image"
                  className="rounded-full w-[50px] border-[2px] ltr:mr-[13px] rtl:ml-[13px] border-primary-200"
                  width={50}
                  height={50}
                />
                <span className="font-semibold text-black dark:text-white block">
                  Furriyadh
                </span>
              </div>

              <Link
                href="/authentication/sign-in"
                className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400 disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-[5px]">
                  <i className="material-symbols-outlined">
                    {isProcessing ? "hourglass_empty" : "login"}
                  </i>
                  {isProcessing ? "جاري إنهاء الجلسة..." : "تسجيل الدخول مرة أخرى"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutContent;
