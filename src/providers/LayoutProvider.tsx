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

  // Define public/auth pages (No Sidebar/Header/Footer)
  const isPublicModule =
    pathname === "/" ||
    pathname === "/coming-soon" ||
    pathname?.startsWith("/authentication/") ||
    pathname?.startsWith("/front-pages/") ||
    pathname?.startsWith("/pdf/") ||
    pathname?.startsWith("/extra-pages/"); // Add any other public path prefixes here

  useEffect(() => {
    // Auth Check for Protected Pages
    if (!isPublicModule && supabase) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/authentication/sign-in');
        }
      };

      checkAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          router.push('/authentication/sign-in');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isPublicModule, router, supabase]);

  // Loading State
  if (!isPublicModule && !supabase) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(96, 93, 255, 0.3) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)' }} />
        <div className="relative z-10"><PrimaryLoader /></div>
      </div>
    );
  }

  return (
    <>
      <div className={`main-content-wrap transition-all ${active ? "active" : ""}`}>
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

