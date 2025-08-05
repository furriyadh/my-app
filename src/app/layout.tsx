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
        
        {/* Prevent FOUC (Flash of Unstyled Content) */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html { visibility: hidden; opacity: 0; }
            html.loaded { visibility: visible; opacity: 1; transition: opacity 0.3s; }
          `
        }} />
        
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                document.documentElement.classList.add('loaded');
              });
            `
          }}
        />
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

