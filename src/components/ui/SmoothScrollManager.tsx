"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollManager() {
    useEffect(() => {
        // Disable on mobile/tablet to save Main Thread (significant performance boost)
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            return;
        }

        // "Cinematic" Slow Scroll Settings
        const lenis = new Lenis({
            duration: 1.2,      // Balanced duration (Standard)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1.0, // Natural speed (1:1 with hardware)
            touchMultiplier: 2.0, // Good response on mobile
        });

        // Request Animation Frame loop
        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return null; // This component does not render anything visual
}

