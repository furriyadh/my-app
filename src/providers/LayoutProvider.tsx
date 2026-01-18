"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarMenu from "@/components/Layout/SidebarMenu";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { motion } from "motion/react";
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

// ✨ Primary Loader Component
const PrimaryLoader = () => {
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
        className="h-5 w-5 rounded-full border border-primary-300 bg-gradient-to-b from-primary-400 to-indigo-500 shadow-lg shadow-primary-500/60"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 12, 0] }}
        transition={transition(1)}
        className="h-5 w-5 rounded-full border border-indigo-300 bg-gradient-to-b from-indigo-400 to-primary-600 shadow-lg shadow-indigo-500/60"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, 12, 0] }}
        transition={transition(2)}
        className="h-5 w-5 rounded-full border border-primary-300 bg-gradient-to-b from-primary-500 to-blue-500 shadow-lg shadow-primary-500/60"
      />
    </div>
  );
};


// Dynamic import for supabase client
const useSupabaseClient = () => {
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
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
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabaseClient();

  const [active, setActive] = useState<boolean>(false);

  const toggleActive = () => {
    setActive(!active);
  };

  // Define Protected/Dashboard Routes (Show Sidebar/Header/Footer)
  const protectedRoutes = [
    '/admin', '/apps', '/billing', '/charts', '/crm', '/crypto-trader', '/dashboard',
    '/demo-navbar', '/doctor', '/ecommerce', '/events', '/finance', '/forms', '/gallery',
    '/helpdesk', '/hotel', '/invoices', '/lms', '/maps', '/members',
    '/my-profile', '/nft', '/notifications', '/onboarding', '/profile', '/project-management',
    '/quick-test', '/real-estate', '/real-estate-agent', '/restaurant', '/search', '/settings',
    '/social', '/starter', '/tables', '/timeline', '/ui-elements', '/users', '/widgets'
  ];

  // Logic: If path starts with any protected route, it's NOT public.
  // Exception: Authentication and Front Pages are explicitly Public (already covered by not being in protected list? 
  // No, authentication is not in protected list. So it defaults to Public. Correct.)

  const isProtected = protectedRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));
  const isPublicModule = !isProtected;

  useEffect(() => {
    // Auth Check for Protected Pages
    if (!isPublicModule && supabase) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
        }
      };

      checkAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isPublicModule, router, supabase]);

  if (isPublicModule) {
    return <>{children}</>;
  }

  return (
    <>
      <div className={`main-content-wrap transition-all ${active ? "active" : ""} ${isPublicModule ? "!ml-0 !p-0 !w-full" : ""}`}>
        {!isPublicModule && (
          <>
            <SidebarMenu toggleActive={toggleActive} />
            <Header toggleActive={toggleActive} />
          </>
        )}

        <div className={`main-content transition-all flex flex-col overflow-hidden min-h-screen ${!isPublicModule ? '' : 'public-page-content'}`}>
          {children}
          {!isPublicModule && <Footer />}
        </div>
      </div>
    </>
  );
};

export default LayoutProvider;

