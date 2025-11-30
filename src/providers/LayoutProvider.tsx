// المسار: src/providers/LayoutProvider.tsx

'use client';

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
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
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarActive, setSidebarActive] = useState(false);

  // تحديد الصفحات التي لا تحتاج إلى dashboard layout
  const isAuthPage = pathname?.startsWith('/authentication') || 
                     pathname === '/login' || 
                     pathname === '/register' || 
                     pathname === '/forgot-password';
  
  // تحديد صفحة الـ home page (الصفحة الرئيسية للزوار)
  const isHomePage = pathname === '/';
  
  // تحديد صفحات الـ dashboard
  const isDashboardPage = pathname?.startsWith('/dashboard');

  // Toggle sidebar function
  const toggleActive = () => {
    setSidebarActive(!sidebarActive);
  };

  // تطبيق الوضع الليلي بقوة على كل الموقع
  useEffect(() => {
    if (!isAuthPage) {
      // إضافة الوضع الليلي على كل صفحات الموقع (الداشبورد و Campaign و Home)
      console.log('✅ Forcing dark mode on entire site');
      document.documentElement.classList.add('dark');
      // منع أي محاولة لإزالة الوضع الليلي
      document.documentElement.style.colorScheme = 'dark';
    } else {
      // إزالة الوضع الليلي فقط من صفحات Auth
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = '';
    }
  }, [pathname, isAuthPage, isHomePage]);

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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800 drop-shadow-md">جاري تحميل النظام...</p>
        </div>
      </div>
    );
  }

  // التخطيط الكامل للصفحات المحمية (dashboard فقط)
  return (
    <div className="main-wrapper-content min-h-screen relative">

      {/* Sidebar */}
      <div className="relative z-20 pointer-events-auto">
        <SidebarMenu />
      </div>

      {/* Main Content Area */}
      <div className="main-content relative z-10 pointer-events-auto">
        {/* Header */}
        <Header toggleActive={toggleActive} />

        {/* Page Content */}
        <div className="main-content-container bg-white dark:bg-black">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </div>

    </div>
  );
};

export default LayoutProvider;

