"use client";

import Cta from "@/components/FrontPage/Cta";
import Features from "@/components/FrontPage/Features";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import OurTeam from "@/components/FrontPage/OurTeam";
import Image from "next/image";
import SplashCursor from "@/components/ui/SplashCursor";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { t, isRTL } = useTranslation();

  return (
    <>
      <div className="front-page-body overflow-hidden" dir="ltr">
        <Navbar />
        <SplashCursor />

        <div className="pt-[125px] md:pt-[145px] lg:pt-[185px] xl:pt-[195px] text-center">
          <div className="container 2xl:max-w-[1320px] mx-auto px-[12px] relative z-[1]">
            <h1 className="!mb-0 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px]" dir={isRTL ? 'rtl' : 'ltr'}>
              {t.navbar.features}
            </h1>

          </div>
        </div>

        <Features />

        <OurTeam />

        <Cta />

        <Footer />
      </div>
    </>
  );
}
