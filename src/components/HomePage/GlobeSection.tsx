"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const World = dynamic(
    () => import("@/components/ui/globe").then((m) => m.World),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
        ),
    }
);

const globeConfig = {
    pointSize: 4,
    globeColor: "#062056",
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#062056",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#38bdf8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
};

const sampleArcs = [
    {
        order: 1,
        startLat: 37.7749,
        startLng: -122.4194,
        endLat: 35.6762,
        endLng: 139.6503,
        arcAlt: 0.3,
        color: "#06b6d4",
    },
    {
        order: 2,
        startLat: 51.5074,
        startLng: -0.1278,
        endLat: 40.7128,
        endLng: -74.006,
        arcAlt: 0.25,
        color: "#a855f7",
    },
    {
        order: 3,
        startLat: 24.7136,
        startLng: 46.6753,
        endLat: 25.2048,
        endLng: 55.2708,
        arcAlt: 0.1,
        color: "#22c55e",
    },
    {
        order: 4,
        startLat: -33.8688,
        startLng: 151.2093,
        endLat: 1.3521,
        endLng: 103.8198,
        arcAlt: 0.2,
        color: "#f97316",
    },
    {
        order: 5,
        startLat: 48.8566,
        startLng: 2.3522,
        endLat: 52.52,
        endLng: 13.405,
        arcAlt: 0.1,
        color: "#eab308",
    },
    {
        order: 6,
        startLat: 35.6762,
        startLng: 139.6503,
        endLat: 22.3193,
        endLng: 114.1694,
        arcAlt: 0.15,
        color: "#06b6d4",
    },
    {
        order: 7,
        startLat: 40.7128,
        startLng: -74.006,
        endLat: 19.4326,
        endLng: -99.1332,
        arcAlt: 0.2,
        color: "#a855f7",
    },
    {
        order: 8,
        startLat: 1.3521,
        startLng: 103.8198,
        endLat: 25.2048,
        endLng: 55.2708,
        arcAlt: 0.25,
        color: "#22c55e",
    },
];

export default function GlobeSection() {
    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header - Centered Above */}
                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4"
                    >
                        Reaching Customers{" "}
                        <span className="bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                            Worldwide
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Our AI-powered platform helps businesses across the globe create
                        and optimize Google Ads campaigns that drive real results.
                    </motion.p>
                </div>

                {/* Globe - Below */}
                <div className="relative w-full">
                    <div className="h-[400px] md:h-[600px] w-full max-w-4xl mx-auto">
                        <World globeConfig={globeConfig} data={sampleArcs} />
                    </div>
                </div>
            </div>
        </section>
    );
}
