"use client";

import Navbar from "@/components/FrontPage/Navbar";
import Footer from "@/components/FrontPage/Footer";
import PricingSection from "@/components/HomePage/PricingSection";
import Image from "next/image";

export default function PricingPage() {
    return (
        <div className="front-page-body overflow-hidden bg-[#0a0e19] text-white" dir="ltr">
            <Navbar />

            <div className="relative z-[1]">
                {/* Background Shapes */}
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

                <main className="relative pt-20">
                    <PricingSection />
                </main>
            </div>

            <Footer />
        </div>
    );
}
