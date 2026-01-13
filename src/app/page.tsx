"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";

import { useMediaQuery } from "react-responsive";

import HeroSection from "@/components/HomePage/HeroSection";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";
import Orb from "@/components/ui/Orb";
import Particles from "@/components/ui/Particles";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";
import AIShowcaseSection from "@/components/HomePage/AIShowcaseSection";
import LiveDemoSection from "@/components/HomePage/LiveDemoSection";
import TestimonialsSection from "@/components/HomePage/TestimonialsSection";
import FAQSection from "@/components/HomePage/FAQSection";
import GlobeSection from "@/components/HomePage/GlobeSection";


export default function Home() {
  // Responsive breakpoints using react-responsive
  const isMobileQuery = useMediaQuery({ maxWidth: 640 });
  const isTabletQuery = useMediaQuery({ minWidth: 641, maxWidth: 1024 });
  const isDesktopQuery = useMediaQuery({ minWidth: 1025 });

  const [orbSize, setOrbSize] = useState(1200);
  const [orbTop, setOrbTop] = useState(-64); // -top-16 = -64px

  // Force dark mode on external pages
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Handle hydration mismatch safely
  useEffect(() => {
    if (isMobileQuery) {
      setOrbSize(500);
      setOrbTop(-20); // Closer to top on mobile
    } else if (isTabletQuery) {
      setOrbSize(800);
      setOrbTop(-40); // Medium position on tablet
    } else {
      setOrbSize(1200);
      setOrbTop(-64); // Original position on desktop
    }
  }, [isMobileQuery, isTabletQuery, isDesktopQuery]);

  return (
    <div className="front-page-body min-h-screen transition-colors duration-300 bg-[#0a0a0f]" dir="ltr">
      <Navbar />

      {/* Particles Background - Fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleColors={["#ffffff"]}
          moveParticlesOnHover={true}
          particleHoverFactor={1}
          alphaParticles={true}
          particleBaseSize={100}
          sizeRandomness={1}
          disableRotation={false}
        />
      </div>

      {/* Orb Background - FIXED to stay behind all components while scrolling */}
      <div
        className="fixed inset-0 z-[1] flex items-start justify-center pointer-events-none transition-opacity duration-300 opacity-30"
        style={{ top: `${orbTop}px` }}
      >
        <div style={{ width: '100vw', height: `${orbSize}px`, position: 'relative' }}>
          <Orb
            hue={0}
            hoverIntensity={0}
            rotateOnHover={false}
            forceHoverState={false}
            backgroundColor="transparent"
          />
        </div>
      </div>

      <div className="relative z-[2]">

        <main className="min-h-screen relative selection:bg-purple-500/30 selection:text-white">
          <SmoothScrollManager />

          <HeroSection />
          <AdCreationPrompt />
          <GoogleOneTap />

          <div className="relative space-y-0 pb-10 mt-32">
            <LiveDemoSection />
            <GlobeSection />
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

