"use client";

import { useEffect, useRef, useState } from 'react';
import styles from "./Hero.module.css";
// We import types only here to avoid SSR issues if simple import fails, 
// but runtime is well-behaved. We will use dynamic import inside useEffect 
// to be 100% safe against SSR window access.
import type { Application } from '@splinetool/runtime';

const SCENE_URL = "https://prod.spline.design/e8ASZthol2ayKeFD/scene.splinecode";

export default function Hero() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let app: Application | null = null;
        let isMounted = true; // Track mount status to prevent race conditions

        import('@splinetool/runtime').then(({ Application }) => {
            if (!isMounted || !canvasRef.current) return; // Stop if already unmounted

            app = new Application(canvasRef.current);
            app.load(SCENE_URL).catch((e) => {
                console.error("Spline load error:", e);
            });
        });

        return () => {
            isMounted = false;
            if (app) {
                app.dispose();
            }
        };
    }, []);

    return (
        <section className={styles.heroContainer}>


            <canvas
                ref={canvasRef}
                className={styles.splineCanvas}
            />
        </section>
    );
}
