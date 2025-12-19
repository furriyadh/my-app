import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";

import Hero from "@/components/HomePage/Hero";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";


export default function Home() {
  return (
    <div className="front-page-body overflow-hidden min-h-screen w-full bg-[#020617] relative text-white" dir="ltr">
      {/* Purple Radial Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(139,92,246,0.4), transparent)`,
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
