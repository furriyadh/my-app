"use client";

import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export default function LiveDemoSection() {
  return (
    <section id="video-demo" className="overflow-hidden py-16 md:py-24 relative">
      {/* Container - Bigger size */}
      <div className="mx-auto w-[82%] max-w-[1350px] relative">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-zinc-900 dark:text-white">
            Unleash the power of
          </h2>
          <span className="block text-4xl md:text-[6rem] font-bold mt-1 leading-none bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
            AI-Powered Ads
          </span>
        </div>

        {/* Dashboard Preview with Video Dialog */}
        <div className="relative w-full">
          {/* Static Glow Effect */}
          <div className="absolute inset-0 rounded-3xl shadow-[0_0_40px_10px_rgba(168,85,247,0.35)]" />

          <div
            className="relative overflow-hidden transform-gpu rounded-3xl"
          >
            <HeroVideoDialog
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/5WbUnEHt02w?si=XFQsQXJnhLzr9ac0&autoplay=1"
              thumbnailSrc="/dashboard-preview.png"
              thumbnailAlt="Furriyadh AI Dashboard - Click to watch demo"
              className="w-full rounded-3xl"
            />
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent pointer-events-none rounded-b-3xl" />
        </div>
      </div>
    </section>
  );
}

