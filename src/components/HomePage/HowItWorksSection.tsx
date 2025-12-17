"use client";

import { Sparkles, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";
import Script from "next/script";



export default function HowItWorksSection() {
  return (
    <section className="py-16 relative overflow-hidden">

      {/* Header Container */}
      <div className="container mx-auto max-w-6xl relative z-10 px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-white">How </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Launch your first AI-powered Google Ads campaign in minutes, not days
          </p>
        </div>
      </div>

      {/* Full Width Spline 3D Scene */}
      <div className="relative w-full h-[600px] md:h-[800px] -mt-40">
        <Script
          type="module"
          src="https://unpkg.com/@splinetool/viewer@1.12.22/build/spline-viewer.js"
        />
        {/* @ts-ignore */}
        <spline-viewer
          url="https://prod.spline.design/tL7CW-xbEZH6023h/scene.splinecode"
          className="w-full h-full"
        />
      </div>

      {/* Bottom CTA Container */}
      <div className="container mx-auto max-w-6xl relative z-20 px-4 -mt-20">
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/authentication/sign-up"
              className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center gap-2 hover:scale-105"
            >
              Start Creating in 30 Seconds
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-gray-500 text-xs">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}
