"use client";

import { useState } from "react";
import { Sparkles, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export default function LiveDemoSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="video-demo" className="relative overflow-hidden bg-transparent">

      <ContainerScroll
        titleComponent={
          <>
            <div className="flex flex-col items-center justify-center mb-20 -mt-16 md:-mt-24">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/10 border border-cyan-500/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300">See It In Action</span>
              </div>
              <h2 className="!mb-4 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] !font-bold !text-white">
                The Ultimate Google Ads AI Dashboard
              </h2>
              <p className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto mt-4">
                Launch professional campaigns in 30 seconds. Experience a unified platform where artificial intelligence drives your growth and maximizes ROI.
              </p>
            </div>
          </>
        }
      >
        <div
          className="relative w-full h-full group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src="/dashboard-preview.png"
            alt="Furriyadh AI Dashboard - Google Ads Management Platform"
            fill
            className="object-cover object-left md:object-top"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`group-hover/btn flex flex-col items-center gap-4 transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              {/* Pulse Ring */}
              <div className="relative pointer-events-auto cursor-pointer">
                <div className="absolute inset-0 bg-cyan-400/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute -inset-3 bg-cyan-400/20 rounded-full animate-pulse" />

                {/* Play Button */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                  <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
}
