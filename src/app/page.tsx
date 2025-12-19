import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";

import Hero from "@/components/HomePage/Hero";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";


export default function Home() {
  return (
    <div className="front-page-body overflow-hidden bg-[#020617] min-h-screen text-white relative" dir="ltr">
      {/* Global Dark Gradient Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_80%)]" />

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
