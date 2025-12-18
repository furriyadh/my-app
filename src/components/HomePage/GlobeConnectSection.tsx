"use client";

import { Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useState, useEffect, useRef } from "react";
import ScrollFloat from "@/components/ui/ScrollFloat";

export default function GlobeConnectSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "200px" } // Start loading 200px before
        );

        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="-mt-20 md:-mt-32 pb-0 relative z-20 overflow-hidden">

            {/* Header Container */}
            <div className="container mx-auto max-w-6xl relative z-10 px-4">
                <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300">Global Reach</span>
                    </div>
                    <div className="mb-4">
                        <ScrollFloat
                            animationDuration={1}
                            ease='back.inOut(2)'
                            scrollStart='center bottom+=50%'
                            scrollEnd='bottom bottom-=40%'
                            stagger={0.03}
                            textClassName="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400"
                        >
                            AI Connects Your Ads to the World
                        </ScrollFloat>
                    </div>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Manage your ad campaigns in 190+ countries with advanced AI. Our platform connects you with millions of potential customers on every continent.
                    </p>
                </div>
            </div>

            {/* Full Width Spline 3D Scene */}
            <div className="relative w-full h-[450px] md:h-[600px] -mt-10 md:-mt-20 -mb-10">
                {isVisible && (
                    <>
                        <Script
                            type="module"
                            src="https://unpkg.com/@splinetool/viewer@1.12.22/build/spline-viewer.js"
                        />
                        {/* @ts-ignore */}
                        <spline-viewer
                            loading="lazy"
                            url="https://prod.spline.design/zTnimMO3iilg2dyz/scene.splinecode"
                            className="w-full h-full"
                        />
                    </>
                )}
            </div>

        </section>
    );
}
