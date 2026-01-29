"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import TextModifier from "@/components/ui/text-modifier";
import TextType from "@/components/ui/TextType";

export default function HeroSection() {
  const headlines = [
    "Build your Google Ads with AI magic",
    "Create campaigns in minutes, not hours",
    "Let AI optimize your ad performance",
    "Scale your business with smart ads",
  ];

  return (
    <section className="relative pt-64 pb-8 px-4 overflow-hidden min-h-[45vh] flex items-center">
      {/* Content - z-30 above Orb, pointer-events-none to pass events to Orb */}
      <div className="container mx-auto max-w-4xl relative z-30 pointer-events-none">
        {/* Hero Text */}
        <div className="text-center">
          {/* Small promotional badge - pointer-events-auto for clickability */}
          <Link
            href="/pricing"
            className="pointer-events-auto inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-full mb-8 hover:bg-purple-600/20 transition-all group"
          >
            <span className="text-lg">🚀</span>
            <span className="text-sm text-zinc-300">Start Free plan - No credit card required</span>
            <span className="text-zinc-400 dark:text-zinc-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>

          {/* Main Headline - Static first for SEO/LCP, then Animated */}
          <h1 className="!mb-6 !text-[32px] md:!text-[44px] lg:!text-[56px] xl:!text-[64px] -tracking-[1px] md:-tracking-[1.5px] !leading-[1.1] !font-semibold text-white min-h-[70px] md:min-h-[100px] lg:min-h-[130px] xl:min-h-[150px]">
            <TextType
              text={headlines}
              typingSpeed={80}
              deletingSpeed={40}
              pauseDuration={2500}
              loop={true}
              showCursor={true}
              cursorCharacter="|"
              cursorClassName="text-purple-500"
              textColors={["#605dff", "#ad63f6", "#3584fc", "#37d80a"]}
              initialText={headlines[0]} // Pass first headline to render immediately
            />
          </h1>

          {/* Subtitle with TextModifier */}
          <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 mb-32 max-w-xl mx-auto leading-relaxed">
            Create high-converting campaigns by{" "}
            <TextModifier
              highlightColorClass="bg-purple-500/30"
              markerColorClass="bg-purple-500"
              opacity={0.6}
              animationDuration={0.8}
              className="text-white"
            >
              chatting with AI
            </TextModifier>
          </p>
        </div>
      </div>
    </section>
  );
}