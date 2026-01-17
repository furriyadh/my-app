"use client";

import { Brain, Globe, MessageCircle, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

const PRICING = {
  single: 49,
  multiple: 249,
};

export default function ComparisonSection() {
  return (
    <section className="py-16 md:py-20 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full mb-6">
            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">Compare Your Options</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-bold text-zinc-900 dark:text-white leading-tight">
            Why Choose <span className="bg-gradient-to-r from-green-600 to-cyan-600 dark:from-green-400 dark:to-cyan-400 bg-clip-text text-transparent">Furriyadh AI?</span>
          </h2>

          <p className="mt-6 text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
            See how our AI‑powered Google Ads management platform compares to agencies and freelancers
          </p>
        </div>

        {/* Comparison Table */}
        <div className="relative">
          {/* Static Glow Effect */}
          <div className="absolute inset-0 rounded-3xl shadow-[0_0_40px_10px_rgba(168,85,247,0.35)]" />

          <div className="relative bg-[#0a0f1a]/75 backdrop-blur-xl rounded-3xl border border-purple-500/20 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-3 p-3 md:p-4 border-b border-white/10">
              <div className="text-zinc-400 text-[10px] md:text-xs font-medium">Metric</div>
              <div className="text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-400" />
                  </div>
                  <span className="text-orange-400 text-[9px] md:text-[10px]">Freelancer</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Globe className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-400" />
                  </div>
                  <span className="text-purple-400 text-[9px] md:text-[10px]">Agency</span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                  </div>
                  <span className="text-green-400 text-[9px] md:text-[10px] font-semibold">Furriyadh AI</span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {[
              { metric: "Monthly Cost", freelancer: "$800-2K", agency: "$2K-10K", ai: `$${PRICING.single}-${PRICING.multiple}`, freelancerColor: "text-orange-500 dark:text-orange-400", agencyColor: "text-purple-600 dark:text-purple-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "Setup Time", freelancer: "3-5 Days", agency: "1-2 Weeks", ai: "30 Seconds", freelancerColor: "text-amber-500 dark:text-yellow-400", agencyColor: "text-amber-500 dark:text-yellow-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "Optimization", freelancer: "Weekly", agency: "2-3x/Week", ai: "Real-time 24/7", freelancerColor: "text-amber-500 dark:text-yellow-400", agencyColor: "text-amber-500 dark:text-yellow-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "Response Time", freelancer: "24-48 hrs", agency: "Same day", ai: "Instant", freelancerColor: "text-orange-500 dark:text-orange-400", agencyColor: "text-amber-500 dark:text-yellow-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "Avg. CTR Boost", freelancer: "+20-40%", agency: "+40-60%", ai: "+60-120%", freelancerColor: "text-orange-500 dark:text-orange-400", agencyColor: "text-purple-600 dark:text-purple-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "CPC Reduction", freelancer: "10-20%", agency: "15-30%", ai: "25-45%", freelancerColor: "text-orange-500 dark:text-orange-400", agencyColor: "text-purple-600 dark:text-purple-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "Scalability", freelancer: "Limited", agency: "Good", ai: "Unlimited", freelancerColor: "text-orange-500 dark:text-orange-400", agencyColor: "text-purple-600 dark:text-purple-400", aiColor: "text-green-600 dark:text-green-400" },
              { metric: "Your Time", freelancer: "5-10 hrs/mo", agency: "2-5 hrs/mo", ai: "Set & Forget", freelancerColor: "text-amber-500 dark:text-yellow-400", agencyColor: "text-amber-500 dark:text-yellow-400", aiColor: "text-green-600 dark:text-green-400" },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-3 p-3 md:p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="text-white font-medium text-[10px] md:text-xs">{row.metric}</div>
                <div className={`text-center text-[10px] md:text-xs ${row.freelancerColor}`}>{row.freelancer}</div>
                <div className={`text-center text-[10px] md:text-xs ${row.agencyColor}`}>{row.agency}</div>
                <div className={`text-center text-[10px] md:text-xs font-semibold ${row.aiColor}`}>{row.ai}</div>
              </div>
            ))}


          </div>
        </div>

        {/* Start Campaign Button - Moved Below Card */}
        <div className="mt-8 flex justify-center relative z-20">
          <Link
            href="/campaign/website-url"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />
            <span className="relative z-10">Start Your Campaign Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

