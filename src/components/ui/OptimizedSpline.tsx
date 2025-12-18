"use client";

import { useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';

interface OptimizedSplineProps {
    scene: string;
    className?: string;
    onLoad?: () => void;
}

export default function OptimizedSpline({ scene, className, onLoad }: OptimizedSplineProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!canvasRef.current) return;

        let app: Application | null = null;
        let isMounted = true;

        import('@splinetool/runtime').then(({ Application }) => {
            if (!isMounted || !canvasRef.current) return;

            app = new Application(canvasRef.current);
            app.load(scene).then(() => {
                if (isMounted) {
                    setIsLoading(false);
                    if (onLoad) onLoad();
                }
            }).catch(err => {
                console.error("Spline error:", err);
                if (isMounted) setIsLoading(false);
            });
        });

        return () => {
            isMounted = false;
            if (app) app.dispose();
        };
    }, [scene, onLoad]);

    return (
        <div className={`relative w-full h-full ${className || ''}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-900/10 animate-pulse rounded-2xl flex items-center justify-center border border-white/5 pointer-events-none z-10">
                    <span className="text-gray-500 text-sm">Loading 3D Scene...</span>
                </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
