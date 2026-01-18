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

    // Define Protected/Dashboard Routes to exclude particles from
    const protectedRoutes = [
        '/admin', '/apps', '/billing', '/charts', '/crm', '/crypto-trader', '/dashboard',
        '/demo-navbar', '/doctor', '/ecommerce', '/events', '/finance', '/forms', '/gallery',
        '/helpdesk', '/hotel', '/invoices', '/lms', '/maps', '/members',
        '/my-profile', '/nft', '/notifications', '/onboarding', '/profile', '/project-management',
        '/quick-test', '/real-estate', '/real-estate-agent', '/restaurant', '/search', '/settings',
        '/social', '/starter', '/tables', '/timeline', '/ui-elements', '/users', '/widgets'
    ];

    const isProtected = protectedRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));

    if (isProtected) {
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
