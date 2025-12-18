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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canvasRef.current) return;

        let app: Application;

        // Dynamically load the runtime to ensure it only runs on client
        // and bypasses any build-time ESM/CJS paradoxes.
        import('@splinetool/runtime').then(({ Application }) => {
            app = new Application(canvasRef.current!);

            app.load(SCENE_URL).then(() => {
                setIsLoading(false);
            }).catch((e) => {
                console.error("Spline load error:", e);
                setIsLoading(false); // Hide loader even on error
            });
        });

        return () => {
            if (app) {
                app.dispose();
            }
        };
    }, []);

    return (
        <section className={styles.heroContainer}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className={styles.splineCanvas}
            />
        </section>
    );
}
