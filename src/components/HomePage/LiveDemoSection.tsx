"use client";

import { useState } from "react";
import { Play, Sparkles, Zap, Target, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LiveDemoSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="video-demo" className="py-24 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300">See It In Action</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">Your AI-Powered </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            One dashboard to rule them all. Monitor, optimize, and scale your Google Ads campaigns with AI intelligence.
          </p>
        </div>

        {/* Main Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Dashboard Frame */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-2xl blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-30' : 'opacity-15'}`} />
            
            {/* Browser Frame */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-white/10 shadow-xl">
              {/* Browser Top Bar */}
              <div className="bg-gray-800/80 px-3 py-2 flex items-center gap-2 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-gray-700/50 rounded-lg px-3 py-1 flex items-center gap-2 text-xs text-gray-400 max-w-xs w-full">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="hidden sm:inline">app.furriyadh.com/dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Live</span>
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Dashboard Screenshot as Video Background */}
              <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden">
                {/* Dashboard Image Background */}
                <Image
                  src="/dashboard-preview.png"
                  alt="Furriyadh AI Dashboard - Google Ads Management Platform"
                  fill
                  className={`object-contain transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
                
                {/* Dark Overlay for Video Feel */}
                <div className="absolute inset-0 bg-black/30" />
                
                {/* Play Button - Always Visible in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="group/btn flex flex-col items-center gap-4">
                    {/* Pulse Ring */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute -inset-3 bg-cyan-400/20 rounded-full animate-pulse" />
                      
                      {/* Play Button */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover/btn:scale-110 transition-all duration-300">
                        <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { icon: <Zap className="w-3.5 h-3.5" />, text: "Real-time Analytics", color: "border-yellow-500/30 text-yellow-300" },
            { icon: <Target className="w-3.5 h-3.5" />, text: "Smart Targeting", color: "border-blue-500/30 text-blue-300" },
            { icon: <TrendingUp className="w-3.5 h-3.5" />, text: "ROI Tracking", color: "border-green-500/30 text-green-300" },
            { icon: <Shield className="w-3.5 h-3.5" />, text: "Secure Platform", color: "border-purple-500/30 text-purple-300" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 bg-white/5 border ${item.color} rounded-full text-xs sm:text-sm backdrop-blur-sm`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.text}</span>
              <span className="sm:hidden">{item.text.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/authentication/sign-up"
            className="group inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
          >
            Get Access Now
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-gray-500 text-xs sm:text-sm mt-3">
            Start your 14-day free trial • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
