"use client";

import Spline from '@splinetool/react-spline';

interface SplineWrapperProps {
    scene: string;
    className?: string;
    onLoad?: (e: any) => void;
}

export default function SplineWrapper({ scene, className, onLoad }: SplineWrapperProps) {
    return (
        <Spline
            scene={scene}
            className={className}
            onLoad={onLoad}
        />
    );
}
