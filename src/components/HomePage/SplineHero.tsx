"use client";

import Spline from '@splinetool/react-spline';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SplineHero() {
    const [loading, setLoading] = useState(true);

    // IMPORTANT: Replace this URL with your own from Spline (Export > Code > Public URL)
    // This is a placeholder URL for testing.
    const SPLINE_SCENE_URL = "https://prod.spline.design/ZHGlWU6u-0CHy5d4/scene.splinecode";

    return (
        <section className="relative w-full h-screen bg-transparent overflow-hidden flex items-center justify-center">

            {/* Background Elements - Removed local bg to use global one */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_100%)] z-0" /> */}

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black text-white/50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm tracking-widest uppercase">Loading 3D Experience...</p>
                    </div>
                </div>
            )}

            {/* 3D Scene */}
            <div className="w-full h-full relative z-10 scale-[1.2] md:scale-100">
                <Spline
                    scene={SPLINE_SCENE_URL}
                    onLoad={() => setLoading(false)}
                />
            </div>

            {/* Optional Overlay Text - Can be removed if the 3D scene has it */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-20 left-0 right-0 z-30 pointer-events-none text-center px-4"
            >
                <h1 className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400 mb-4 tracking-tighter">
                    AI-Powered Ad Intelligence
                </h1>
                <p className="text-white/60 text-lg md:text-xl font-light max-w-2xl mx-auto mb-8">
                    Automate, optimize, and scale your Google Ads campaigns with next-generation AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <a
                        href="/authentication/sign-up"
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-purple-500/50"
                    >
                        Start Free Trial
                    </a>
                    <a
                        href="#demo"
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-semibold transition-all backdrop-blur-sm"
                    >
                        Watch Demo
                    </a>
                </div>
            </motion.div>

        </section>
    );
}
