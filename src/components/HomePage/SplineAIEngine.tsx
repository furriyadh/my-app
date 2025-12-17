"use client";

import Spline from '@splinetool/react-spline';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SplineAIEngine() {
    const [loading, setLoading] = useState(true);

    // User provided AI Engine / Neural Network Scene
    const SPLINE_SCENE_URL = "https://prod.spline.design/6l5w7FNgmoWg17TE/scene.splinecode";

    return (
        <section className="relative w-full h-[600px] md:h-[800px] bg-transparent overflow-hidden flex items-center justify-center py-20">

            {/* Section Title */}
            <div className="absolute top-10 left-0 right-0 z-20 text-center px-4">
                <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
                    Neural Optimization Engine
                </h2>
                <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    Our advanced AI analyzes millions of market signals in real-time to predict ad performance and maximize your ROI instantly.
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-10 text-white/30">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs uppercase tracking-widest">Loading AI Engine...</p>
                    </div>
                </div>
            )}

            {/* 3D Scene */}
            <div className="w-full h-full relative z-10 scale-100">
                <Spline
                    scene={SPLINE_SCENE_URL}
                    onLoad={() => setLoading(false)}
                />
            </div>

        </section>
    );
}
