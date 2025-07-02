"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu";
import Header from "@/components/Layout/Header/index";
import Footer from "@/components/Layout/Footer";
import { supabase } from "@/utils/supabase/client";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // حالات المكون
  const [active, setActive] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // دالة تبديل حالة القائمة الجانبية
  const toggleActive = () => {
    setActive(!active);
  };

  // صفحات المصادقة التي لا تحتاج للتخطيط الكامل
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

  // التحقق من حالة المصادقة
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // جلب الجلسة الحالية
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("خطأ في جلب الجلسة:", error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session);
          
          if (session) {
            console.log("المستخدم مسجل الدخول:", session.user.email);
          }
        }
      } catch (error) {
        console.error("خطأ غير متوقع في التحقق من المصادقة:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("تغيير حالة المصادقة:", event, session);
        
        setIsAuthenticated(!!session);
        
        if (event === "SIGNED_IN" && session) {
          console.log("تم تسجيل الدخول بنجاح");
          setIsAuthenticated(true);
        } else if (event === "SIGNED_OUT" || !session) {
          console.log("تم تسجيل الخروج");
          setIsAuthenticated(false);
          
          // إعادة توجيه إلى صفحة تسجيل الدخول إذا لم تكن في صفحة مصادقة
          if (!isAuthPage) {
            router.push("/authentication/sign-in/");
          }
        } else if (event === "TOKEN_REFRESHED" && session) {
          console.log("تم تحديث الرمز المميز");
          setIsAuthenticated(true);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [pathname, router, isAuthPage]);

  // إذا كانت الصفحة صفحة مصادقة، عرض المحتوى مباشرة
  if (isAuthPage) {
    return <>{children}</>;
  }

  // عرض شاشة تحميل أثناء التحقق من المصادقة
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مصادق عليه، توجيهه لصفحة تسجيل الدخول
  if (!isAuthenticated) {
    router.push("/authentication/sign-in/");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري إعادة التوجيه...</p>
        </div>
      </div>
    );
  }

  // عرض التخطيط الكامل للمستخدمين المصادق عليهم
  return (
    <>
      <div 
        className={`main-wrapper-content transition-all ${active ? "active" : ""}`}
      >
        {/* Sidebar */}
        <SidebarMenu toggleActive={toggleActive} />

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <Header toggleActive={toggleActive} />

          {/* Page Content */}
          <div className="main-content-container transition-all flex flex-col overflow-hidden min-h-screen">
            {children}
          </div>

          {/* Footer */}
          {!isAuthPage && <Footer />}
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;

