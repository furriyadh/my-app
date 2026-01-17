"use client";

import NotFound from "@/components/ui/not-found";
import { useEffect, useState } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import { usePathname } from "next/navigation";

export default function NotFoundPage() {
    const pathname = usePathname();
    const [language, setLanguage] = useState<'en' | 'ar'>('en');

    // Define Protected/Dashboard Routes matches LayoutProvider.tsx
    const protectedRoutes = [
        '/admin', '/apps', '/billing', '/charts', '/crm', '/crypto-trader', '/dashboard',
        '/demo-navbar', '/doctor', '/ecommerce', '/events', '/finance', '/forms', '/gallery',
        '/google-ads', '/helpdesk', '/hotel', '/invoices', '/lms', '/maps', '/members',
        '/my-profile', '/nft', '/notifications', '/onboarding', '/profile', '/project-management',
        '/quick-test', '/real-estate', '/real-estate-agent', '/restaurant', '/search', '/settings',
        '/social', '/starter', '/tables', '/timeline', '/ui-elements', '/users', '/widgets'
    ];

    const isProtected = protectedRoutes.some(route => pathname === route || pathname?.startsWith(route + '/'));

    useEffect(() => {
        // Basic language detection from localStorage or default to 'en'
        const storedLang = localStorage.getItem('preferredLanguage') as 'en' | 'ar';
        if (storedLang) {
            setLanguage(storedLang);
        }

        // Apply background class to body while on 404 dashboard page to cover layout padding
        if (isProtected) {
            document.body.classList.add('dashboard-404-body');
        }
        return () => {
            document.body.classList.remove('dashboard-404-body');
        };
    }, [isProtected]);

    return (
        <div className="flex flex-col min-h-screen">
            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-404-body {
                    background-color: #FFFFFF !important;
                    background-image: none !important;
                }
                .dark .dashboard-404-body {
                    background-color: #0a0e19 !important;
                }
                /* Ensure any wrapper divs from standard layout are also transparent to show the body background */
                .dashboard-404-body .main-content-wrap,
                .dashboard-404-body .main-content {
                    background-color: transparent !important;
                }
            ` }} />

            {!isProtected && <Navbar />}

            <div className={`flex-grow relative z-10 ${isProtected ? 'pt-0 flex items-center justify-center' : 'pt-32 md:pt-40'}`}>
                <NotFound
                    imageLight="/images/dashboard-404-light.png"
                    imageDark="/images/dashboard-404-dark.png"
                    onButtonClick={() => window.location.href = isProtected ? '/dashboard' : '/'}
                    buttonText={language === 'ar' ? (isProtected ? "العودة للوحة التحكم" : "العودة للرئيسية") : (isProtected ? "Back to Dashboard" : "Back to Home")}
                    animate={false}
                    particleCount={0}
                    className={`!bg-transparent dark:!bg-transparent ${isProtected ? 'h-[60vh]' : 'h-[75vh]'}`}
                />
            </div>

            {!isProtected && <Footer />}
        </div>
    );
}
