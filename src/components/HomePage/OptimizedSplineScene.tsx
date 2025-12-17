"use client";

import dynamic from 'next/dynamic';

const SplineWrapper = dynamic(() => import('./SplineWrapper'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse bg-white/5" />,
});

interface OptimizedSplineSceneProps {
    scene: string;
    className?: string;
}

export default function OptimizedSplineScene({ scene, className }: OptimizedSplineSceneProps) {
    return (
        <SplineWrapper
            scene={scene}
            className={className}
        />
    );
}
