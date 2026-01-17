"use client";

import { useEffect } from "react";
import Cta from "@/components/FrontPage/Cta";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import Faq from "@/components/FrontPage/Faq";
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
                        <h1 className="!mb-0 !leading-[1.2] !text-[32px] md:!text-[40px] lg:!text-[50px] xl:!text-[60px] -tracking-[.5px] md:-tracking-[1px] xl:-tracking-[1.5px] text-white" dir={isRTL ? 'rtl' : 'ltr'}>
                            {t.faq.title}
                        </h1>

                    </div>
                </div>

                <div className="relative z-[1]">
                    <Faq />
                </div>

                <Cta />

                <Footer />
            </div>
        </>
    );
}
