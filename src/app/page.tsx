"use client";

import { useState, useEffect, useRef } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, ChevronDown, Mic, ArrowUp, Sparkles, TrendingUp, Target, Zap, 
  BarChart3, Users, Globe, CheckCircle, ArrowRight, Brain, Rocket, Shield,
  Play, Star, Check, Crown, Cpu, LineChart as LineChartIcon, PieChart as PieChartIcon,
  MessageCircle, X, Send, ChevronUp, Wand2, MousePointer, LayoutDashboard,
  ArrowDownRight, ArrowUpRight, Mail, Phone, HelpCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { TrustedUsers } from "@/components/ui/trusted-users";
import { LogoStepper } from "@/components/ui/logo-stepper";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { GlobeSection } from "@/components/Globe/GlobeSection";
import CardSwap, { Card } from "@/components/ui/card-swap";
import { CountUp } from "@/components/lightswind/count-up";
import AnimatedNotification from "@/components/ui/animated-notification";
import dynamic from "next/dynamic";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";

// Dynamic import for LaserFlow to avoid SSR issues with Three.js
const LaserFlow = dynamic(() => import("@/components/ui/laser-flow"), { ssr: false });

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

// Sample chart data for AI Performance
const aiPerformanceData = [
  { month: "Jan", manual: 45, ai: 48, cost: 120, conversions: 25 },
  { month: "Feb", manual: 47, ai: 58, cost: 115, conversions: 35 },
  { month: "Mar", manual: 48, ai: 72, cost: 105, conversions: 52 },
  { month: "Apr", manual: 50, ai: 89, cost: 90, conversions: 78 },
  { month: "May", manual: 51, ai: 115, cost: 75, conversions: 110 },
  { month: "Jun", manual: 52, ai: 145, cost: 60, conversions: 156 },
];

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

// Floating Particles Component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * 800,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

// Aurora Background Component
const AuroraBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute w-full h-full">
        {/* Aurora Layers */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 30% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

// Floating Chat Widget Component
const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 right-0 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Need Help?</h4>
                  <p className="text-white/70 text-sm">We typically reply in minutes</p>
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="p-4 h-48 overflow-y-auto">
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-3 mb-3">
                <p className="text-gray-300 text-sm">👋 Hi! How can we help you today?</p>
              </div>
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
                <button className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </div>
  );
};

// FAQ Accordion Component
const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => {
  return (
    <motion.div 
      className="border border-white/10 rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm hover:border-purple-500/30 transition-all"
      layout
    >
      <button
        onClick={onClick}
        className="w-full p-6 flex items-center justify-between text-left"
      >
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-purple-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 text-gray-400 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isAddPopupOpen, setAddPopupOpen] = useState(false);
  const [isModelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4 Turbo');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    setModelOpen(false);
  };

  const handleSend = () => {
    if (!prompt.trim()) {
      console.error("Please enter a prompt first!");
      return;
    }
    console.log(`Sending prompt: "${prompt}" with model: ${selectedModel}`);
  };

  const examplePrompts = [
    "Create a campaign for my restaurant in NYC",
    "How to target customers in California?",
    "Best keywords for my e-commerce store?"
  ];

  const stats = [
    { icon: <Rocket className="w-6 h-6" />, number: 5000, suffix: "+", label: "Successful Campaigns" },
    { icon: <TrendingUp className="w-6 h-6" />, number: 90, suffix: "%", label: "Conversion Increase" },
    { icon: <Users className="w-6 h-6" />, number: 1000, suffix: "+", label: "Happy Clients" },
    { icon: <Zap className="w-6 h-6" />, number: 24, suffix: "/7", label: "AI Support" }
  ];

  const features = [
    {
      icon: <Brain className="w-12 h-12" />,
      title: "Advanced AI",
      description: "We use the latest AI models to create highly effective campaigns"
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Precise Targeting",
      description: "Identify your ideal audience with high accuracy using advanced analytics"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Comprehensive Analytics",
      description: "Detailed reports and real-time analytics for your campaign performance"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Auto Optimization",
      description: "AI automatically optimizes your campaigns for best results"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "Global Coverage",
      description: "Support all Google Ads campaign types in every market"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Security & Reliability",
      description: "Your data is protected with the highest global security standards"
    }
  ];

  const howItWorks = [
    {
      step: "01",
      icon: <Wand2 className="w-8 h-8" />,
      title: "Describe Your Goal",
      description: "Tell our AI about your business, target audience, and campaign objectives in plain language."
    },
    {
      step: "02",
      icon: <Brain className="w-8 h-8" />,
      title: "AI Creates Magic",
      description: "Our advanced AI analyzes your input and generates optimized campaigns with perfect targeting."
    },
    {
      step: "03",
      icon: <Rocket className="w-8 h-8" />,
      title: "Launch & Grow",
      description: "Review, approve, and launch. Watch your business grow with continuous AI optimization."
    }
  ];

  const beforeAfterData = [
    { metric: "Cost Per Acquisition", before: "$150", after: "$45", improvement: "-70%" },
    { metric: "Click-Through Rate", before: "1.2%", after: "4.8%", improvement: "+300%" },
    { metric: "Conversion Rate", before: "2.1%", after: "8.7%", improvement: "+314%" },
    { metric: "Return on Ad Spend", before: "1.5x", after: "5.2x", improvement: "+247%" },
  ];

  const faqData = [
    {
      question: "How does the AI create campaigns?",
      answer: "Our AI analyzes your business description, target audience, and goals to generate optimized campaigns. It uses machine learning trained on millions of successful campaigns to create ad copy, select keywords, and set up targeting that maximizes your ROI."
    },
    {
      question: "Do I need any technical experience?",
      answer: "Not at all! Our platform is designed for everyone. Simply describe what you want in plain language, and our AI handles all the technical aspects. You can launch professional campaigns in minutes without any prior advertising experience."
    },
    {
      question: "What's included in the 'Work on Our Accounts' plan?",
      answer: "This premium plan gives you access to our verified, high-trust ad accounts that have excellent standing with Google. This means no suspension risks, instant approval for ads, and higher ad limits. Perfect for businesses that need reliable, hassle-free advertising."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes! We offer flexible monthly billing with no long-term contracts. You can cancel anytime directly from your dashboard. If you choose annual billing, you'll save 20% and can still cancel with a prorated refund."
    },
  ];

  const testimonials = [
    {
      name: "John Smith",
      handle: "@johnsmith",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      description: "Amazing platform! Saved us tons of time and effort in managing our ad campaigns. Results exceeded all expectations."
    },
    {
      name: "Sarah Johnson",
      handle: "@sarahjohnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      description: "The AI helped me target customers precisely. My sales increased by 150% in just one month!"
    },
    {
      name: "Michael Chen",
      handle: "@michaelchen",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      description: "Best investment I made for my company. Excellent support and amazing results. Highly recommended!"
    },
    {
      name: "Emily Davis",
      handle: "@emilydavis",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
      description: "Easy to use and very effective. Even without prior experience, I was able to create professional campaigns."
    },
    {
      name: "David Wilson",
      handle: "@davidwilson",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      description: "The analytics and reports are very detailed. I can make decisions based on accurate data."
    },
    {
      name: "Lisa Anderson",
      handle: "@lisaanderson",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      description: "The platform combines everything I need in one place. Saved me hours of daily work."
    },
    {
      name: "Robert Taylor",
      handle: "@roberttaylor",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      description: "Our revenue increased significantly after using the platform. Smart automation saves a lot of effort."
    },
    {
      name: "Jennifer Martinez",
      handle: "@jennifermartinez",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      description: "Advanced analytics tools helped me understand my audience better. A complete and wonderful platform!"
    },
  ];

  const pricing = {
    monthly: { basic: 99, premium: 199 },
    yearly: { basic: 79, premium: 159 }
  };

  return (
    <>
      <div className="front-page-body overflow-hidden bg-black min-h-screen text-white" dir="ltr">
        <Navbar />
        
        <main className="min-h-screen bg-black text-white">
          {/* ============================================ */}
          {/* HERO SECTION - AI Chat Interface */}
          {/* ============================================ */}
          <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
            {/* Aurora Animated Background */}
            <AuroraBackground />
            
            {/* Floating Particles */}
            <FloatingParticles />

            {/* Grid Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }}
            />

            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="container mx-auto max-w-6xl relative z-10"
            >
              {/* Hero Text */}
              <motion.div variants={fadeInUp} className="text-center mb-12">
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6 backdrop-blur-sm"
                  animate={{ 
                    boxShadow: ['0 0 20px rgba(139, 92, 246, 0)', '0 0 20px rgba(139, 92, 246, 0.3)', '0 0 20px rgba(139, 92, 246, 0)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Powered by Advanced AI</span>
                </motion.div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                    Launch Your Ad Campaigns
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    with AI Power
                  </span>
                </h1>
                
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                  A comprehensive platform that uses artificial intelligence to create and manage Google Ads campaigns with high efficiency
                </p>
              </motion.div>

              {/* AI Chatbot Component with Glow Effect */}
              <motion.div variants={fadeInUp} className="max-w-3xl mx-auto mb-8">
                <motion.div 
                  className="relative"
                  animate={isTyping ? { 
                    boxShadow: ['0 0 30px rgba(139, 92, 246, 0.3)', '0 0 60px rgba(139, 92, 246, 0.5)', '0 0 30px rgba(139, 92, 246, 0.3)']
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
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
                </motion.div>

                {/* Example Prompts */}
                <div className="flex flex-wrap gap-3 mt-6 justify-center">
                  {examplePrompts.map((example, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 transition-all duration-200 hover:border-purple-500/50"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {example}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Trust Badge - Immediately after chat */}
              <motion.div variants={fadeInUp} className="flex justify-center mt-8">
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
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
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
              </motion.div>

              {/* No Credit Card Required */}
              <motion.p variants={fadeInUp} className="text-center text-gray-500 text-sm mt-4">
                ✓ No credit card required &nbsp;•&nbsp; ✓ 14-day free trial &nbsp;•&nbsp; ✓ Cancel anytime
              </motion.p>
            </motion.div>
          </section>

          {/* ============================================ */}
          {/* PARTNERS SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Trusted by Industry Leaders
                </h2>
                <p className="text-lg text-gray-400">
                  Leading companies use our platform to achieve their advertising goals
                </p>
              </motion.div>

              <LogoStepper
                logos={[
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/google.com"
                        alt="Google"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Google",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/microsoft.com"
                        alt="Microsoft"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Microsoft",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/amazon.com"
                        alt="Amazon"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Amazon",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/meta.com"
                        alt="Meta"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Meta",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/shopify.com"
                        alt="Shopify"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Shopify",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/stripe.com"
                        alt="Stripe"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Stripe",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/hubspot.com"
                        alt="HubSpot"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "HubSpot",
                  },
                  {
                    icon: (
                      <img
                        src="https://logo.clearbit.com/salesforce.com"
                        alt="Salesforce"
                        className="w-full h-full object-contain"
                      />
                    ),
                    label: "Salesforce",
                  },
                ]}
                direction="loop"
                animationDelay={1.5}
                animationDuration={0.6}
                visibleCount={5}
              />
            </div>
          </section>

          {/* ============================================ */}
          {/* FEATURES SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Why Choose Our Platform?
                </h2>
                <p className="text-xl text-gray-400">
                  Powerful features that make managing your ad campaigns easier and more effective
                </p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 group"
                  >
                    <motion.div 
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl mb-6 text-purple-400"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-3 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ============================================ */}
          {/* AI-POWERED AD EXAMPLES - Google Ads Style */}
          {/* ============================================ */}
          <section className="py-24 px-4 border-t border-white/10 bg-gradient-to-b from-gray-950 via-black to-gray-950 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute w-[600px] h-[600px] top-0 left-1/4 bg-blue-600/5 rounded-full blur-[200px]"></div>
              <div className="absolute w-[600px] h-[600px] bottom-0 right-1/4 bg-purple-600/5 rounded-full blur-[200px]"></div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
              {/* Header */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-20"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-green-600/20 border border-blue-500/30 rounded-full mb-6">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">AI Creates Winning Ads</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="text-white">Our AI Generates </span>
                  <span className="bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400 bg-clip-text text-transparent">
                    High-Converting Ads
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  See real examples of ads created and optimized by our AI across all Google Ads formats
                </p>
              </motion.div>

              {/* Ad Examples Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Search Ad Example 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="font-semibold">Sponsored</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">F</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium">furriyadh.com</p>
                        <p className="text-xs text-gray-500">www.furriyadh.com/ai-ads</p>
                      </div>
                    </div>
                    <h3 className="text-blue-600 text-lg font-medium mb-2 hover:underline cursor-pointer">
                      AI Google Ads Management - 10x Your ROAS
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Let AI manage your Google Ads 24/7. Reduce CPA by 65% and increase conversions automatically.
                    </p>
                    <div className="flex flex-wrap gap-2 text-blue-600 text-sm">
                      <span className="hover:underline cursor-pointer">Free Trial</span>
                      <span>·</span>
                      <span className="hover:underline cursor-pointer">See Pricing</span>
                      <span>·</span>
                      <span className="hover:underline cursor-pointer">Case Studies</span>
                    </div>
                  </div>
                  {/* AI Badge */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+340% CTR</span>
                    </div>
                    <span className="text-xs text-gray-500">Search Campaign</span>
                  </div>
                </motion.div>

                {/* Search Ad Example 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="font-semibold">Sponsored</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium">modernshop.sa</p>
                        <p className="text-xs text-gray-500">www.modernshop.sa/furniture</p>
                      </div>
                    </div>
                    <h3 className="text-blue-600 text-lg font-medium mb-2 hover:underline cursor-pointer">
                      Modern Furniture Sale - Up to 50% Off
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Premium home furniture with free delivery. Transform your space with our exclusive collection.
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80&h=80&fit=crop" alt="Sofa" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="text-sm">
                        <p className="text-gray-800 font-medium">Luxury Sofa Set</p>
                        <p className="text-gray-500">Starting from $899</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+280% Conversions</span>
                    </div>
                    <span className="text-xs text-gray-500">Search + Image</span>
                  </div>
                </motion.div>

                {/* Shopping Ad Example */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative mb-4">
                      <img 
                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop" 
                        alt="Smart Watch" 
                        className="w-full h-40 object-contain bg-gray-50 rounded-xl"
                      />
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">-30%</span>
                    </div>
                    <h3 className="text-blue-600 font-medium mb-1 hover:underline cursor-pointer">
                      Smart Watch Pro X
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">TechStore.sa</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-800 font-bold text-lg">$199</span>
                      <span className="text-gray-400 line-through text-sm">$285</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex text-yellow-400">
                        {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
                      </div>
                      <span className="text-gray-500 text-sm">(2,847)</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+420% Sales</span>
                    </div>
                    <span className="text-xs text-gray-500">Shopping Campaign</span>
                  </div>
                </motion.div>

                {/* Display Ad Example */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Scale Your Business</h3>
                      <p className="text-white/80 text-sm mb-4">
                        AI-powered marketing that delivers results. Start your free trial today.
                      </p>
                      <button className="bg-white text-purple-600 px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors">
                        Get Started Free
                      </button>
                    </div>
                    <p className="absolute bottom-2 right-3 text-white/50 text-xs">Ad • furriyadh.com</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+180% Reach</span>
                    </div>
                    <span className="text-xs text-gray-500">Display Network</span>
                  </div>
                </motion.div>

                {/* Video Ad Example */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop" 
                        alt="Video Ad" 
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-white text-xs">
                        0:30
                      </div>
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <div className="bg-red-600 px-2 py-0.5 rounded text-white text-xs font-bold flex items-center gap-1">
                          <Play className="w-3 h-3" fill="white" />
                          YouTube
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span>Ad</span>
                        <span>•</span>
                        <span>techstore.sa</span>
                      </div>
                      <h3 className="text-gray-800 font-medium mb-1">
                        The Future of Smart Home Technology
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Discover how AI transforms your home...
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+190% Views</span>
                    </div>
                    <span className="text-xs text-gray-500">Video Campaign</span>
                  </div>
                </motion.div>

                {/* App Campaign Example */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-800 font-semibold">FastPay Wallet</h3>
                        <p className="text-gray-500 text-sm">Send money instantly</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3 3h18v18H3V3zm16.5 16.5v-15h-15v15h15z"/>
                            </svg>
                            Google Play
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Downloads</p>
                        <p className="text-gray-800 font-semibold">5M+</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Rating</p>
                        <p className="text-gray-800 font-semibold">4.9 ★</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Size</p>
                        <p className="text-gray-800 font-semibold">24 MB</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Install
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+560% Installs</span>
                    </div>
                    <span className="text-xs text-gray-500">App Campaign</span>
                  </div>
                </motion.div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link
                  href="/authentication/sign-up"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                >
                  <Brain className="w-5 h-5" />
                  Let AI Create Your Ads
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </section>

          {/* ============================================ */}
          {/* AI PERFORMANCE CHARTS SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0">
              <div className="absolute w-[500px] h-[500px] top-0 left-1/4 bg-purple-600/10 rounded-full blur-[150px]"></div>
              <div className="absolute w-[500px] h-[500px] bottom-0 right-1/4 bg-blue-600/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/10 border border-green-500/20 rounded-full mb-6">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Real-Time Analytics</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                  See the AI Difference
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Watch how our AI outperforms manual campaign management with real-time optimization
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1 - AI vs Manual Performance */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Performance Comparison</h3>
                      <p className="text-gray-400 text-sm">AI vs Manual Campaign Management</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-xs text-gray-400">AI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-xs text-gray-400">Manual</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={aiPerformanceData}>
                      <defs>
                        <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          color: '#fff'
                        }} 
                      />
                      <Area type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAi)" />
                      <Area type="monotone" dataKey="manual" stroke="#6b7280" strokeWidth={2} fillOpacity={1} fill="url(#colorManual)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-semibold">+180% Better Performance with AI</span>
                  </div>
                </motion.div>

                {/* Chart 2 - Cost Reduction */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Cost Optimization</h3>
                      <p className="text-gray-400 text-sm">CPA Reduction Over Time</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 rounded-full">
                      <span className="text-green-400 text-sm font-semibold">-50% CPA</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={aiPerformanceData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '12px',
                          color: '#fff'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#ef4444" 
                        strokeWidth={3}
                        dot={{ fill: '#ef4444', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#ef4444' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-white">$120</p>
                      <p className="text-xs text-gray-400">Starting CPA</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">$60</p>
                      <p className="text-xs text-gray-400">Current CPA</p>
                    </div>
                    <div className="text-center p-3 bg-green-500/20 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">50%</p>
                      <p className="text-xs text-gray-400">Savings</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* TESTIMONIALS SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  What Our Clients Say
                </h2>
                <p className="text-xl text-gray-400">
                  Thousands of companies trust our platform to manage their ad campaigns
                </p>
              </motion.div>

              <AnimatedTestimonials
                data={testimonials}
                className="w-full"
                cardClassName="bg-gray-800/50 backdrop-blur-sm border-gray-700"
              />
            </div>
          </section>

          {/* ============================================ */}
          {/* PRICING SECTION with Toggle */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute w-[600px] h-[600px] top-0 right-0 bg-purple-600/10 rounded-full blur-[150px]"></div>
              <div className="absolute w-[600px] h-[600px] bottom-0 left-0 bg-blue-600/10 rounded-full blur-[150px]"></div>
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Simple Pricing</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Choose Your Plan
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Two simple options to get started with AI-powered advertising
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
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Plan 1 - Client Account Management */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">Manage Your Account</h3>
                    <p className="text-gray-400">For businesses with existing Google Ads accounts</p>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">
                      ${billingCycle === 'monthly' ? pricing.monthly.basic : pricing.yearly.basic}
                    </span>
                    <span className="text-gray-400">/month</span>
                    {billingCycle === 'yearly' && (
                      <p className="text-green-400 text-sm mt-1">Billed annually (Save $240/year)</p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Full AI Campaign Management",
                      "Real-time Optimization",
                      "Advanced Analytics Dashboard",
                      "A/B Testing Automation",
                      "Keyword Research Tools",
                      "Email Support"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/authentication/sign-up"
                    className="block w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold text-center transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </motion.div>

                {/* Plan 2 - Work on Our Accounts (Highlighted) */}
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="relative"
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 rounded-3xl blur-sm opacity-75 animate-pulse"></div>
                  
                  <div className="relative bg-gray-900 rounded-3xl p-8 border border-purple-500/50">
                    {/* Popular Badge */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>

                    <div className="mb-6 mt-2">
                      <h3 className="text-2xl font-bold text-white mb-2">Work on Our Accounts</h3>
                      <p className="text-gray-400">Premium verified ad accounts with no suspensions</p>
                    </div>
                    
                    <div className="mb-6">
                      <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ${billingCycle === 'monthly' ? pricing.monthly.premium : pricing.yearly.premium}
                      </span>
                      <span className="text-gray-400">/month</span>
                      {billingCycle === 'yearly' && (
                        <p className="text-green-400 text-sm mt-1">Billed annually (Save $480/year)</p>
                      )}
                    </div>

                    <ul className="space-y-4 mb-8">
                      {[
                        "Everything in Basic Plan",
                        "Verified Ad Accounts",
                        "No Suspension Risk",
                        "Instant Account Setup",
                        "Priority 24/7 Support",
                        "Dedicated Account Manager",
                        "Unlimited Campaigns"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/authentication/sign-up"
                      className="block w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold text-center transition-all duration-200 shadow-lg shadow-purple-500/50"
                    >
                      Start Premium
                    </Link>

                    {/* Money-back Guarantee */}
                    <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                      <Shield className="w-4 h-4" />
                      30-day money-back guarantee
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* GLOBE SECTION - Global Reach */}
          {/* ============================================ */}
          <GlobeSection />

          {/* ============================================ */}
          {/* FAQ SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-3xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">FAQ</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-gray-400">
                  Got questions? We've got answers
                </p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-4"
              >
                {faqData.map((faq, index) => (
                  <motion.div key={index} variants={fadeInUp}>
                    <FAQItem
                      question={faq.question}
                      answer={faq.answer}
                      isOpen={openFAQ === index}
                      onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ============================================ */}
          {/* FINAL CTA SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-4xl text-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12"
              >
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-purple-400" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Ready to Transform Your Campaigns?
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Join thousands of businesses that trust our platform to manage their ad campaigns
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/authentication/sign-up"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 hover:scale-105"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/front-pages/contact"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold transition-all duration-200"
                  >
                    <Phone className="w-5 h-5" />
                    Contact Sales
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
        
        {/* Floating Chat Widget */}
        <FloatingChatWidget />

        {/* Animated Notifications - Shows AI activity (Slow with auto-dismiss) */}
        <AnimatedNotification
          autoGenerate={true}
          maxNotifications={1}
          autoInterval={20000}
          autoDismissTimeout={8000}
          animationDuration={1000}
          variant="glass"
          position="bottom-left"
          showAvatars={true}
          allowDismiss={true}
          customMessages={[
            "Campaign optimized! ROI +45% 📈",
            "AI adjusted bidding strategy 🤖",
            "Budget allocation optimized 💰",
            "Performance report ready 📊",
            "Quality score improved! ⭐"
          ]}
        />
      </div>
    </>
  );
}
