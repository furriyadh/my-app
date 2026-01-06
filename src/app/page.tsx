"use client";

import { useState, useEffect } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

import HeroSection from "@/components/HomePage/HeroSection";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";
import Orb from "@/components/ui/Orb";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";
import AIShowcaseSection from "@/components/HomePage/AIShowcaseSection";
import LiveDemoSection from "@/components/HomePage/LiveDemoSection";
import TestimonialsSection from "@/components/HomePage/TestimonialsSection";
import FAQSection from "@/components/HomePage/FAQSection";


export default function Home() {
  // Responsive breakpoints using react-responsive
  const isMobileQuery = useMediaQuery({ maxWidth: 640 });
  const isTabletQuery = useMediaQuery({ minWidth: 641, maxWidth: 1024 });
  const isDesktopQuery = useMediaQuery({ minWidth: 1025 });

  const [orbSize, setOrbSize] = useState(1200);
  const [orbTop, setOrbTop] = useState(-64); // -top-16 = -64px

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
    <div className="front-page-body bg-white dark:bg-[#0a0e19] min-h-screen" dir="ltr">
      <Navbar />

      <div className="relative z-[1]">
        {/* Background Shapes - Full atmospheric glow effect like other pages */}
        <div className="absolute top-0 w-full h-full -z-[1] overflow-hidden pointer-events-none">
          {/* Shape 1 - Blue/Cyan glow - top left */}
          <div className="absolute ltr:left-[10px] rtl:right-[10px] top-[300px] -z-[1] blur-[150px]">
            <Image
              src="/images/front-pages/shape1.png"
              alt="shape1"
              width={530}
              height={530}
            />
          </div>
          {/* Shape 2 - Blue/Cyan smaller - middle right */}
          <div className="absolute ltr:right-[25px] rtl:left-[25px] top-[800px] -z-[1] blur-[125px] hidden md:block">
            <Image
              src="/images/front-pages/shape2.png"
              alt="shape2"
              width={530}
              height={530}
            />
          </div>
          {/* Shape 3 - Purple/Blue gradient - bottom right */}
          <div className="absolute bottom-[200px] -z-[1] ltr:-right-[30px] rtl:-left-[30px] blur-[250px]">
            <Image
              src="/images/front-pages/shape3.png"
              alt="shape3"
              width={685}
              height={685}
            />
          </div>
          {/* Shape 4 - Purple/Blue smaller - middle */}
          <div className="absolute top-[1500px] -z-[1] ltr:left-[100px] rtl:right-[100px] blur-[200px] hidden lg:block">
            <Image
              src="/images/front-pages/shape4.png"
              alt="shape4"
              width={500}
              height={500}
            />
          </div>
          {/* Shape 5 - Orange/Purple gradient - top left */}
          <div className="absolute -top-[220px] -z-[1] ltr:-left-[50px] rtl:-right-[50px] blur-[150px]">
            <Image
              src="/images/front-pages/shape5.png"
              alt="shape5"
              width={658}
              height={656}
            />
          </div>
        </div>

        <main className="min-h-screen relative selection:bg-purple-500/30 selection:text-white">
          <SmoothScrollManager />

          {/* Orb Background - Covers HeroSection and AdCreationPrompt - Fully Responsive */}
          <div
            className="orb-container absolute left-0 right-0 flex items-start justify-center z-20 overflow-hidden"
            style={{ height: `${orbSize}px`, top: `${orbTop}px`, width: '100vw' }}
          >
            <div style={{ width: '100vw', height: `${orbSize}px`, position: 'relative' }}>
              <Orb
                hue={0}
                hoverIntensity={2}
                rotateOnHover={true}
                forceHoverState={false}
                backgroundColor="transparent"
              />
            </div>
          </div>

          <HeroSection />
          <AdCreationPrompt />
          <GoogleOneTap />

          <div className="relative space-y-0 pb-10 mt-32">
            <ComparisonSection />
            <AIShowcaseSection />
            <LiveDemoSection />
            <TestimonialsSection />
            <FAQSection />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
