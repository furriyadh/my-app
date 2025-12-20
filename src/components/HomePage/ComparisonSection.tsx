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
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
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

          {/* Footer CTA */}
          <div className="p-4 md:p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-orange-500/30 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <MessageCircle className="w-3 h-3 text-orange-400" />
                  </div>
                  <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <Globe className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Best Value for Performance</p>
                  <p className="text-green-400 text-xs">Save up to 90% vs Agencies with better results</p>
                </div>
              </div>
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Try Furriyadh AI Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

