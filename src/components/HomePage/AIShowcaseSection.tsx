"use client";

import { Brain, Sparkles, Target, Zap, BarChart3, Wand2, ArrowRight, CheckCircle, Play } from "lucide-react";
import Link from "next/link";
import { BrowserWindow } from "@/components/ui/mock-browser-window";

export default function AIShowcaseSection() {
  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          {/* Small Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-300 text-xs font-medium uppercase tracking-wider">
              Unleash the power of
            </span>
          </div>

          <h2 className="!mb-0 !text-[32px] md:!text-[42px] lg:!text-[52px] xl:!text-[60px] -tracking-[1px] md:-tracking-[1.5px] lg:-tracking-[2px] !leading-[1.1] text-zinc-900 dark:text-white font-bold">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Ads
            </span>
          </h2>
        </div>

        {/* Browser Window with Dashboard */}
        <div className="relative max-w-6xl mx-auto">
          {/* Glow Effect Behind Browser */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 rounded-2xl blur-2xl opacity-60" />

          {/* Browser Mockup */}
          <div className="relative">
            <BrowserWindow
              url="https://app.adspro.ai/dashboard"
              imageSrc="/images/dashboard-preview.png"
              className="w-full shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)]"
            />

            {/* Floating Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                {/* Pulse Ring */}
                <div className="absolute inset-0 -m-4 bg-purple-500/20 rounded-full animate-ping" />
                <div className="absolute inset-0 -m-2 bg-purple-500/30 rounded-full animate-pulse" />

                {/* Play Button */}
                <button className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 pointer-events-auto hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-white ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Capabilities Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {[
            { icon: <Wand2 className="w-4 h-4" />, text: "Auto Copy Generation" },
            { icon: <Target className="w-4 h-4" />, text: "Smart Audience AI" },
            { icon: <Zap className="w-4 h-4" />, text: "Real-time Bidding" },
            { icon: <BarChart3 className="w-4 h-4" />, text: "Predictive Analytics" },
            { icon: <Brain className="w-4 h-4" />, text: "Neural Optimization" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-sm text-zinc-300 backdrop-blur-sm cursor-default hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
            >
              <span className="text-purple-400">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link
            href="/authentication/sign-up"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-base transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
          >
            <Brain className="w-5 h-5" />
            <span>Start Creating AI-Powered Ads</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-zinc-500 mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Cancel anytime
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
