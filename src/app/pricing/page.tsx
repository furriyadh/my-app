"use client";

import React, { useEffect } from "react";
import Navbar from "@/components/FrontPage/Navbar";
import Footer from "@/components/FrontPage/Footer";
import SplashCursor from "@/components/ui/SplashCursor";
import {
    PricingHero,
    PricingCards,
    PricingTestimonials,
    PricingCTA,
} from "@/components/Pricing";

export default function PricingPage() {
    // Force dark mode on external pages
    useEffect(() => {
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <div className="front-page-body overflow-hidden min-h-screen" dir="ltr">
            <Navbar />
            <SplashCursor />

            <div className="relative z-[1]">
                <main>
                    <PricingHero />
                    <PricingCards />
                    <PricingTestimonials />
                    <PricingCTA />
                </main>
            </div>

            <Footer />
        </div>
    );
}
