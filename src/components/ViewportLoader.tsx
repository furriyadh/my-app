"use client";

import { useEffect, useRef, useState } from "react";

export default function ViewportLoader({ children, minHeight = "500px" }: { children: React.ReactNode, minHeight?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "200px", // Start loading 200px before it comes into view
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
