"use client";

import { Brain, Sparkles, Target, Zap, BarChart3, Wand2, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import ModernLoader from "@/components/UI/modern-loader";
import dynamic from "next/dynamic";

const CircularGallery = dynamic(() => import("@/components/UI/CircularGallery"), { ssr: false });

export default function AIShowcaseSection() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header with AI Animation */}
        <div className="text-center mb-16">
          {/* AI Status Badge */}
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-cyan-600/20 border border-green-500/30 rounded-full mb-8 backdrop-blur-xl shadow-lg shadow-green-500/20">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-green-300 font-bold text-sm">AI Engine Active</p>
              <p className="text-green-400/60 text-xs">Processing 2,847 campaigns</p>
            </div>
            <div className="h-8 w-px bg-green-500/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xs font-mono">LIVE</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

          <h2 className="!mb-6 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] !font-bold !text-white">
            <span className="text-white">Watch AI Create </span>
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Winning Campaigns
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            See our AI analyze, create, and optimize ads in real-time. From competitor analysis to launch in seconds.
          </p>

          {/* AI Capabilities Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: <Wand2 className="w-4 h-4" />, text: "Auto Copy Generation", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
              { icon: <Target className="w-4 h-4" />, text: "Smart Audience AI", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
              { icon: <Zap className="w-4 h-4" />, text: "Real-time Bidding", color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" },
              { icon: <BarChart3 className="w-4 h-4" />, text: "Predictive Analytics", color: "from-green-500/20 to-emerald-500/20 border-green-500/30" },
              { icon: <Brain className="w-4 h-4" />, text: "Neural Optimization", color: "from-pink-500/20 to-red-500/20 border-pink-500/30" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${item.color} border rounded-full text-sm text-white/90 backdrop-blur-sm cursor-default hover:scale-105 transition-transform`}
              >
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - AI Campaign Generator */}
        <div className="flex justify-center items-center w-full">
          <div className="w-full max-w-2xl mx-auto px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-gray-950/90 backdrop-blur-xl rounded-3xl border border-green-500/30 overflow-hidden shadow-2xl shadow-green-500/20">
                <ModernLoader
                  words={[
                    "Analyzing competitor ads...",
                    "Generating AI headlines...",
                    "Optimizing bid strategy...",
                    "Predicting CTR scores...",
                    "Creating ad variations...",
                    "Targeting ideal audience...",
                    "Calculating optimal budget...",
                    "Refining ad copy...",
                    "Building campaign structure...",
                    "Maximizing ROAS potential...",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Circular Gallery */}
        <div className="mt-12 md:mt-20 relative">
          <div className="text-center mb-6 md:mb-12">
            <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
              <span className="text-purple-300 text-sm md:text-base font-medium">AI-Generated Ad Gallery</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </div>
            <h2 className="!mb-4 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] !font-bold !text-white">
              Explore All Ad Types
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto px-4">
              Drag to explore our AI-generated campaigns across Search, Display, Shopping, Video, and more
            </p>
          </div>

          <div className="h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] xl:h-[600px] relative">
            <CircularGallery
              items={[
                { image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600", text: "Search Ads" },
                { image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600", text: "Display Ads" },
                { image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600", text: "Shopping Ads" },
                { image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600", text: "Video Ads" },
                { image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600", text: "App Campaigns" },
                { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600", text: "Performance Max" },
                { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600", text: "Smart Campaigns" },
                { image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600", text: "Discovery Ads" },
              ]}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.02}
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-block">
            <Link
              href="/authentication/sign-up"
              className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 overflow-hidden"
            >
              <Brain className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Start Creating AI-Powered Ads</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
            </Link>
          </div>
          <p className="text-gray-500 mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
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

