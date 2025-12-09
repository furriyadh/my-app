"use client";

import { Sparkles, ArrowRight, Phone } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-3xl text-center">
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-10">
          <Sparkles className="w-12 h-12 mx-auto mb-5 text-purple-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Ready to Transform Your Google Ads Campaigns?
          </h2>
          <p className="text-base md:text-lg text-gray-400 mb-6">
            Join thousands of businesses that trust our platform to manage and optimize their Google Ads campaigns. Start your free trial today and see the difference AI makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/authentication/sign-up"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-purple-500/50 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/front-pages/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all duration-200"
            >
              <Phone className="w-4 h-4" />
              Contact Sales
            </Link>
          </div>
          
          {/* SEO-rich paragraph */}
          <p className="mt-6 text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Furriyadh is a specialized Google Ads (Google AdWords) management platform that helps businesses worldwide run high‑performance Search, Display, Video, Shopping, and Performance Max campaigns. Our AI‑powered tools handle keyword research, ad copywriting, bid optimization, and continuous campaign improvement to maximize your ROAS and minimize cost per click.
          </p>
        </div>
      </div>
    </section>
  );
}

