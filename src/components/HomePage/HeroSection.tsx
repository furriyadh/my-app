"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, ChevronDown, Mic, ArrowUp, Sparkles, Brain, ArrowRight, Play
} from "lucide-react";
import Link from "next/link";
import { ContainerScroll } from "@/components/UI/container-scroll-animation";
import { Button } from "@/components/UI/Button";

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
    <section className="relative pt-24 pb-16 px-4 overflow-hidden min-h-[90vh] flex items-center">
      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Hero Text */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6 backdrop-blur-sm shadow-lg shadow-purple-500/10">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Powered by Advanced AI</span>
          </div>

          <h1 className="!mb-6 !text-[32px] md:!text-[42px] lg:!text-[56px] xl:!text-[64px] -tracking-[.5px] md:-tracking-[1px] !leading-[1.1] !font-bold !text-white">
            <span className="!text-white">
              AI‑Powered Google Ads Management
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Launch High‑Converting Campaigns
            </span>
          </h1>

          <p className="text-base md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            AI‑powered platform to create, manage, and optimize profitable Google Ads campaigns worldwide. Reduce CPC, increase conversions, and maximize your ROAS with smart automation.
          </p>
        </div>

      </div>
    </section>
  );
}

