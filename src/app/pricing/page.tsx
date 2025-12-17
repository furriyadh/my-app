"use client";

import Navbar from "@/components/FrontPage/Navbar";
import Footer from "@/components/FrontPage/Footer";
import PricingSection from "@/components/HomePage/PricingSection";

export default function PricingPage() {
    return (
        <div className="bg-[#020617] min-h-screen text-white relative">
            {/* Global Dark Gradient */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_80%)]" />

            <Navbar />

            <main className="relative z-10 pt-20">
                <PricingSection />
            </main>

            <Footer />
        </div>
    );
}
