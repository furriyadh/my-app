// المسار: src/providers/LayoutProvider.tsx

'use client';

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarMenu from "../components/Layout/SidebarMenu";
import Header from "../components/Layout/Header/index";
import Footer from "../components/Layout/Footer";
import { supabase } from "@/utils/supabase/client";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [active, setActive] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // إنشاء دالة toggleActive
  const toggleActive = () => {
    setActive(!active);
  };

  // تحديد الصفحات التي لا تحتاج إلى dashboard layout
  const isAuthPage = pathname?.startsWith('/authentication') || 
                     pathname === '/login' || 
                     pathname === '/register' || 
                     pathname === '/forgot-password';
  
  // تحديد صفحة الـ home page (الصفحة الرئيسية للزوار)
  const isHomePage = pathname === '/';
  
  // تحديد صفحات الـ dashboard
  const isDashboardPage = pathname?.startsWith('/dashboard');

  useEffect(() => {
    // التحقق من حالة المصادقة فقط للصفحات المحمية (dashboard)
    if (isDashboardPage) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/authentication/sign-in');
        }
      };

      checkAuth();

      // الاستماع لتغييرات المصادقة
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/authentication/sign-in');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isDashboardPage, router]);

  // إذا كانت صفحة مصادقة أو home page، عرض المحتوى بدون dashboard layout
  if (isAuthPage || isHomePage) {
    return <>{children}</>;
  }

  // التخطيط الكامل للصفحات المحمية (dashboard فقط)
  return (
    <>
      <div className={`main-wrapper-content ${active ? "active" : ""}`}>
        {/* Sidebar */}
        <SidebarMenu toggleActive={toggleActive} />

        <div className="main-content">
          {/* Header */}
          <Header toggleActive={toggleActive} />

          {/* Main Content */}
          <div className="main-content-container">
            {children}
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;

