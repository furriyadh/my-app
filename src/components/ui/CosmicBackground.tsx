"use client";

import Particles from "@/components/ui/Particles";

interface CosmicBackgroundProps {
    className?: string;
}

export default function CosmicBackground({ className = "" }: CosmicBackgroundProps) {
    return (
        <div className={`fixed inset-0 z-0 pointer-events-none ${className}`}>
            {/* Base cosmic color - ALWAYS dark */}
            <div className="absolute inset-0 bg-[#0a0a0f]" />

            {/* Purple glow from bottom */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            radial-gradient(ellipse 100% 50% at 50% 100%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse 80% 40% at 50% 105%, rgba(124, 58, 237, 0.3) 0%, transparent 40%)
          `,
                }}
            />

            {/* Subtle top glow */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
            radial-gradient(ellipse 60% 30% at 50% -5%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)
          `,
                }}
            />

            {/* Particles - Same as homepage with mouse interaction */}
            <div className="absolute inset-0" style={{ zIndex: 10 }}>
                <Particles
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleColors={["#ffffff"]}
                    moveParticlesOnHover={true}
                    particleHoverFactor={1}
                    alphaParticles={true}
                    particleBaseSize={100}
                    sizeRandomness={1}
                    disableRotation={false}
                />
            </div>
        </div>
    );
}

