import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Image from "next/image";

import HeroSection from "@/components/HomePage/HeroSection";
import SmoothScrollManager from "@/components/ui/SmoothScrollManager";

import AdCreationPrompt from "@/components/HomePage/AdCreationPrompt";
import GoogleOneTap from "@/components/Authentication/GoogleOneTap";
import ComparisonSection from "@/components/HomePage/ComparisonSection";
import AIShowcaseSection from "@/components/HomePage/AIShowcaseSection";
import LiveDemoSection from "@/components/HomePage/LiveDemoSection";
import TestimonialsSection from "@/components/HomePage/TestimonialsSection";
import PricingSection from "@/components/HomePage/PricingSection";
import FAQSection from "@/components/HomePage/FAQSection";
import CTASection from "@/components/HomePage/CTASection";


export default function Home() {
  return (
    <div className="front-page-body overflow-hidden bg-[#0a0e19] text-white" dir="ltr">
      <Navbar />

      <div className="relative z-[1]">
        {/* Background Shapes - Moved to be consistent with Features page layering */}
        <div className="absolute top-0 w-full h-full -z-[1] overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 -z-[1] ltr:-right-[30px] rtl:-left-[30px] blur-[250px]">
            <Image
              src="/images/front-pages/shape3.png"
              alt="shape3"
              width={685}
              height={685}
            />
          </div>
          <div className="absolute -top-[220px] -z-[1] ltr:-left-[50px] rtl:-right-[50px] blur-[150px]">
            <Image
              src="/images/front-pages/shape5.png"
              alt="shape3"
              width={658}
              height={656}
            />
          </div>
        </div>

        <main className="min-h-screen relative selection:bg-purple-500/30 selection:text-white">
          <SmoothScrollManager />
          <HeroSection />
          <AdCreationPrompt />
          <GoogleOneTap />

          <div className="relative space-y-0 pb-10">
            <ComparisonSection />
            <AIShowcaseSection />
            <LiveDemoSection />
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />
            <CTASection />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
