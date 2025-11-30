// المسار: src/app/layout.tsx

import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "./globals.css";

import LayoutProvider from "../providers/LayoutProvider";
import { CampaignProvider } from "../lib/context/CampaignContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Furriyadh - Google Ads Management Platform",
  description: "Furriyadh - Professional Google Ads Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* CRITICAL: Clean up sidebar-open classes immediately to prevent black screen */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Remove sidebar-open classes immediately to prevent black screen on refresh
                function cleanupSidebar() {
                  const isDesktop = window.innerWidth >= 1280;
                  
                  // On desktop, ALWAYS remove classes and styles - NEVER apply them
                  if (isDesktop) {
                    if (document.body) {
                      document.body.classList.remove('sidebar-open');
                      // Remove ALL inline styles that could cause black screen
                      document.body.style.top = '';
                      document.body.style.position = '';
                      document.body.style.width = '';
                      document.body.style.height = '';
                      document.body.style.left = '';
                      document.body.style.right = '';
                      document.body.style.bottom = '';
                      document.body.style.overflow = '';
                      document.body.style.overflowX = '';
                      document.body.style.overflowY = '';
                      document.body.style.maxWidth = '';
                      document.body.style.maxHeight = '';
                      document.body.style.transform = '';
                      document.body.style.willChange = '';
                    }
                    if (document.documentElement) {
                      document.documentElement.classList.remove('sidebar-open');
                      document.documentElement.style.overflow = '';
                      document.documentElement.style.height = '';
                      document.documentElement.style.position = '';
                      document.documentElement.style.width = '';
                    }
                  }
                }
                
                // Run immediately (before anything else)
                cleanupSidebar();
                
                // CRITICAL: Use MutationObserver to watch for sidebar-open class additions
                // This removes the class IMMEDIATELY when it's added
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    const isDesktop = window.innerWidth >= 1280;
                    if (isDesktop) {
                      mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                          const target = mutation.target;
                          if (target.classList && target.classList.contains('sidebar-open')) {
                            target.classList.remove('sidebar-open');
                            if (target === document.body) {
                              document.body.style.top = '';
                              document.body.style.position = '';
                              document.body.style.width = '';
                              document.body.style.height = '';
                              document.body.style.overflow = '';
                            }
                            if (target === document.documentElement) {
                              document.documentElement.style.overflow = '';
                              document.documentElement.style.height = '';
                            }
                          }
                        }
                        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                          const target = mutation.target;
                          const isDesktop = window.innerWidth >= 1280;
                          if (isDesktop && (target === document.body || target === document.documentElement)) {
                            if (target.style.position === 'fixed' || target.style.overflow === 'hidden') {
                              cleanupSidebar();
                            }
                          }
                        }
                      });
                    }
                  });
                  
                  // Start observing when DOM is ready
                  if (document.body) {
                    observer.observe(document.body, {
                      attributes: true,
                      attributeFilter: ['class', 'style'],
                      subtree: false
                    });
                  }
                  if (document.documentElement) {
                    observer.observe(document.documentElement, {
                      attributes: true,
                      attributeFilter: ['class', 'style'],
                      subtree: false
                    });
                  }
                  
                  // Also observe when DOM is ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      if (document.body) {
                        observer.observe(document.body, {
                          attributes: true,
                          attributeFilter: ['class', 'style'],
                          subtree: false
                        });
                      }
                      if (document.documentElement) {
                        observer.observe(document.documentElement, {
                          attributes: true,
                          attributeFilter: ['class', 'style'],
                          subtree: false
                        });
                      }
                    });
                  }
                }
                
                // Run multiple times to ensure it sticks
                setTimeout(cleanupSidebar, 0);
                setTimeout(cleanupSidebar, 1);
                setTimeout(cleanupSidebar, 5);
                setTimeout(cleanupSidebar, 10);
                setTimeout(cleanupSidebar, 50);
                setTimeout(cleanupSidebar, 100);
                setTimeout(cleanupSidebar, 200);
                
                // Run on DOM ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    cleanupSidebar();
                    setTimeout(cleanupSidebar, 0);
                    setTimeout(cleanupSidebar, 10);
                    setTimeout(cleanupSidebar, 50);
                  });
                } else {
                  cleanupSidebar();
                  setTimeout(cleanupSidebar, 0);
                  setTimeout(cleanupSidebar, 10);
                  setTimeout(cleanupSidebar, 50);
                }
                
                // Run on window load
                window.addEventListener('load', function() {
                  cleanupSidebar();
                  setTimeout(cleanupSidebar, 0);
                  setTimeout(cleanupSidebar, 10);
                  setTimeout(cleanupSidebar, 50);
                });
                
                // Run on every frame for first 2 seconds (very aggressive cleanup on desktop)
                let frameCount = 0;
                const maxFrames = 120; // ~2 seconds at 60fps
                function frameCleanup() {
                  if (frameCount < maxFrames) {
                    cleanupSidebar();
                    frameCount++;
                    requestAnimationFrame(frameCleanup);
                  }
                }
                requestAnimationFrame(frameCleanup);
                
                // Run cleanup every 50ms for first 3 seconds (continuous cleanup)
                const startTime = Date.now();
                const intervalId = setInterval(function() {
                  cleanupSidebar();
                  if (Date.now() - startTime > 3000) {
                    clearInterval(intervalId);
                  }
                }, 50);
              })();
            `,
          }}
        />
        {/* Script لتطبيق RTL قبل رسم الصفحة لتجنب التضارب */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedLanguage = localStorage.getItem('selectedLanguage');
                  const savedDir = localStorage.getItem('dirAttribute');
                  
                  if (savedDir) {
                    document.documentElement.setAttribute('dir', savedDir);
                  } else if (savedLanguage === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                  } else {
                    document.documentElement.setAttribute('dir', 'ltr');
                  }
                } catch (e) {
                  // في حالة عدم وجود localStorage، استخدم LTR كافتراضي
                  document.documentElement.setAttribute('dir', 'ltr');
                }
              })();
            `,
          }}
        />
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Maps API - Load globally (باستخدام متغير البيئة فقط بدون مفتاح افتراضي في الكود) */}
        <script 
          async
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
        />
        
        {/* CRITICAL: Prevent sidebar-open from causing black screen - Inline CSS for maximum priority */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Force remove sidebar-open styles on desktop - override ALL other CSS */
            @media (min-width: 1280px) {
              body.sidebar-open,
              html.sidebar-open,
              body[class*="sidebar-open"],
              html[class*="sidebar-open"],
              body.sidebar-open *,
              html.sidebar-open * {
                overflow: visible !important;
                overflow-x: visible !important;
                overflow-y: visible !important;
                overflow: auto !important;
                position: static !important;
                position: relative !important;
                width: auto !important;
                height: auto !important;
                top: auto !important;
                left: auto !important;
                right: auto !important;
                bottom: auto !important;
                max-width: none !important;
                max-height: none !important;
                transform: none !important;
              }
              
              body.sidebar-open {
                top: auto !important;
                position: static !important;
                position: relative !important;
              }
              
              /* Force normal styles on body and html on desktop - prevent any fixed positioning */
              body,
              html {
                overflow: visible !important;
                overflow-x: visible !important;
                overflow-y: visible !important;
                position: static !important;
                position: relative !important;
                width: auto !important;
                height: auto !important;
                top: auto !important;
                left: auto !important;
                right: auto !important;
                bottom: auto !important;
              }
            }
          `
        }} />
        
      </head>
      <body className={inter.variable} suppressHydrationWarning>
        <CampaignProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </CampaignProvider>
      </body>
    </html>
  );
}