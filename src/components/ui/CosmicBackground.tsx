"use client";

import { useEffect, useRef } from "react";

interface CosmicBackgroundProps {
    className?: string;
}

export default function CosmicBackground({ className = "" }: CosmicBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Create stars with movement properties
        const stars: {
            x: number;
            y: number;
            size: number;
            opacity: number;
            baseOpacity: number;
            twinkleSpeed: number;
            velocityX: number;
            velocityY: number;
        }[] = [];
        const numStars = 100;

        for (let i = 0; i < numStars; i++) {
            const baseOpacity = Math.random() * 0.5 + 0.3;
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                opacity: baseOpacity,
                baseOpacity: baseOpacity,
                twinkleSpeed: Math.random() * 3 + 1,
                velocityX: (Math.random() - 0.5) * 0.5, // Noticeable movement
                velocityY: Math.random() * 0.3 + 0.1,   // Mostly moving down
            });
        }

        // Animation loop
        let animationId: number;
        let lastTime = 0;

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw and animate stars
            stars.forEach((star) => {
                // Twinkle effect
                const twinkle = Math.sin(currentTime * 0.001 * star.twinkleSpeed) * 0.3;
                star.opacity = Math.max(0.1, Math.min(1, star.baseOpacity + twinkle));

                // Move stars
                star.x += star.velocityX;
                star.y += star.velocityY;

                // Wrap around screen edges
                if (star.x < -10) star.x = canvas.width + 10;
                if (star.x > canvas.width + 10) star.x = -10;
                if (star.y > canvas.height + 10) {
                    star.y = -10;
                    star.x = Math.random() * canvas.width; // Randomize X when wrapping
                }

                // Draw star with glow effect
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.shadowBlur = star.size * 2;
                ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            animationId = requestAnimationFrame(animate);
        };
        animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none ${className}`}>
            {/* Base cosmic color */}
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

            {/* Stars canvas - animated with visible drift and twinkle */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 10 }}
            />
        </div>
    );
}
