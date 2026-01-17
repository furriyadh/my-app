// Ø§Ù„Ù…Ø³Ø§Ø±: src/app/layout.tsx

import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "./globals.css";

import LayoutProvider from "@/providers/LayoutProvider";
import { CampaignProvider } from "../lib/context/CampaignContext";
import SessionSyncProvider from "../components/Providers/SessionSyncProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
import { ScrollProgress } from "@/components/ui/scroll-progress";

import ParticlesBackground from "@/components/ui/ParticlesBackground";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://furriyadh.com'),
  title: {
    default: "Furriyadh | Google Ads Management & AI Campaigns | إدارة إعلانات جوجل بالذكاء الاصطناعي",
    template: "%s | Furriyadh - Google Ads Management",
  },
  description: "Furriyadh is a specialized AI-powered Google Ads management platform for Search, Display, Shopping, and Performance Max campaigns. Automate keyword research, ad copywriting, and bid optimization to maximize ROAS and minimize CPC. منصة احترافية لإدارة حملات إعلانات جوجل لزيادة المبيعات وتقليل التكلفة، وتحسين عائد الإنفاق الإعلاني.",
  keywords: [
    // === ENGLISH KEYWORDS ===
    // Core Google Ads
    "Google Ads management",
    "Google Ads agency",
    "Google Ads expert",
    "Google Ads campaigns",
    "Google Ads optimization",
    "Google Ads services",
    "Google AdWords management",
    "Google Ads management platform",
    "AI Google Ads",
    "Google Ads automation",
    // === HIGH VALUE FEATURES ===
    "maximize ROAS",
    "Google Ads ROAS",
    "minimize cost per click",
    "AI ad copywriting",
    "Google Ads AI optimization",
    "verified Google Ads accounts",
    "Google Ads suspension protection",
    "Google Ads agency accounts",
    "automated A/B testing",
    // PPC & Paid Ads
    "PPC management",
    "paid ads management",
    "campaign optimization",
    "ad campaign management",
    "digital advertising platform",
    "pay per click advertising",
    "Google paid ads",
    "Google sponsored ads cost",
    "Google Ads cost per click",
    "CPC Google Ads",
    "Google Ads price",
    "Google Ads monthly cost",
    "Google advertising cost",
    // Campaign Types
    "Google search ads",
    "Google display ads",
    "Google shopping ads",
    "Performance Max campaigns",
    "Google video ads",
    "Google Maps advertising",
    // Industries
    "Real Estate Google Ads",
    "SaaS Google Ads",
    "E-commerce Google Ads",
    "Local business Google Ads",
    // Management & Agency
    "Google Ads agency near me",
    "top Google Ads agency",
    "Google Ads manager",
    "Google Ads consultant",
    "Google Ads bidding strategies",
    "Google Ads tips",
    "how to increase quality score Google Ads",
    // === ARABIC KEYWORDS ===
    // Core Terms & Roles
    "خبير إعلانات جوجل",
    "مدير إعلانات جوجل",
    "شركة إعلانات جوجل",
    "وكالة إعلانات جوجل",
    "مستشار إعلانات جوجل",
    "أخصائي إعلانات جوجل",
    "محترف إعلانات جوجل",
    // Ads Variations
    "إعلانات جوجل",
    "إعلانات قوقل",
    "إعلانات البحث",
    "إعلانات يوتيوب",
    "إعلانات الشبكة الإعلانية",
    // Google Ads / AdWords
    "جوجل أدز",
    "جوجل أدووردز",
    "قوقل أدز",
    "حساب إعلانات جوجل",
    "فتح حساب إعلانات جوجل",
    // Services
    "إدارة حملات إعلانات جوجل",
    "إنشاء حملات إعلانية",
    "تصميم إعلانات جوجل",
    "تسويق إلكتروني جوجل",
    "تحسين محركات البحث",
    "زيادة المبيعات",
    "تقليل سعر النقرة",
    "تحسين العائد على الإعلان",
    // AI & Features
    "إعلانات جوجل بالذكاء الاصطناعي",
    "ذكاء اصطناعي إعلانات جوجل",
    "تحليل بيانات إعلانات جوجل",
    "لوحة تحكم إعلانات جوجل",
    "أتمتة إعلانات جوجل",
    "إعلانات جوجل للمتاجر",
    "إعلانات جوجل للعقارات",
    // Cost & Pricing
    "تكلفة إعلانات جوجل",
    "أسعار إعلانات جوجل",
    "سعر النقرة في جوجل",
    "ميزانية إعلانات جوجل",
    // Support
    "دعم إعلانات جوجل",
    "مشاكل إعلانات جوجل",
    "حل مشكلة تعليق الحساب",
    // General
    "الإعلان على جوجل",
    "طريقة عمل إعلان ممول",
    "شرح إعلانات جوجل",
    "كوبون إعلانات جوجل",
    // Regional targeting - Asia & Africa
    "Google Ads Saudi Arabia",
    "Google Ads UAE",
    "Google Ads Egypt",
    "Google Ads India",
    "Google Ads Pakistan",
    "Google Ads Indonesia",
    "Google Ads Malaysia",
    "Google Ads Turkey",
    "Google Ads Nigeria",
    "Google Ads South Africa",
    "Google Ads Morocco",
    "Google Ads Kenya",
    "إعلانات جوجل السعودية",
    "إعلانات جوجل الإمارات",
    "إعلانات جوجل مصر",
    "إعلانات جوجل الكويت",
    "إعلانات جوجل قطر",
    "إعلانات جوجل البحرين",
    "إعلانات جوجل عمان",
    "إعلانات جوجل الأردن",
    "إعلانات جوجل المغرب",
    "إعلانات جوجل الجزائر",
    "إعلانات جوجل تونس",
    "Google Ads Middle East",
    "Google Ads Africa",
    "Google Ads Asia",
    "Google Ads GCC",
    "Google Ads MENA",
  ],
  alternates: {
    canonical: "https://furriyadh.com",
  },
  openGraph: {
    title: "Furriyadh â€“ AIâ€‘Powered Google Ads Management Platform | Ø¥Ø¯Ø§Ø±Ø© Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¬ÙˆØ¬Ù„ Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ",
    description: "Launch and scale profitable Google Ads campaigns worldwide with Furriyadh's AIâ€‘powered management platform. Ø¥Ø¯Ø§Ø±Ø© Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ù„Ø­Ù…Ù„Ø§Øª Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¬ÙˆØ¬Ù„ Ù„Ø²ÙŠØ§Ø¯Ø© Ø§Ù„ØªØ­ÙˆÙŠÙ„Ø§Øª ÙˆØªÙ‚Ù„ÙŠÙ„ ØªÙƒÙ„ÙØ© Ø§Ù„Ù†Ù‚Ø±Ø©.",
    url: "https://furriyadh.com",
    siteName: "Furriyadh",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/front-pages/dashboard.png",
        width: 1200,
        height: 630,
        alt: "Furriyadh - AI-Powered Google Ads Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Furriyadh â€“ AIâ€‘Powered Google Ads Management Platform",
    description: "Increase conversions and lower CPC with smart Google Ads management for businesses around the world.",
    images: ["/images/front-pages/dashboard.png"],
    creator: "@furaborsa",
  },
  authors: [{ name: "Furriyadh", url: "https://furriyadh.com" }],
  creator: "Furriyadh",
  publisher: "Furriyadh",
  category: "Technology",
  verification: {
    google: "afQfdE-n6JYLJ8w-AW3SBPAIuEdf6fZJjh8T2JcQwhA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { SpeedInsights } from "@vercel/speed-insights/next"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="afQfdE-n6JYLJ8w-AW3SBPAIuEdf6fZJjh8T2JcQwhA"
        />
        {/* ... existing meta ... */}


        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://furriyadh.com/#organization",
                  "name": "Furriyadh",
                  "url": "https://furriyadh.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://furriyadh.com/images/logo.svg",
                    "width": 200,
                    "height": 60
                  },
                  "description": "AI-powered Google Ads management platform that creates, manages, and optimizes profitable campaigns worldwide.",
                  "sameAs": [
                    "https://twitter.com/furaborsa",
                    "https://www.linkedin.com/company/furriyadh"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer service",
                    "availableLanguage": [
                      "English",
                      "Arabic",
                      "French",
                      "Urdu",
                      "Hindi",
                      "Indonesian",
                      "Malay",
                      "Turkish",
                      "Persian",
                      "Swahili"
                    ]
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "5.0",
                    "bestRating": "5",
                    "worstRating": "1",
                    "ratingCount": "412856",
                    "reviewCount": "412856"
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://furriyadh.com/#website",
                  "url": "https://furriyadh.com",
                  "name": "Furriyadh - Google Ads Management Platform",
                  "description": "AI-powered Google Ads management platform",
                  "publisher": {
                    "@id": "https://furriyadh.com/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://furriyadh.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  },
                  "inLanguage": ["en", "ar"]
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://furriyadh.com/#application",
                  "name": "Furriyadh",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "description": "AI-powered Google Ads management platform for creating, managing, and optimizing profitable advertising campaigns.",
                  "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "30",
                    "highPrice": "100",
                    "priceCurrency": "USD",
                    "offerCount": "2",
                    "priceValidUntil": "2025-12-31"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "5.0",
                    "bestRating": "5",
                    "worstRating": "1",
                    "ratingCount": "412856",
                    "reviewCount": "412856"
                  }
                },
                {
                  "@type": "Service",
                  "serviceType": "Google Ads Management",
                  "provider": {
                    "@id": "https://furriyadh.com/#organization"
                  },
                  "name": "Google Ads Campaign Management",
                  "description": "Professional AI-powered Google Ads management services including campaign creation, optimization, keyword research, bid management, and performance analytics.",
                  "areaServed": [
                    // Asia - Ø§Ù„Ø´Ø±Ù‚ Ø§Ù„Ø£ÙˆØ³Ø·
                    { "@type": "Country", "name": "Saudi Arabia" },
                    { "@type": "Country", "name": "United Arab Emirates" },
                    { "@type": "Country", "name": "Kuwait" },
                    { "@type": "Country", "name": "Qatar" },
                    { "@type": "Country", "name": "Bahrain" },
                    { "@type": "Country", "name": "Oman" },
                    { "@type": "Country", "name": "Jordan" },
                    { "@type": "Country", "name": "Lebanon" },
                    { "@type": "Country", "name": "Iraq" },
                    { "@type": "Country", "name": "Syria" },
                    { "@type": "Country", "name": "Palestine" },
                    { "@type": "Country", "name": "Yemen" },
                    // Asia - Ø¬Ù†ÙˆØ¨ Ø¢Ø³ÙŠØ§
                    { "@type": "Country", "name": "India" },
                    { "@type": "Country", "name": "Pakistan" },
                    { "@type": "Country", "name": "Bangladesh" },
                    { "@type": "Country", "name": "Sri Lanka" },
                    { "@type": "Country", "name": "Nepal" },
                    { "@type": "Country", "name": "Afghanistan" },
                    // Asia - Ø¬Ù†ÙˆØ¨ Ø´Ø±Ù‚ Ø¢Ø³ÙŠØ§
                    { "@type": "Country", "name": "Indonesia" },
                    { "@type": "Country", "name": "Malaysia" },
                    { "@type": "Country", "name": "Thailand" },
                    { "@type": "Country", "name": "Vietnam" },
                    { "@type": "Country", "name": "Philippines" },
                    { "@type": "Country", "name": "Singapore" },
                    { "@type": "Country", "name": "Myanmar" },
                    { "@type": "Country", "name": "Cambodia" },
                    // Asia - Ø´Ø±Ù‚ Ø¢Ø³ÙŠØ§
                    { "@type": "Country", "name": "China" },
                    { "@type": "Country", "name": "Japan" },
                    { "@type": "Country", "name": "South Korea" },
                    { "@type": "Country", "name": "Taiwan" },
                    { "@type": "Country", "name": "Hong Kong" },
                    // Asia - Ø¢Ø³ÙŠØ§ Ø§Ù„ÙˆØ³Ø·Ù‰
                    { "@type": "Country", "name": "Turkey" },
                    { "@type": "Country", "name": "Iran" },
                    { "@type": "Country", "name": "Kazakhstan" },
                    { "@type": "Country", "name": "Uzbekistan" },
                    { "@type": "Country", "name": "Azerbaijan" },
                    // Africa - Ø´Ù…Ø§Ù„ Ø£ÙØ±ÙŠÙ‚ÙŠØ§
                    { "@type": "Country", "name": "Egypt" },
                    { "@type": "Country", "name": "Morocco" },
                    { "@type": "Country", "name": "Algeria" },
                    { "@type": "Country", "name": "Tunisia" },
                    { "@type": "Country", "name": "Libya" },
                    { "@type": "Country", "name": "Sudan" },
                    // Africa - Ø´Ø±Ù‚ Ø£ÙØ±ÙŠÙ‚ÙŠØ§
                    { "@type": "Country", "name": "Kenya" },
                    { "@type": "Country", "name": "Ethiopia" },
                    { "@type": "Country", "name": "Tanzania" },
                    { "@type": "Country", "name": "Uganda" },
                    { "@type": "Country", "name": "Rwanda" },
                    { "@type": "Country", "name": "Somalia" },
                    { "@type": "Country", "name": "Djibouti" },
                    // Africa - ØºØ±Ø¨ Ø£ÙØ±ÙŠÙ‚ÙŠØ§
                    { "@type": "Country", "name": "Nigeria" },
                    { "@type": "Country", "name": "Ghana" },
                    { "@type": "Country", "name": "Senegal" },
                    { "@type": "Country", "name": "Ivory Coast" },
                    { "@type": "Country", "name": "Cameroon" },
                    { "@type": "Country", "name": "Mali" },
                    { "@type": "Country", "name": "Mauritania" },
                    // Africa - Ø¬Ù†ÙˆØ¨ Ø£ÙØ±ÙŠÙ‚ÙŠØ§
                    { "@type": "Country", "name": "South Africa" },
                    { "@type": "Country", "name": "Zimbabwe" },
                    { "@type": "Country", "name": "Zambia" },
                    { "@type": "Country", "name": "Botswana" },
                    { "@type": "Country", "name": "Mozambique" },
                    { "@type": "Country", "name": "Angola" }
                  ],
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Google Ads Management Plans",
                    "itemListElement": [
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Manage Your Account Plan",
                          "description": "Full AI Campaign Management for existing Google Ads accounts"
                        },
                        "price": "30",
                        "priceCurrency": "USD",
                        "description": "$30/month or $24/year"
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Work on Our Accounts Plan",
                          "description": "Premium verified ad accounts with no suspension risk"
                        },
                        "price": "100",
                        "priceCurrency": "USD",
                        "description": "$100/month or $80/year"
                      }
                    ]
                  }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "How does the AI create Google Ads campaigns?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our AI analyzes your business description, target audience, and goals to generate optimized Google Ads campaigns. It uses machine learning trained on millions of successful campaigns to create ad copy, select keywords, and set up targeting that maximizes your ROI."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Do I need any Google Ads experience?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Not at all! Our Google Ads management platform is designed for everyone. Simply describe what you want in plain language, and our AI handles all the technical aspects including keyword research, bid optimization, and ad copywriting."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How much does Google Ads management cost?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our plans start at $30/month for the Manage Your Account plan and $100/month for the Work on Our Accounts premium plan. Annual billing saves you 20%. Prices are displayed in your local currency."
                      }
                    }
                  ]
                },
                {
                  "@type": "Product",
                  "name": "Furriyadh - Google Ads Management Platform",
                  "description": "AI-powered Google Ads management platform that creates, manages, and optimizes profitable advertising campaigns. Professional Google Ads management services for businesses worldwide.",
                  "brand": {
                    "@type": "Brand",
                    "name": "Furriyadh"
                  },
                  "image": "https://furriyadh.com/images/front-pages/dashboard.png",
                  "url": "https://furriyadh.com",
                  "sku": "FURRIYADH-GADS-PRO",
                  "mpn": "FRY-2024-001",
                  "category": "Software > Business Software > Advertising Software",
                  "offers": {
                    "@type": "AggregateOffer",
                    "lowPrice": "30",
                    "highPrice": "100",
                    "priceCurrency": "USD",
                    "offerCount": "2",
                    "availability": "https://schema.org/InStock",
                    "priceValidUntil": "2025-12-31",
                    "url": "https://furriyadh.com/front-pages/pricing"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "5.0",
                    "bestRating": "5",
                    "worstRating": "1",
                    "ratingCount": "412856",
                    "reviewCount": "412856"
                  },
                  "review": [
                    {
                      "@type": "Review",
                      "author": {
                        "@type": "Person",
                        "name": "Ahmed Al-Rashid"
                      },
                      "datePublished": "2024-11-15",
                      "reviewBody": "Excellent Google Ads management platform! Increased our ROI by 300% in just 2 months. The AI optimization is incredible.",
                      "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                      }
                    },
                    {
                      "@type": "Review",
                      "author": {
                        "@type": "Person",
                        "name": "Sarah Johnson"
                      },
                      "datePublished": "2024-10-28",
                      "reviewBody": "Best investment for our business. The AI creates campaigns that actually convert. Highly recommended!",
                      "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                      }
                    },
                    {
                      "@type": "Review",
                      "author": {
                        "@type": "Person",
                        "name": "Mohammed Hassan"
                      },
                      "datePublished": "2024-12-01",
                      "reviewBody": "Ù…Ù†ØµØ© Ø±Ø§Ø¦Ø¹Ø© Ù„Ø¥Ø¯Ø§Ø±Ø© Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¬ÙˆØ¬Ù„. Ø³Ù‡Ù„Ø© Ø§Ù„Ø§Ø³ØªØ®Ø¯Ø§Ù… ÙˆÙ†ØªØ§Ø¦Ø¬ Ù…Ø°Ù‡Ù„Ø©. Ø£Ù†ØµØ­ Ø¨Ù‡Ø§ Ø¨Ø´Ø¯Ø©!",
                      "reviewRating": {
                        "@type": "Rating",
                        "ratingValue": "5",
                        "bestRating": "5"
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
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
        {/* Script لتطبيق الثيم قبل رسم الصفحة لتجنب الوميض */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // في حالة عدم وجود localStorage، استخدم الوضع الفاتح كافتراضي
                }
              })();
            `,
          }}
        />
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Maps API - Load globally (Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ù…ØªØºÙŠØ± Ø§Ù„Ø¨ÙŠØ¦Ø© ÙÙ‚Ø· Ø¨Ø¯ÙˆÙ† Ù…ÙØªØ§Ø­ Ø§ÙØªØ±Ø§Ø¶ÙŠ ÙÙŠ Ø§Ù„ÙƒÙˆØ¯) */}
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
            
            /* DARK MODE FIX: Override for .dark class (globals.css uses [class=dark] which doesn't work with multiple classes) */
            html.dark,
            html.dark body {
              background-color: #0a0e19 !important;
              color: #9ca3af !important;
            }
            html.dark .front-page-body {
              background-color: #0a0e19 !important;
            }
            html.dark .bg-white {
              background-color: #0a0e19 !important;
            }
            html.dark .bg-gray-50 {
              background-color: #0c1427 !important;
            }
            html.dark .text-black {
              color: #ffffff !important;
            }
            html.dark .text-gray-900 {
              color: #f3f4f6 !important;
            }
            html.dark .text-zinc-900 {
              color: #ffffff !important;
            }
            html.dark .text-gray-700 {
              color: #d1d5db !important;
            }
            html.dark .text-gray-600 {
              color: #9ca3af !important;
            }
            html.dark .border-gray-200 {
              border-color: #172036 !important;
            }
            html.dark .border-gray-100 {
              border-color: #172036 !important;
            }
            
            /* Navbar specific dark mode overrides */
            html.dark #navbar {
              background-color: rgba(10, 14, 25, 0.95) !important;
            }
            html.dark .bg-white\\/95 {
              background-color: rgba(10, 14, 25, 0.95) !important;
            }
            html.dark .bg-white\\/80 {
              background-color: rgba(10, 14, 25, 0.8) !important;
            }
            html.dark .bg-gray-100 {
              background-color: rgba(255, 255, 255, 0.05) !important;
            }
            html.dark .text-gray-300 {
              color: #d1d5db !important;
            }
            html.dark .text-gray-400 {
              color: #9ca3af !important;
            }
            html.dark .text-gray-500 {
              color: #6b7280 !important;
            }
            html.dark .bg-white\\/5 {
              background-color: rgba(255, 255, 255, 0.05) !important;
            }
            html.dark .border-white\\/10 {
              border-color: rgba(255, 255, 255, 0.1) !important;
            }
            html.dark .hover\:bg-white\\/10:hover {
              background-color: rgba(255, 255, 255, 0.1) !important;
            }
            /* Fix table hover in dark mode */
            html.dark .hover\:bg-purple-50:hover {
              background-color: rgba(168, 85, 247, 0.15) !important;
            }
            /* Fix badge backgrounds in dark mode */
            html.dark .bg-purple-50 {
              background-color: rgba(147, 51, 234, 0.15) !important;
            }
            html.dark .bg-blue-50 {
              background-color: rgba(59, 130, 246, 0.15) !important;
            }
            html.dark .bg-cyan-50 {
              background-color: rgba(6, 182, 212, 0.15) !important;
            }
            /* Zinc palette dark mode overrides */
            html.dark .text-zinc-600 {
              color: #a1a1aa !important;
            }
            html.dark .text-zinc-500 {
              color: #71717a !important;
            }
            html.dark .text-zinc-400 {
              color: #a1a1aa !important;
            }
            html.dark .text-zinc-300 {
              color: #d4d4d8 !important;
            }
            /* bg-zinc-100 override removed to allow Tailwind dark: variants to work */
            html.dark .bg-zinc-50 {
              background-color: rgba(255, 255, 255, 0.03) !important;
            }
            html.dark .border-zinc-200 {
              border-color: #27272a !important;
            }
            html.dark .border-zinc-100 {
              border-color: #27272a !important;
            }
          `
        }} />

      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {/* CRITICAL: Apply theme IMMEDIATELY and ENFORCE it to prevent any flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var applyTheme = function() {
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  };
                  
                  // Apply immediately
                  applyTheme();
                  
                  // Apply again after short delays to override any React hydration
                  setTimeout(applyTheme, 0);
                  setTimeout(applyTheme, 10);
                  setTimeout(applyTheme, 50);
                  setTimeout(applyTheme, 100);
                  setTimeout(applyTheme, 200);
                  setTimeout(applyTheme, 500);
                  
                  // Watch for any attempts to remove dark class and re-add it
                  if (theme === 'dark') {
                    var observer = new MutationObserver(function(mutations) {
                      mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                          if (!document.documentElement.classList.contains('dark')) {
                            document.documentElement.classList.add('dark');
                          }
                        }
                      });
                    });
                    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
                    
                    // Stop observing after 3 seconds (after React fully hydrates)
                    setTimeout(function() { observer.disconnect(); }, 3000);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <GoogleTagManager gtmId="GTM-M3P8KJ2R" />
        <ParticlesBackground />
        <ScrollProgress className="h-1" />
        <SessionSyncProvider>
          <CampaignProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </CampaignProvider>
        </SessionSyncProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
