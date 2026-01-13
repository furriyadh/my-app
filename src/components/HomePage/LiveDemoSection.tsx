"use client";

import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export default function LiveDemoSection() {
  return (
    <section id="video-demo" className="overflow-hidden py-16 md:py-24 relative">
      {/* Background atmospheric effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

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
          <div
            className="relative overflow-hidden transform-gpu"
            style={{
              boxShadow: '0px 0px 100px 0px rgba(168, 85, 247, 0.3), 0px 0px 60px 0px rgba(99, 102, 241, 0.2), 0px 0px 30px 0px rgba(168, 85, 247, 0.15)'
            }}
          >
            <HeroVideoDialog
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              thumbnailSrc="/dashboard-preview.png"
              thumbnailAlt="Furriyadh AI Dashboard - Click to watch demo"
              className="w-full rounded-xl"
            />
          </div>

          {/* Bottom Fade */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-[#0a0a0f] to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

