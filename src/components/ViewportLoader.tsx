"use client";

import { useEffect, useRef, useState } from "react";

export default function ViewportLoader({ children, minHeight = "500px" }: { children: React.ReactNode, minHeight?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If it's intersecting, show it.
                // If it stops intersecting, HIDE it to free up GPU/WebGL context.
                setIsVisible(entry.isIntersecting);
            },
            {
                rootMargin: "600px", // Increased to 600px to start loading much earlier
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ minHeight }} className="w-full relative">
            {isVisible ? children : null}
        </div>
    );
}
