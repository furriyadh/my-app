import dynamic from "next/dynamic";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import HomeClient from "@/components/HomePage/HomeClient";
import SplineHero from "@/components/HomePage/SplineHero";
import SplineAIEngine from "@/components/HomePage/SplineAIEngine";

export default function Home() {
  return (
    <div className="front-page-body overflow-hidden bg-[#020617] min-h-screen text-white relative" dir="ltr">
      {/* Global Dark Gradient */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_80%)]" />

      <Navbar />

      <HomeClient splineEngineSlot={<SplineAIEngine />}>
        {/* Pass Spline components as children or render them here to keep them as Server Components traversing into Client Component */}
        <SplineHero />
      </HomeClient>

      {/* 
         Structure correction: 
         HomeClient defines the interactive shell.
         The content sections (Server Components) should ideally be passed as children to HomeClient to preserve their Server Component status.
         But HomeClient currently imports and renders Client Sections (HeroSection etc).
         SplineAIEngine needs to be passed into HomeClient.
      */}


      <Footer />
    </div>
  );
}
