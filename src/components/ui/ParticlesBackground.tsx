"use client";

import { usePathname } from "next/navigation";
import { Particles } from "@/components/ui/Particles";
import { useEffect, useState } from "react";

export default function ParticlesBackground() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    // Exclude dashboard pages
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Particles
                color="#ffffff"
                particleCount={25000}
                particleSize={5}
                animate={false}
                className="w-full h-full bg-[#0a0e19]"
            />
        </div>
    );
}
