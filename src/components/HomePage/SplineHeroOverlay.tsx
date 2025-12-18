"use client";

import ScrollFloat from '@/components/ui/ScrollFloat';
import { motion } from 'framer-motion';

export default function SplineHeroOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-10 left-0 right-0 z-30 pointer-events-none text-center px-4"
        >
            <div className="mb-2 md:mb-4">
                <ScrollFloat
                    animationDuration={1}
                    ease='back.inOut(2)'
                    scrollStart='center bottom+=50%'
                    scrollEnd='bottom bottom-=40%'
                    stagger={0.03}
                    textClassName="text-3xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400 tracking-tighter"
                >
                    AI-Powered Ad Intelligence
                </ScrollFloat>
            </div>
            <p className="text-white/60 text-sm md:text-xl font-light max-w-2xl mx-auto mb-6 md:mb-8 text-shadow-sm">
                Automate, optimize, and scale your Google Ads campaigns with next-generation AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pointer-events-auto">
                <a
                    href="/authentication/sign-up"
                    className="px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full font-semibold transition-all shadow-lg shadow-purple-500/50 text-sm sm:text-base"
                >
                    Start Free Trial
                </a>
                <a
                    href="#demo"
                    className="px-6 py-2.5 sm:px-8 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full font-semibold transition-all backdrop-blur-sm text-sm sm:text-base"
                >
                    Watch Demo
                </a>
            </div>
        </motion.div>
    );
}
