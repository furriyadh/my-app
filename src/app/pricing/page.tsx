"use client";

import React from "react";
import Image from "next/image";
import Navbar from "@/components/FrontPage/Navbar";
import Footer from "@/components/FrontPage/Footer";
import {
    PricingHero,
    PricingCards,
    PricingTestimonials,
    PricingCTA,
} from "@/components/Pricing";

export default function PricingPage() {
    return (
        <div className="front-page-body overflow-hidden bg-transparent min-h-screen" dir="ltr">
            <Navbar />

            <div className="relative z-[1]">
                {/* Multi-Shape Nebula Background - Fixed position for scroll stability */}
                <div
                    className="fixed inset-0 z-0 bg-[#030014] pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(139, 92, 246, 0.35) 0%, transparent 50%),
                            radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
                            radial-gradient(circle at 80% 60%, rgba(124, 58, 237, 0.1) 0%, transparent 35%)
                        `,
                    }}
                />

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

