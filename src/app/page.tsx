import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";

import Hero from "@/components/HomePage/Hero";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";


import LavenderScrollbar from "@/components/Theme/LavenderScrollbar";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative" dir="ltr">
      {/* Custom Scrollbar Styles for this page - Handled by Client Component */}
      <LavenderScrollbar />

      {/* Indigo Cosmos Background with Top & Bottom Glow */}
      <div
        className="fixed inset-0 z-0 bg-[#030014]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 60%),
            radial-gradient(circle at 80% 90%, rgba(124, 58, 237, 0.15) 0%, transparent 50%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="min-h-screen bg-transparent relative selection:bg-purple-500/30 selection:text-white">
          <SmoothScrollManager />
          <Hero />
          <AdCreationPrompt />
          <GoogleOneTap />

          <div className="relative space-y-0 pb-10">
            <ComparisonSection />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
