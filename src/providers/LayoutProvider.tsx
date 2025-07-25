// المسار: src/providers/LayoutProvider.tsx

'use client';

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import SidebarMenu from "../components/Layout/SidebarMenu";
import Header from "../components/Layout/Header/index";
import Footer from "../components/Layout/Footer";

// Dynamic import للـ supabase client لتجنب مشاكل prerendering
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);
  
  useEffect(() => {
    // تحميل supabase client فقط في المتصفح
    if (typeof window !== 'undefined') {
      import('@/utils/supabase/client').then((module) => {
        setSupabase(module.supabase);
      });
    }
  }, []);
  
  return supabase;
};

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const supabase = useSupabaseClient(); // استخدام hook للـ dynamic import
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
    // التحقق من حالة المصادقة فقط للصفحات المحمية (dashboard) وبعد تحميل supabase
    if (isDashboardPage && supabase) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/authentication/sign-in');
        }
      };

      checkAuth();

      // الاستماع لتغييرات المصادقة مع تحديد أنواع البيانات
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          router.push('/authentication/sign-in');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isDashboardPage, router, supabase]);

  // إذا كانت صفحة مصادقة أو home page، عرض المحتوى بدون dashboard layout
  if (isAuthPage || isHomePage) {
    return <>{children}</>;
  }

  // عرض حالة التحميل للصفحات المحمية إذا لم يتم تحميل supabase بعد
  if (isDashboardPage && !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل النظام...</p>
        </div>
      </div>
    );
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

