"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LogoutContent: React.FC = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    // تنفيذ عملية logout تلقائياً عند تحميل الصفحة
    handleLogout();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutMessage("جاري تسجيل الخروج...");
    
    try {
      const response = await fetch('/api/oauth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setLogoutMessage("تم تسجيل الخروج بنجاح!");
        // إعادة توجيه إلى صفحة تسجيل الدخول بعد ثانيتين
        setTimeout(() => {
          router.push('/authentication/sign-in');
        }, 2000);
      } else {
        setLogoutMessage("فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      setLogoutMessage("حدث خطأ أثناء تسجيل الخروج.");
    } finally {
      setIsLoggingOut(false);
    }
  };

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
                  تسجيل الخروج من Furriyadh
                </h1>
                <p className="font-medium leading-[1.5] lg:text-md text-[#445164] dark:text-gray-400">
                  {logoutMessage || "جاري تسجيل الخروج..."}
                </p>
              </div>

              {isLoggingOut && (
                <div className="flex items-center justify-center mb-[20px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">جاري تسجيل الخروج...</span>
                </div>
              )}

              {!isLoggingOut && logoutMessage.includes("نجح") && (
                <div className="mb-[20px] p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p className="text-green-700 dark:text-green-300 text-center">
                    ✅ تم تسجيل الخروج بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول...
                  </p>
                </div>
              )}

              {!isLoggingOut && logoutMessage.includes("فشل") && (
                <div className="mb-[20px]">
                  <Link
                    href="/authentication/sign-in"
                    className="md:text-md block w-full text-center transition-all rounded-md font-medium py-[12px] px-[25px] text-white bg-primary-500 hover:bg-primary-400"
                  >
                    <span className="flex items-center justify-center gap-[5px]">
                      <i className="material-symbols-outlined">autorenew</i>
                      تسجيل الدخول
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutContent;
