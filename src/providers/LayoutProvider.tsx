"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu";
import Header from "@/components/Layout/Header/index";
import Footer from "@/components/Layout/Footer";
import { createClient } from "@/utils/supabase/client";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [active, setActive] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const toggleActive = () => {
    setActive(!active);
  };

  const isAuthPage = [
    "/authentication/sign-in/",
    "/authentication/sign-up/",
    "/authentication/forgot-password/",
    "/authentication/reset-password/",
    "/authentication/confirm-email/",
    "/authentication/lock-screen/",
    "/authentication/logout/",
    "/coming-soon/",
    "/",
    "/front-pages/features/",
    "/front-pages/team/",
    "/front-pages/faq/",
    "/front-pages/contact/",
  ].includes(pathname);

  useEffect(() => {
    // إنشاء Supabase client مرة واحدة في بداية useEffect
    const supabase = createClient();

    // التحقق من حالة المصادقة عند تحميل المكون
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("خطأ في جلب الجلسة:", error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session);
        }
      } catch (error) {
        console.error("خطأ غير متوقع في التحقق من المصادقة:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("تغيير حالة المصادقة:", event, session);
        
        if (event === "SIGNED_IN" && session) {
          setIsAuthenticated(true);
        } else if (event === "SIGNED_OUT" || !session) {
          setIsAuthenticated(false);
          // إعادة توجيه إلى صفحة تسجيل الدخول إذا كان المستخدم في صفحة محمية
          if (!isAuthPage) {
            router.push("/authentication/sign-in");
          }
        } else if (event === "TOKEN_REFRESHED" && session) {
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [pathname, router, isAuthPage]);

  // إعادة توجيه المستخدمين غير المصادق عليهم إلى صفحة تسجيل الدخول
  useEffect(() => {
    if (isAuthenticated === false && !isAuthPage) {
      router.push("/authentication/sign-in");
    }
  }, [isAuthenticated, isAuthPage, router]);

  // عرض شاشة تحميل أثناء التحقق من المصادقة
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحقق من حالة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`main-content-wrap transition-all ${active ? "active" : ""}`}
      >
        {!isAuthPage && (
          <>
            <SidebarMenu toggleActive={toggleActive} />

            <Header toggleActive={toggleActive} />
          </>
        )}

        <div className="main-content transition-all flex flex-col overflow-hidden min-h-screen">
          {children}

          {!isAuthPage && <Footer />}
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;
