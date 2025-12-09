"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "How does the AI create Google Ads campaigns?",
    answer: "Our AI analyzes your business description, target audience, and goals to generate optimized Google Ads campaigns. It uses machine learning trained on millions of successful campaigns to create ad copy, select keywords, and set up targeting that maximizes your ROI and lowers your cost per click (CPC)."
  },
  {
    question: "Do I need any Google Ads experience?",
    answer: "Not at all! Our Google Ads management platform is designed for everyone. Simply describe what you want in plain language, and our AI handles all the technical aspects including keyword research, bid optimization, and ad copywriting. You can launch professional Google Ads campaigns in minutes."
  },
  {
    question: "What's included in the 'Work on Our Accounts' plan?",
    answer: "This premium plan gives you access to our verified, high-trust Google Ads accounts that have excellent standing with Google. This means no suspension risks, instant approval for ads, and higher ad limits. Perfect for businesses that need reliable, hassle-free Google Ads management."
  },
  {
    question: "Can I cancel my Google Ads management subscription anytime?",
    answer: "Yes! We offer flexible monthly billing with no long-term contracts. You can cancel anytime directly from your dashboard. If you choose annual billing, you'll save 20% and can still cancel with a prorated refund."
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => {
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
      <button
        onClick={onClick}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left"
      >
        <span className="text-base font-semibold text-white pr-3">{question}</span>
        <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div 
        className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-400 text-sm leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  return (
    <section className="py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg text-gray-400">
            Got questions? We've got answers
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index}>
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

