"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
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
            <span className="text-sm text-zinc-600 dark:text-gray-300">Start free trial - No credit card required</span>
            <span className="text-zinc-400 dark:text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>

          {/* Main Headline - Clean sizing like Lovable */}
          <h1 className="!mb-6 !text-[32px] md:!text-[44px] lg:!text-[56px] xl:!text-[64px] -tracking-[1px] md:-tracking-[1.5px] !leading-[1.1] !font-semibold text-zinc-900 dark:text-white">
            Build your Google Ads
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
              with AI magic
            </span>
          </h1>

          {/* Subtitle - Clean like Lovable */}
          <p className="text-base md:text-lg text-zinc-600 dark:text-gray-400 mb-32 max-w-xl mx-auto leading-relaxed">
            Create high-converting campaigns by chatting with AI
          </p>
        </div>
      </div>
    </section>
  );
}