"use client";

import NotFound from "@/components/ui/not-found";
import { useEffect, useState } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import { usePathname } from "next/navigation";

export default function NotFoundPage() {
    const pathname = usePathname();
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    // Define Protected/Dashboard Routes matches LayoutProvider.tsx exactly
    const protectedRoutes = [
        '/admin', '/apps', '/billing', '/charts', '/crm', '/crypto-trader', '/dashboard',
        '/demo-navbar', '/doctor', '/ecommerce', '/events', '/finance', '/forms', '/gallery',
        '/helpdesk', '/hotel', '/invoices', '/lms', '/maps', '/members',
        '/my-profile', '/nft', '/notifications', '/onboarding', '/profile', '/project-management',
        '/quick-test', '/real-estate', '/real-estate-agent', '/restaurant', '/search', '/settings',
        '/social', '/starter', '/tables', '/timeline', '/ui-elements', '/users', '/widgets'
    ];

    // Logic: If path starts with any protected route, it's NOT public.
    const isProtected = protectedRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));

    useEffect(() => {
        const storedLang = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
        if (storedLang) {
            setLanguage(storedLang);
        }
    }, []);

    // Protected Route 404 (Dashboard/Admin/Apps etc) - Minimal content
    // LayoutProvider handles Sidebar/Header for these routes
    if (isProtected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <NotFound
                    imageLight="/images/dashboard-404-light.png"
                    imageDark="/images/dashboard-404-dark.png"
                    onButtonClick={() => window.location.href = '/dashboard'}
                    buttonText={language === 'ar' ? "العودة للوحة التحكم" : "Back to Dashboard"}
                    animate={false}
                    particleCount={0}
                    className="!bg-transparent dark:!bg-transparent h-[60vh]"
                />
            </div>
        );
    }

    // Public 404 - Full Layout
    // Includes Navbar and Footer manually since LayoutProvider doesn't wrap public pages with them
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="flex-grow relative pt-32 md:pt-40">
                <NotFound
                    imageLight="/images/404-lightc.png"
                    imageDark="/images/404-darkc.png"
                    onButtonClick={() => window.location.href = '/'}
                    buttonText={language === 'ar' ? "العودة للرئيسية" : "Back to Home"}
                    animate={false}
                    particleCount={0}
                    className="!bg-transparent dark:!bg-transparent h-[75vh]"
                />
            </div>

            <Footer />
        </div>
    );
}
