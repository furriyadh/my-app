"use client";

import { Brain, Globe, MessageCircle, Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

const PRICING = {
  single: 30,
  multiple: 100,
};

export default function ComparisonSection() {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Compare Your Options</span>
          </div>
          <h2 className="!mb-3 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] !font-bold !text-white">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Furriyadh AI for Google Ads</span>?
          </h2>
          <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto">
            See how our AI‑powered Google Ads management platform compares to agencies and freelancers
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-3 p-3 md:p-4 border-b border-white/20 bg-white/5">
            <div className="text-gray-400 text-[10px] md:text-xs font-medium">Metric</div>
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
            { metric: "Monthly Cost", freelancer: "$800-2K", agency: "$2K-10K", ai: `$${PRICING.single}-${PRICING.multiple}`, freelancerColor: "text-orange-400", agencyColor: "text-purple-400", aiColor: "text-green-400" },
            { metric: "Setup Time", freelancer: "3-5 Days", agency: "1-2 Weeks", ai: "30 Seconds", freelancerColor: "text-yellow-400", agencyColor: "text-yellow-400", aiColor: "text-green-400" },
            { metric: "Optimization", freelancer: "Weekly", agency: "2-3x/Week", ai: "Real-time 24/7", freelancerColor: "text-yellow-400", agencyColor: "text-yellow-400", aiColor: "text-green-400" },
            { metric: "Response Time", freelancer: "24-48 hrs", agency: "Same day", ai: "Instant", freelancerColor: "text-orange-400", agencyColor: "text-yellow-400", aiColor: "text-green-400" },
            { metric: "Avg. CTR Boost", freelancer: "+20-40%", agency: "+40-60%", ai: "+60-120%", freelancerColor: "text-orange-400", agencyColor: "text-purple-400", aiColor: "text-green-400" },
            { metric: "CPC Reduction", freelancer: "10-20%", agency: "15-30%", ai: "25-45%", freelancerColor: "text-orange-400", agencyColor: "text-purple-400", aiColor: "text-green-400" },
            { metric: "Scalability", freelancer: "Limited", agency: "Good", ai: "Unlimited", freelancerColor: "text-orange-400", agencyColor: "text-purple-400", aiColor: "text-green-400" },
            { metric: "Your Time", freelancer: "5-10 hrs/mo", agency: "2-5 hrs/mo", ai: "Set & Forget", freelancerColor: "text-yellow-400", agencyColor: "text-yellow-400", aiColor: "text-green-400" },
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

        {/* Start Campaign Button - Moved Below Card */}
        <div className="mt-8 flex justify-center relative z-20">
          <Link
            href="/campaign/website-url"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />
            <span className="relative z-10">Start Your Campaign Now</span>
            <div className="absolute inset-0 rounded-full ring-2 ring-white/50 group-hover:ring-purple-200 transition-all duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}

