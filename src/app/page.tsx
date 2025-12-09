"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { MessageCircle, X, Send, ChevronUp } from "lucide-react";
import { MotionGrid } from "@/components/ui/motion-grid";

// Minimal placeholder - no loading spinners for smooth scrolling
const MinimalPlaceholder = () => <div className="min-h-[200px]" />;

// Lazy Load HomePage Sections - SSR true for instant display
const HeroSection = dynamic(() => import("@/components/HomePage/HeroSection"), {
  ssr: true,
});

const PartnersSection = dynamic(() => import("@/components/HomePage/PartnersSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});

// Lazy load heavy components - Globe after Partners
const GlobeSection = dynamic(() => import("@/components/Globe/GlobeSection").then(mod => ({ default: mod.GlobeSection })), {
  loading: () => <MinimalPlaceholder />,
  ssr: false,
});

const HowItWorksSection = dynamic(() => import("@/components/HomePage/HowItWorksSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});

const LiveDemoSection = dynamic(() => import("@/components/HomePage/LiveDemoSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});


const ComparisonSection = dynamic(() => import("@/components/HomePage/ComparisonSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});

const ChartsSection = dynamic(() => import("@/components/HomePage/ChartsSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: false, // Heavy charts
});

const TestimonialsSection = dynamic(() => import("@/components/HomePage/TestimonialsSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});

const PricingSection = dynamic(() => import("@/components/HomePage/PricingSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});

const FAQSection = dynamic(() => import("@/components/HomePage/FAQSection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});

const CTASection = dynamic(() => import("@/components/HomePage/CTASection"), {
  loading: () => <MinimalPlaceholder />,
  ssr: true,
});
  
const AnimatedNotification = dynamic(() => import("@/components/ui/animated-notification"), {
  ssr: false,
});

// Progress Bar Component
const ScrollProgressBar = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    
    const updateProgress = () => {
      if (progressRef.current) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressRef.current.style.width = `${progress}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1.5 bg-black/20 backdrop-blur-sm">
      <div 
        ref={progressRef}
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-50% to-cyan-400 relative will-change-[width]"
        style={{ 
          width: '0%',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(236, 72, 153, 0.6), 0 0 60px rgba(34, 211, 238, 0.4)'
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-sm" />
      </div>
    </div>
  );
};

// Back to Top Button Component
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Floating Chat Widget Component
const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
                    <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Need Help?</h4>
                  <p className="text-white/70 text-sm">We typically reply in minutes</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 h-48 overflow-y-auto">
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 mb-3">
                <p className="text-gray-300 text-sm">👋 Hi! How can we help you today?</p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                <button className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </motion.button>
                </div>
  );
};

export default function Home() {
  // Lenis Smooth Scroll - Optimized for smoothness
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0, // Faster response
      easing: (t) => 1 - Math.pow(1 - t, 3), // Smooth cubic easing
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2, // More responsive wheel
      touchMultiplier: 2.5, // Better touch response
      infinite: false,
      autoResize: true,
    });

    // Use RAF for smooth animation
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Handle anchor links smoothly
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.hash) {
        e.preventDefault();
        const element = document.querySelector(target.hash);
        if (element) {
          lenis.scrollTo(element as HTMLElement, { offset: -80 });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick as EventListener);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* Progress Bar */}
      <ScrollProgressBar />
                    
      {/* Back to Top Button */}
      <BackToTopButton />
      
      <div className="front-page-body overflow-hidden bg-black min-h-screen text-white relative" dir="ltr">
        {/* Global Motion Grid Background */}
        <div className="fixed inset-0 z-0">
          <MotionGrid
            speed="3s"
            opacity={0.15}
            enableGlow={true}
            lineColor="147, 51, 234"
            backgroundColor="#000000"
            gridSpacing="20px"
            className="w-full h-full"
          />
                  </div>
                  
        <Navbar />
        
        <main className="min-h-screen bg-transparent text-white relative z-10">
          {/* Optimized Section Order for Maximum Conversion */}
          
          {/* 1. Hero - First Impression + AI Chat */}
          <HeroSection />
          
          {/* 2. Live Demo - Show the Product Immediately! */}
          <LiveDemoSection />
                    
          {/* 3. Partners - Build Trust */}
          <PartnersSection />
                    
          {/* 4. Globe - Global Reach & Credibility */}
          <GlobeSection />

          {/* 5. How It Works - 3 Simple Steps */}
          <HowItWorksSection />
          
          {/* 6. Comparison - Why Choose Us vs Others */}
          <ComparisonSection />
          
          {/* 7. Charts - Results & ROI Proof */}
          <ChartsSection />
          
          {/* 8. Testimonials - Customer Success Stories */}
          <TestimonialsSection />
          
          {/* 9. Pricing - Convert Visitors */}
          <PricingSection />

          {/* 10. FAQ - Answer Objections */}
          <FAQSection />
          
          {/* 11. CTA - Final Push to Register */}
          <CTASection />
        </main>

        <Footer />
        
        {/* Floating Chat Widget */}
        <FloatingChatWidget />

        {/* Animated Notifications */}
        <AnimatedNotification
          autoGenerate={true}
          maxNotifications={1}
          autoInterval={20000}
          autoDismissTimeout={8000}
          animationDuration={1000}
          variant="glass"
          position="bottom-left"
          showAvatars={true}
          allowDismiss={true}
          customMessages={[
            "Campaign optimized! ROI +45% 📈",
            "AI adjusted bidding strategy 🤖",
            "Budget allocation optimized 💰",
            "Performance report ready 📊",
            "Quality score improved! ⭐"
          ]}
        />
      </div>
    </>
  );
}
