// المسار: src/providers/LayoutProvider.tsx

'use client';

import React, { useState, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { motion } from "motion/react";
import SidebarMenu from "../components/Layout/SidebarMenu";
import Header from "../components/Layout/Header/index";
import Footer from "../components/Layout/Footer";

// ✨ Purple Loader Component - All Purple Gradient
const PurpleLoader = () => {
  const transition = (x: number) => {
    return {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: x * 0.2,
      ease: "easeInOut" as const,
    };
  };
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 12, 0] }}
        transition={transition(0)}
        className="h-5 w-5 rounded-full border border-purple-300 bg-gradient-to-b from-purple-400 to-violet-500 shadow-lg shadow-purple-500/60"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 12, 0] }}
        transition={transition(1)}
        className="h-5 w-5 rounded-full border border-violet-300 bg-gradient-to-b from-violet-400 to-purple-600 shadow-lg shadow-violet-500/60"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 12, 0] }}
        transition={transition(2)}
        className="h-5 w-5 rounded-full border border-purple-300 bg-gradient-to-b from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/60"
      />
    </div>
  );
};

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

  // Removed forced dark mode logic to allow ThemeProvider to handle it
  // useEffect(() => {
  //   if (!isAuthPage) { ... }
  // }, ...);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        {/* Background glow effect */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, rgba(236, 72, 153, 0.15) 40%, transparent 70%)'
          }}
        />

        {/* Purple Loader */}
        <div className="relative z-10">
          <PurpleLoader />
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

