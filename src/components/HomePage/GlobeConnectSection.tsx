"use client";

import { Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import Script from "next/script";

export default function GlobeConnectSection() {
    return (
        <section className="-mt-20 md:-mt-32 pb-0 relative z-20 overflow-hidden">

            {/* Header Container */}
            <div className="container mx-auto max-w-6xl relative z-10 px-4">
                <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
                        <Globe className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300">Global Reach</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        <span className="text-white">AI Connects Your Ads </span>
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            to the World
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                        Manage your ad campaigns in 190+ countries with advanced AI. Our platform connects you with millions of potential customers on every continent.
                    </p>
                </div>
            </div>

            {/* Full Width Spline 3D Scene */}
            <div className="relative w-full h-[450px] md:h-[600px] -mt-10 md:-mt-20 -mb-10">
                <Script
                    type="module"
                    src="https://unpkg.com/@splinetool/viewer@1.12.22/build/spline-viewer.js"
                />
                {/* @ts-ignore */}
                <spline-viewer
                    url="https://prod.spline.design/zTnimMO3iilg2dyz/scene.splinecode"
                    className="w-full h-full"
                />
            </div>

        </section>
    );
}
