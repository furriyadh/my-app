"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollManager() {
    useEffect(() => {
        // "Cinematic" Slow Scroll Settings
        const lenis = new Lenis({
            duration: 2.5,      // Extremely slow/smooth finish
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.4, // Very small steps to eliminate "jumpiness"
            touchMultiplier: 1.5,
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
