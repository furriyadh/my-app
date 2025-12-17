import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import HomeClient from "@/components/HomePage/HomeClient";
import SplineHero from "@/components/HomePage/SplineHero";
import HowItWorksSection from "@/components/HomePage/HowItWorksSection";


export default function Home() {
  return (
    <div className="front-page-body overflow-hidden bg-[#020617] min-h-screen text-white relative" dir="ltr">
      {/* Global Dark Gradient Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_80%)]" />

      <Navbar />

      {/* 
        HomeClient handles all client-side logic (scroll, animations).
        We pass Server Components (SplineHero, SplineAIEngine) as props/children 
        to avoid them becoming Client Components implicitly.
      */}
      <HomeClient
        heroSlot={<SplineHero />}
        howItWorksSlot={<HowItWorksSection />}
      />

      <Footer />
    </div>
  );
}
