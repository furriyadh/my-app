"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";

import HeroSection from "@/components/HomePage/HeroSection";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";
import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import ComparisonSection from "@/components/HomePage/ComparisonSection";
import AIShowcaseSection from "@/components/HomePage/AIShowcaseSection";
import FAQSection from "@/components/HomePage/FAQSection";

import dynamic from "next/dynamic";

// Heavy visual components - Lazy Load with no SSR
const AnimatedBeamSection = dynamic(() => import("@/components/HomePage/BentoGridSection"), {
  ssr: false,
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-100 dark:bg-zinc-900/20 rounded-3xl opacity-50 mb-20"></div>
});

const LiveDemoSection = dynamic(() => import("@/components/HomePage/LiveDemoSection"), { ssr: true }); // Keep SSR for LCP image optimization
const TestimonialsSection = dynamic(() => import("@/components/HomePage/TestimonialsSection"), { ssr: true });
const SplashCursor = dynamic(() => import("@/components/ui/SplashCursor"), { ssr: false });



export default function Home() {
  const router = useRouter();


  // 🔐 Handle OAuth hash - catch access_token if OAuth redirects here instead of popup-callback
  useEffect(() => {
    const handleOAuthHash = async () => {
      if (typeof window === 'undefined') return;

      const hash = window.location.hash;
      if (!hash || !hash.includes('access_token')) return;

      console.log('🔐 OAuth hash detected on home page, processing...');

      // Check if this is a popup window
      const isPopup = window.opener !== null ||
        window.name === 'SupabaseAuthPopup' ||
        window.outerWidth < 600;

      console.log('🔐 Is popup window:', isPopup, {
        hasOpener: window.opener !== null,
        windowName: window.name,
        outerWidth: window.outerWidth
      });

      try {
        // Parse the hash
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (!accessToken) return;

        // Import supabase client dynamically
        const { supabase } = await import('@/utils/supabase/client');

        // Get the session (supabase should pick up the token from hash)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ OAuth session error:', error);
          return;
        }

        if (session) {
          console.log('✅ OAuth session found, syncing...');

          // Sync session to cookies
          try {
            const user = session.user;
            const googleIdentity = user.identities?.find((i: any) => i.provider === 'google');
            const googleId = googleIdentity?.id ||
              user.user_metadata?.provider_id ||
              user.user_metadata?.sub ||
              user.id;

            await fetch('/api/auth/sync-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              }
            });

            console.log('✅ Session synced successfully');
          } catch (syncError) {
            console.warn('⚠️ Session sync failed:', syncError);
          }

          // Handle popup or main window
          if (isPopup) {
            console.log('🔐 Notifying opener and closing popup...');
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ type: "SUPABASE_AUTH_SUCCESS" }, '*');
              }
            } catch (e) {
              console.warn('Could not post message to opener:', e);
            }
            // Close the popup
            window.close();
            // Fallback: if window.close() doesn't work, redirect
            setTimeout(() => {
              if (!window.closed) {
                window.location.href = '/dashboard';
              }
            }, 500);
          } else {
            // Clear the hash and redirect to dashboard
            console.log('🔐 Redirecting to dashboard...');
            window.history.replaceState(null, '', window.location.pathname);
            router.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('❌ OAuth hash handling error:', error);
      }
    };

    handleOAuthHash();
  }, [router]);

  // Force dark mode on external pages
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="front-page-body min-h-screen transition-colors duration-300" dir="ltr">
      <Navbar />
      <SplashCursor />

      <div className="relative z-[2]">

        <main className="min-h-screen relative selection:bg-purple-500/30 selection:text-white">
          <SmoothScrollManager />

          <HeroSection />
          <AdCreationPrompt />

          <div className="relative space-y-0 pb-10 mt-32">
            <LiveDemoSection />
            <AnimatedBeamSection />
            <ComparisonSection />
            <TestimonialsSection />
            <FAQSection />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

