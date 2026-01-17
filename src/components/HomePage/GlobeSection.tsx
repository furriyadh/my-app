"use client";

import { motion } from "framer-motion";
import WorldMap from "@/components/ui/world-map";

export default function GlobeSection() {
    return (
        <section className="py-20 relative overflow-hidden w-full font-sans z-10">
            <div className="max-w-7xl mx-auto px-4 w-full">
                {/* Header - Centered Above */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
                        Reaching Customers <span className="bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">Worldwide</span>
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mt-6">
                        Our AI-powered platform helps businesses in over <span className="text-zinc-900 dark:text-white font-semibold">190 countries</span> create and optimize Google Ads campaigns that drive real results.
                    </p>
                </div>

                {/* World Map - Below */}
                <div className="relative w-full">
                    <div className="max-w-7xl mx-auto w-full">
                        <WorldMap
                            lineColor="#0ea5e9"
                            dotsColor="#ffffff51"
                            dots={[
                                {
                                    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                                    end: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
                                },
                                {
                                    start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                                    end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                                },
                                {
                                    start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                                    end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                                },
                                {
                                    start: { lat: 51.5074, lng: -0.1278 }, // London
                                    end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                                },
                                {
                                    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                                    end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                                },
                                {
                                    start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                                    end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
