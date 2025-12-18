"use client";


import SplineHeroOverlay from './SplineHeroOverlay';
import Script from "next/script";



export default function SplineHero() {



    return (
        <section className="relative w-full min-h-screen bg-transparent overflow-hidden flex items-center justify-center">

            {/* Background Elements - Removed local bg to use global one */}
            {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,1)_0%,rgba(0,0,0,1)_100%)] z-0" /> */}

            {/* 3D Scene */}
            <div className="absolute inset-0 z-0">
                <Script
                    type="module"
                    src="https://unpkg.com/@splinetool/viewer@1.12.22/build/spline-viewer.js"
                />
                {/* @ts-ignore */}
                <spline-viewer
                    loading="eager"
                    url="https://prod.spline.design/e8ASZthol2ayKeFD/scene.splinecode"
                    className="w-full h-full"
                    style={{
                        display: 'block',
                        transform: 'translateZ(0)',
                        willChange: 'transform, opacity',
                        backfaceVisibility: 'hidden',
                        WebkitFontSmoothing: 'antialiased'
                    }}
                />
            </div>

            {/* Overlay Text */}
            <SplineHeroOverlay />

        </section>
    );
}
