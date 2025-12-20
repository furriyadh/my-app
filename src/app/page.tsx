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

      {/* Neutral Dark Background - Slate 950 */}
      <div className="fixed inset-0 z-0 bg-slate-950" />

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
