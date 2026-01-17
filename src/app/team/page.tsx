"use client";

import { useEffect } from "react";
import Cta from "@/components/FrontPage/Cta";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import OurTeam from "@/components/FrontPage/OurTeam";
import SplashCursor from "@/components/ui/SplashCursor";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
    const { t, isRTL } = useTranslation();

    // Force dark mode on external pages
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <>
            <div className="front-page-body overflow-hidden" dir="ltr">
                <Navbar />
                <SplashCursor />

                <div className="pt-[125px] md:pt-[145px] lg:pt-[185px] xl:pt-[195px] text-center relative z-[1]">
                    <div className="container 2xl:max-w-[1320px] mx-auto px-[12px]">
                        <h1 className="!mb-0 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px]" dir={isRTL ? 'rtl' : 'ltr'}>
                            {t.team.title}
                        </h1>

                    </div>
                </div>

                <div className="pt-[60px] md:pt-[80px] lg:pt-[100px] xl:pt-[150px] relative z-[1]">
                    <OurTeam />
                </div>

                <Cta />

                <Footer />
            </div>
        </>
    );
}
