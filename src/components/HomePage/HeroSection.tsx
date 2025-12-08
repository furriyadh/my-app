"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, ChevronDown, Mic, ArrowUp, Sparkles, Brain, ArrowRight, Play
} from "lucide-react";
import Link from "next/link";
import { TrustedUsers } from "@/components/ui/trusted-users";

// Typewriter Component
const TypewriterText = ({ texts, className }: { texts: string[], className?: string }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const text = texts[currentTextIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < text.length) {
          setCurrentText(text.slice(0, currentText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(text.slice(0, currentText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTextIndex, texts]);

  return (
    <span className={className}>
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export default function HeroSection() {
  const [prompt, setPrompt] = useState('');
  const [isAddPopupOpen, setAddPopupOpen] = useState(false);
  const [isModelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4 Turbo');
  const [isTyping, setIsTyping] = useState(false);
  const models = ['GPT-4 Turbo', 'Claude 3 Opus', 'Gemini Pro'];
  
  const addPopupRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);

  const typewriterTexts = [
    "Create a campaign for my restaurant in NYC...",
    "How to target customers in California?",
    "Best keywords for my e-commerce store?",
    "Optimize my Google Ads budget...",
  ];

  const examplePrompts = [
    "Create a campaign for my restaurant in NYC",
    "How to target customers in California?",
    "Best keywords for my e-commerce store?"
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addPopupRef.current && !addPopupRef.current.contains(event.target as Node)) {
        setAddPopupOpen(false);
      }
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setModelOpen(false);
  };

  const handleSend = () => {
    if (!prompt.trim()) return;
    console.log(`Sending prompt: "${prompt}" with model: ${selectedModel}`);
  };

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Hero Text */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6 backdrop-blur-sm shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powered by Advanced AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              AI‑Powered Google Ads Management
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Launch High‑Converting Campaigns
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            AI‑powered platform to create, manage, and optimize profitable Google Ads campaigns worldwide. Reduce CPC, increase conversions, and maximize your ROAS with smart automation.
          </p>
        </div>

        {/* AI Chatbot Component with Glow Effect */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className={`relative ${isTyping ? 'shadow-lg shadow-purple-500/30' : ''}`}>
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 rounded-3xl blur-xl opacity-50"></div>
            
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 transition-all duration-300 hover:border-purple-500/30">
              {/* Typewriter Placeholder */}
              <div className="relative">
                <textarea
                  className="w-full p-4 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-lg leading-relaxed"
                  rows={3}
                  placeholder=""
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(prompt.length > 0)}
                />
                {!prompt && (
                  <div className="absolute top-4 left-4 text-gray-500 text-lg pointer-events-none">
                    <TypewriterText texts={typewriterTexts} />
                  </div>
                )}
              </div>
            
              <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                {/* Left Controls */}
                <div className="flex items-center gap-3">
                  <div className="relative" ref={addPopupRef}>
                    <button 
                      onClick={() => setAddPopupOpen(!isAddPopupOpen)}
                      className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all duration-200 border border-white/10"
                    >
                      <Plus size={22} />
                    </button>
                    {isAddPopupOpen && (
                      <div className="absolute bottom-full left-0 mb-3 w-64 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-10 p-2">
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors">
                          <span className="text-gray-300">Add Images</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-xl transition-colors">
                          <span className="text-gray-300">Add Files</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative" ref={modelRef}>
                    <button 
                      onClick={() => setModelOpen(!isModelOpen)} 
                      className="flex items-center gap-2 h-12 px-4 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-2xl transition-all duration-200 border border-purple-500/30"
                    >
                      <Brain size={18} className="text-purple-400" />
                      <span className="font-medium hidden md:block">{selectedModel}</span>
                      <ChevronDown size={16} />
                    </button>
                    {isModelOpen && (
                      <div className="absolute bottom-full left-0 mb-3 w-48 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-10 p-2">
                        {models.map((model) => (
                          <button
                            key={model}
                            onClick={() => handleModelSelect(model)}
                            className="w-full p-3 hover:bg-white/10 rounded-xl transition-colors text-left text-gray-300"
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 border border-white/10">
                    <Mic size={22} />
                  </button>
                  <motion.button 
                    onClick={handleSend}
                    className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${
                      prompt.trim() 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/50' 
                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={prompt.trim() ? { scale: 1.1 } : {}}
                    whileTap={prompt.trim() ? { scale: 0.95 } : {}}
                  >
                    <ArrowUp size={22} />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="flex flex-wrap gap-3 mt-6 justify-center">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 transition-all duration-200 hover:border-purple-500/50 hover:scale-105"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex justify-center mt-8">
          <TrustedUsers
            avatars={[
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
            ]}
            rating={5}
            totalUsersText={5000}
            caption="Trusted by"
            starColorClass="text-yellow-400"
            ringColors={[
              "ring-purple-500",
              "ring-blue-500",
              "ring-pink-500",
              "ring-green-500",
              "ring-orange-500",
            ]}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <Link
            href="/authentication/sign-up"
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#video-demo"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Watch Demo
          </Link>
        </div>

        {/* No Credit Card Required */}
        <p className="text-center text-gray-500 text-sm mt-4">
          ✓ No credit card required &nbsp;•&nbsp; ✓ 14-day free trial &nbsp;•&nbsp; ✓ Cancel anytime
        </p>
      </div>
    </section>
  );
}

