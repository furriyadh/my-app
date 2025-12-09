"use client";

import { Wand2, Brain, Rocket, CheckCircle, Sparkles, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { GlowingCards, GlowingCard } from "@/components/lightswind/glowing-cards";

const steps = [
  {
    icon: <Wand2 className="w-7 h-7" />,
    title: "Describe Your Business",
    description: "Simply tell our AI about your business, target audience, and advertising goals in plain language. No technical knowledge required.",
    features: ["Natural language input", "Industry auto-detection", "Goal setting wizard"],
    glowColor: "#ec4899", // Pink
    iconBg: "bg-gradient-to-br from-pink-500 to-purple-600",
  },
  {
    icon: <Brain className="w-7 h-7" />,
    title: "AI Creates Campaigns",
    description: "Our advanced AI analyzes your input, researches keywords, writes compelling ad copy, and builds optimized campaign structures.",
    features: ["Smart keyword research", "AI-written ad copy", "Audience targeting"],
    glowColor: "#06b6d4", // Cyan
    iconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
  },
  {
    icon: <Rocket className="w-7 h-7" />,
    title: "Launch & Optimize",
    description: "Review and launch with one click. Our AI continuously monitors and optimizes your campaigns 24/7 for maximum ROI.",
    features: ["One-click launch", "24/7 optimization", "Real-time analytics"],
    glowColor: "#22c55e", // Green
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
  },
];

// AI Connecting Lines Component
function AIConnectingLines() {
  return (
    <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
      {/* Line 1: Pink to Cyan */}
      <svg className="absolute top-[100px] left-[33%] w-[17%] h-[60px]" viewBox="0 0 200 60" fill="none">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow1">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Static Line */}
        <path 
          d="M 0 30 Q 100 10 200 30" 
          stroke="url(#gradient1)" 
          strokeWidth="2" 
          fill="none" 
          strokeOpacity="0.3"
          strokeDasharray="8 4"
        />
        {/* Animated Particle */}
        <circle r="4" fill="#ec4899" filter="url(#glow1)">
          <animateMotion dur="2s" repeatCount="indefinite">
            <mpath href="#path1" />
          </animateMotion>
        </circle>
        <circle r="3" fill="#06b6d4" filter="url(#glow1)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s">
            <mpath href="#path1" />
          </animateMotion>
        </circle>
        <path id="path1" d="M 0 30 Q 100 10 200 30" fill="none" />
      </svg>

      {/* Line 2: Cyan to Green */}
      <svg className="absolute top-[100px] left-[50%] w-[17%] h-[60px]" viewBox="0 0 200 60" fill="none">
        <defs>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Static Line */}
        <path 
          d="M 0 30 Q 100 50 200 30" 
          stroke="url(#gradient2)" 
          strokeWidth="2" 
          fill="none" 
          strokeOpacity="0.3"
          strokeDasharray="8 4"
        />
        {/* Animated Particle */}
        <circle r="4" fill="#06b6d4" filter="url(#glow2)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0.3s">
            <mpath href="#path2" />
          </animateMotion>
        </circle>
        <circle r="3" fill="#22c55e" filter="url(#glow2)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0.8s">
            <mpath href="#path2" />
          </animateMotion>
        </circle>
        <path id="path2" d="M 0 30 Q 100 50 200 30" fill="none" />
      </svg>

      {/* AI Data Flow Indicators */}
      <div className="absolute top-[85px] left-[40%] flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-pink-500/30">
        <Zap className="w-3 h-3 text-pink-400 animate-pulse" />
        <span className="text-[10px] text-pink-300 font-medium">AI Processing</span>
      </div>
      
      <div className="absolute top-[85px] left-[57%] flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-green-500/30">
        <Zap className="w-3 h-3 text-green-400 animate-pulse" />
        <span className="text-[10px] text-green-300 font-medium">Auto Deploy</span>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
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

        {/* Cards Container with Connecting Lines */}
        <div className="relative mb-16">
          {/* AI Connecting Lines */}
          <AIConnectingLines />

          {/* Glowing Cards */}
          <GlowingCards
            enableGlow={true}
            glowRadius={30}
            glowOpacity={0.8}
            animationDuration={400}
            gap="1.5rem"
            maxWidth="80rem"
            padding="0"
            responsive={true}
          >
            {steps.map((step, index) => (
              <GlowingCard
                key={index}
                glowColor={step.glowColor}
                className="relative bg-gray-900/80 backdrop-blur-xl border-gray-800/50 min-h-[340px] sm:min-h-[380px] flex flex-col"
              >
                {/* Card Content */}
                <div className="flex flex-col h-full">
                  {/* Icon */}
                  <div className={`w-14 h-14 ${step.iconBg} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{step.title}</h3>

                  {/* Description */}
                  <p className="text-gray-400 mb-4 leading-relaxed text-xs sm:text-sm flex-grow">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-1.5 mt-auto">
                    {step.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle 
                          className="w-3.5 h-3.5 flex-shrink-0" 
                          style={{ color: step.glowColor }} 
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowingCard>
            ))}
          </GlowingCards>
        </div>

        {/* Bottom CTA */}
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
