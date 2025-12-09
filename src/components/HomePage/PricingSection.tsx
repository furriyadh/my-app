"use client";

import { useState } from "react";
import { Crown, Users, Sparkles, CheckCircle, Star, Shield } from "lucide-react";
import Link from "next/link";
import ElectroBorder from "@/components/ui/electro-border";

const PRICING = {
  single: 30,
  multiple: 100,
  singleYearly: 24,
  multipleYearly: 80,
};

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
            <Crown className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Choose Your Google Ads Management Plan
          </h2>
          <p className="text-base md:text-lg text-gray-400 mb-6">
            Two simple options to get started with AI‑powered Google Ads management and campaign optimization
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-white/5 rounded-full border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">-20%</span>
            </button>
          </div>
        </div>
          
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Plan 1 - Manage Client Accounts */}
          <ElectroBorder
            borderColor="#10b981"
            borderWidth={2}
            radius="1.5rem"
            distortion={0.3}
            animationSpeed={0.5}
            glow={true}
            aura={false}
            glowBlur={15}
            className="w-full h-full"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 h-full">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">Your Accounts</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Manage Client Accounts</h3>
                <p className="text-gray-400 text-sm">AI management for your existing Google Ads accounts</p>
              </div>
              
              {/* Pricing Options */}
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 font-medium">Single Account</span>
                    <div>
                      <span className="text-3xl font-bold text-white">${billingCycle === 'monthly' ? PRICING.single : PRICING.singleYearly}</span>
                      <span className="text-gray-400 text-sm">/mo</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Perfect for small businesses</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-medium">Multiple Accounts</span>
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Best Value</span>
                    </div>
                    <div>
                      <span className="text-3xl font-bold text-green-400">${billingCycle === 'monthly' ? PRICING.multiple : PRICING.multipleYearly}</span>
                      <span className="text-gray-400 text-sm">/mo</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Unlimited accounts for agencies</p>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-green-400 text-sm text-center">Save 20% with annual billing!</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "AI-Generated Ad Images & Creatives",
                  "AI Ad Copy & Headlines Writing",
                  "Smart Keyword Research & Selection",
                  "Real-time Campaign Optimization",
                  "Automated A/B Testing",
                  "Advanced Analytics Dashboard",
                  "24/7 AI Monitoring",
                  "Email & Chat Support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/authentication/sign-up"
                className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl font-semibold text-center transition-all duration-200 shadow-lg shadow-green-500/30"
              >
                Start Managing
              </Link>
            </div>
          </ElectroBorder>

          {/* Plan 2 - Work on Our Accounts */}
          <ElectroBorder
            borderColor="#a855f7"
            borderWidth={2}
            radius="1.5rem"
            distortion={0.4}
            animationSpeed={0.6}
            glow={true}
            aura={false}
            glowBlur={20}
            className="w-full h-full"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 h-full relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/50">
                  <Star className="w-4 h-4" />
                  Most Popular
                </div>
              </div>
            
              <div className="mb-6 mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-xs font-medium">Our Verified Accounts</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Work on Our Accounts</h3>
                <p className="text-gray-400 text-sm">Premium verified accounts with full AI campaign creation</p>
              </div>
              
              {/* Commission Pricing */}
              <div className="p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">20%</span>
                  <span className="text-gray-400">commission</span>
                </div>
                <p className="text-gray-400 text-sm text-center">of your ad spend only</p>
                <p className="text-green-400 text-xs text-center mt-2 font-medium">No monthly fees • Pay as you go</p>
              </div>
            
              <ul className="space-y-3 mb-8">
                {[
                  "Verified High-Trust Ad Accounts",
                  "No Suspension Risk - Guaranteed",
                  "AI-Generated Ad Images & Banners",
                  "AI-Written Ad Copy & Headlines",
                  "Complete Campaign Setup by AI",
                  "Keyword Research & Bid Strategy",
                  "Real-time 24/7 Optimization",
                  "Dedicated Account Manager",
                  "Priority Support & Reporting",
                  "Unlimited Campaigns & Ad Groups"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/authentication/sign-up"
                className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold text-center transition-all duration-200 shadow-lg shadow-purple-500/50"
              >
                Get Started - Pay Only When You Spend
              </Link>

              {/* Money-back Guarantee */}
              <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                30-day money-back guarantee
              </p>
            </div>
          </ElectroBorder>
        </div>
      </div>
    </section>
  );
}

