import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";

import Hero from "@/components/HomePage/Hero";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";


export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden" dir="ltr">
      {/* Lime Center Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #84cc16, transparent)
          `,
        }}
      />

      <Navbar />

      {/* 
        Direct Rendering - Optimized for Performance
      */}
      <main className="min-h-screen bg-transparent text-white relative z-10 selection:bg-purple-500/30 selection:text-white">

        {/* Scroll Control */}
        <SmoothScrollManager />

        {/* New 3D Hero */}
        <Hero />

        {/* AI Ad Prompt */}
        <AdCreationPrompt />
        <GoogleOneTap />

        <div className="relative z-20 space-y-0 pb-10">
          <ComparisonSection />
        </div>
      </main>

      <Footer />

    </div>
  );
}
