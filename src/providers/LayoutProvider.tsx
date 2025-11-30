// المسار: src/providers/LayoutProvider.tsx

'use client';

import React, { useState, ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import SidebarMenu from "../components/Layout/SidebarMenu";
import Header from "../components/Layout/Header/index";
import Footer from "../components/Layout/Footer";
import { supabase } from "@/utils/supabase/client";

interface LayoutProviderProps {
  children: ReactNode;
}

const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarActive, setSidebarActive] = useState(false);
  const authCheckDone = useRef(false);

  // ✅ التحقق السريع من الجلسة من localStorage أولاً
  const [authChecked, setAuthChecked] = useState(() => {
    if (typeof window !== 'undefined') {
      // إذا كان هناك token محفوظ، نعتبر المستخدم مسجل دخول مبدئياً
      const hasToken = localStorage.getItem('sb-mkzwqbgcfdzcqmkzwgy-auth-token');
      return !!hasToken;
    }
    return false;
  });
  
  const [hasSession, setHasSession] = useState<boolean | null>(() => {
    if (typeof window !== 'undefined') {
      const hasToken = localStorage.getItem('sb-mkzwqbgcfdzcqmkzwgy-auth-token');
      return !!hasToken;
    }
    return null;
  });

  // تحديد الصفحات التي لا تحتاج إلى dashboard layout
  const isAuthPage = pathname?.startsWith('/authentication') || 
                     pathname === '/login' || 
                     pathname === '/register' || 
                     pathname === '/forgot-password';
  
  // تحديد صفحة الـ home page (الصفحة الرئيسية للزوار)
  const isHomePage = pathname === '/';
  
  // تحديد صفحات الـ dashboard
  const isDashboardPage = pathname?.startsWith('/dashboard');

  // 👮‍♂️ جميع الصفحات غير صفحات auth والصفحة الرئيسية تعتبر محمية وتتطلب جلسة Supabase
  const isProtectedPage = !isAuthPage && !isHomePage;

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
    // منع التحقق المتكرر
    if (authCheckDone.current) return;
    
    // التحقق من حالة المصادقة فقط للصفحات المحمية
    if (isProtectedPage) {
      const checkAuth = async () => {
        try {
          // ✅ التحقق السريع - إذا كان لدينا جلسة مبدئية من localStorage، نعرض المحتوى فوراً
          // ثم نتحقق في الخلفية
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('❌ خطأ في التحقق من الجلسة:', error);
            setHasSession(false);
            setAuthChecked(true);
            router.push('/authentication/sign-in');
            return;
          }

          setHasSession(!!session);
          setAuthChecked(true);
          authCheckDone.current = true;
        
        if (!session) {
            console.log('⚠️ لا توجد جلسة - التوجيه إلى صفحة تسجيل الدخول');
            router.push('/authentication/sign-in');
          }
        } catch (err) {
          console.error('❌ خطأ غير متوقع في التحقق من الجلسة:', err);
          setHasSession(false);
          setAuthChecked(true);
          router.push('/authentication/sign-in');
        }
      };

      // ✅ إذا كان لدينا جلسة مبدئية، نعرض المحتوى فوراً ونتحقق في الخلفية
      if (hasSession) {
        checkAuth();
      } else {
      checkAuth();
      }

      // الاستماع لتغييرات المصادقة
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        const isLoggedIn = !!session;
        setHasSession(isLoggedIn);

        if (event === 'SIGNED_OUT' || !isLoggedIn) {
          setAuthChecked(true);
          authCheckDone.current = false; // إعادة تعيين للسماح بالتحقق مرة أخرى
          router.push('/authentication/sign-in');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isProtectedPage, router]);

  // إذا كانت صفحة مصادقة أو home page، عرض المحتوى بدون dashboard layout
  if (isAuthPage || isHomePage) {
    return <>{children}</>;
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

