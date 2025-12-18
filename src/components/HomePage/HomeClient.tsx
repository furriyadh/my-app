"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

import { MessageCircle, X, Send, ChevronUp } from "lucide-react";

// --- Components & Imports ---

// Minimal placeholder to avoid layout shift during lazy load
const MinimalPlaceholder = () => <div className="min-h-[200px]" />;

// Dynamic Imports (Code Splitting) used to reduce Initial Bundle Size


const LiveDemoSection = dynamic(() => import("@/components/HomePage/LiveDemoSection"), {
    loading: () => <MinimalPlaceholder />
});
const ComparisonSection = dynamic(() => import("@/components/HomePage/ComparisonSection"), {
    loading: () => <MinimalPlaceholder />
});
const GlobeConnectSection = dynamic(() => import("@/components/HomePage/GlobeConnectSection"), {
    loading: () => <MinimalPlaceholder />
});


const NotificationManager = dynamic(() => import("@/components/NotificationManager"));

// --- Sub-Components (Internal) ---

const ScrollProgressBar = () => {
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ticking = false;
        const updateProgress = () => {
            if (progressRef.current) {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = (window.scrollY / totalHeight) * 100;
                progressRef.current.style.width = `${progress}%`;
            }
            ticking = false;
        };
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        updateProgress();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1.5 bg-black/20 backdrop-blur-sm">
            <div ref={progressRef} className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-50% to-cyan-400 will-change-[width]" style={{ width: '0%', boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }} />
        </div>
    );
};

const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 500);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"
                >
                    <ChevronUp className="w-6 h-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

const FloatingChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="absolute bottom-20 right-0 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-4">
                        <div className="text-white text-center mb-4">👋 Chat with AI Support</div>
                        <input type="text" placeholder="Type a message..." className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white" />
                    </motion.div>
                )}
            </AnimatePresence>
            <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                {isOpen ? <X className="text-white" /> : <MessageCircle className="text-white" />}
            </button>
        </div>
    );
};

// --- Main Layout Handler ---

interface HomeClientProps {
    children?: React.ReactNode;
    heroSlot: React.ReactNode;
    howItWorksSlot: React.ReactNode;
}

export default function HomeClient({ heroSlot, howItWorksSlot, children }: HomeClientProps) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 2.5, // Increased from 1.5 to 2.5 for very slow, smooth inertia
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
            smoothWheel: true,
            wheelMultiplier: 0.8, // Reduced from 1.2 adds "weight" or "heaviness" to the scroll
            touchMultiplier: 2,
            autoResize: true,
        });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    return (
        <>
            <ScrollProgressBar />
            <BackToTopButton />

            <main className="min-h-screen bg-transparent text-white relative z-10">
                {/* 1. Hero Section (Eager Load - LCP) */}
                {heroSlot}

                {/* 2. Content Sections (Lazy Loaded on Viewport) */}
                <div className="relative z-20 space-y-0 pb-10">
                    <LiveDemoSection />
                    <GlobeConnectSection />

                    <ComparisonSection />

                    {howItWorksSlot}

                    {/* Any legacy children passed */}
                    {children}
                </div>
            </main>

            <FloatingChatWidget />
            <NotificationManager />
        </>
    );
}
