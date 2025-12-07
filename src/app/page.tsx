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
                  Start Free Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Link>
              </motion.div>
            </motion.div>
          </section>

          {/* ============================================ */}
          {/* STATS SECTION with Counter Animation */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      <CountUp 
                        value={stat.number} 
                        duration={2.5} 
                        suffix={stat.suffix}
                        className="text-4xl font-bold"
                        colorScheme="gradient"
                      />
                    </div>
                    <div className="text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
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
          {/* HOW IT WORKS SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/10 rounded-full blur-[200px]"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-6">
                  <Wand2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Simple Process</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-xl text-gray-400">
                  Three simple steps to launch your AI-powered campaigns
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connection Lines */}
                <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-blue-600/50 -translate-y-1/2"></div>

                {howItWorks.map((item, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 text-center group">
                      {/* Step Number */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {item.step}
                        </div>
                      </div>

                      {/* Icon */}
                      <motion.div 
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl mb-6 text-purple-400 mx-auto"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.div>

                      <h3 className="text-2xl font-bold mb-3 text-white">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
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
          {/* BEFORE & AFTER COMPARISON SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-4xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Before & After
                </h2>
                <p className="text-xl text-gray-400">
                  Real results from businesses using our AI platform
                </p>
              </motion.div>

              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
                className="space-y-4"
              >
                {beforeAfterData.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="grid grid-cols-4 gap-4 items-center">
                      <div className="col-span-1">
                        <p className="text-gray-400 text-sm mb-1">Metric</p>
                        <p className="text-white font-semibold">{item.metric}</p>
                      </div>
                      <div className="col-span-1 text-center">
                        <p className="text-gray-400 text-sm mb-1">Before</p>
                        <div className="flex items-center justify-center gap-2">
                          <ArrowDownRight className="w-4 h-4 text-red-400" />
                          <p className="text-red-400 font-bold text-xl">{item.before}</p>
                        </div>
                      </div>
                      <div className="col-span-1 text-center">
                        <p className="text-gray-400 text-sm mb-1">After</p>
                        <div className="flex items-center justify-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-green-400" />
                          <p className="text-green-400 font-bold text-xl">{item.after}</p>
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-gray-400 text-sm mb-1">Improvement</p>
                        <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-bold">
                          {item.improvement}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ============================================ */}
          {/* DASHBOARD SHOWCASE - 3D Effect */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0">
              <div className="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/20 rounded-full blur-[200px]"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
                  <LayoutDashboard className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Powerful Interface</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Powerful Dashboard
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Everything you need to manage your campaigns in one beautiful interface
                </p>
              </motion.div>

              {/* 3D Dashboard Image */}
              <motion.div 
                initial={{ opacity: 0, y: 100, rotateX: 25 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 5 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative mx-auto max-w-5xl"
                style={{ perspective: "1000px" }}
              >
                {/* Glow Effect Behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/40 via-blue-600/40 to-purple-600/40 rounded-3xl blur-2xl opacity-60"></div>
                
                {/* Dashboard Container */}
                <div 
                  className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-3xl p-2 border border-white/20 shadow-2xl"
                  style={{ 
                    transform: "perspective(1000px) rotateX(5deg)",
                    transformStyle: "preserve-3d"
                  }}
                >
                  {/* Browser Bar */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-900/80 rounded-t-2xl border-b border-white/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-800 rounded-lg px-4 py-1.5 text-sm text-gray-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>app.furriyadh.com/dashboard</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Image */}
                  <div className="relative overflow-hidden rounded-b-2xl">
                    <Image
                      src="/images/front-pages/dashboard.png"
                      alt="Furriyadh Dashboard"
                      width={1200}
                      height={700}
                      className="w-full h-auto"
                      priority
                    />
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* Floating Feature Cards */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -left-4 top-1/4 bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl hidden lg:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">+156%</p>
                      <p className="text-xs text-gray-400">Conversions</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute -right-4 top-1/3 bg-gray-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-xl hidden lg:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">AI Active</p>
                      <p className="text-xs text-gray-400">Optimizing 24/7</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* ============================================ */}
          {/* CAMPAIGN TYPES SECTION - Google Ads Style */}
          {/* ============================================ */}
          <section className="py-24 px-4 border-t border-white/10 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">AI-Powered Campaign Types</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                    Multiple Ways to Showcase
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Your Business
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Our AI platform supports all Google Ads campaign types, automatically optimizing each for maximum ROI
                </p>
              </motion.div>

              {/* Campaign Types Interactive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Side - Campaign Selector */}
                <div className="lg:col-span-4 space-y-4">
                  {[
                    { 
                      id: 'search', 
                      icon: <Target className="w-5 h-5" />, 
                      title: 'Search Campaigns',
                      desc: 'Reach customers actively searching for your products',
                      color: 'from-blue-500 to-cyan-500',
                      stats: '+340% CTR'
                    },
                    { 
                      id: 'display', 
                      icon: <PieChartIcon className="w-5 h-5" />, 
                      title: 'Display Network',
                      desc: 'Visual ads across millions of websites',
                      color: 'from-purple-500 to-pink-500',
                      stats: '+280% Reach'
                    },
                    { 
                      id: 'shopping', 
                      icon: <BarChart3 className="w-5 h-5" />, 
                      title: 'Shopping Campaigns',
                      desc: 'Showcase your products with rich visuals',
                      color: 'from-green-500 to-emerald-500',
                      stats: '+420% Sales'
                    },
                    { 
                      id: 'video', 
                      icon: <Play className="w-5 h-5" />, 
                      title: 'Video Campaigns',
                      desc: 'Engage audiences on YouTube',
                      color: 'from-red-500 to-orange-500',
                      stats: '+190% Views'
                    },
                    { 
                      id: 'app', 
                      icon: <Rocket className="w-5 h-5" />, 
                      title: 'App Campaigns',
                      desc: 'Drive app installs and engagement',
                      color: 'from-indigo-500 to-violet-500',
                      stats: '+560% Installs'
                    },
                  ].map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${campaign.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500 blur-xl`}></div>
                      <div className="relative bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl p-5 cursor-pointer transition-all duration-300 group-hover:scale-[1.02]">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${campaign.color} flex items-center justify-center text-white shadow-lg`}>
                            {campaign.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
                              {campaign.title}
                            </h3>
                            <p className="text-gray-400 text-sm">{campaign.desc}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 bg-gradient-to-r ${campaign.color} bg-opacity-20 rounded-full text-xs font-bold text-white`}>
                              {campaign.stats}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Right Side - Visual Preview */}
                <div className="lg:col-span-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {/* Main Preview Card */}
                    <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 rounded-3xl p-8 border border-white/10 shadow-2xl">
                      {/* AI Status Bar */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                          </div>
                          <span className="text-green-400 text-sm font-medium">AI Actively Optimizing</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-300 text-sm">Neural Engine v3.0</span>
                        </div>
                      </div>

                      {/* Campaign Performance Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                          { label: 'Active Campaigns', value: '24', change: '+8', color: 'text-blue-400' },
                          { label: 'Total Impressions', value: '2.4M', change: '+156%', color: 'text-green-400' },
                          { label: 'Conversions', value: '12,847', change: '+89%', color: 'text-purple-400' },
                          { label: 'ROAS', value: '4.8x', change: '+2.1x', color: 'text-yellow-400' },
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="bg-white/5 rounded-2xl p-4 border border-white/5"
                          >
                            <p className="text-gray-400 text-xs mb-2">{stat.label}</p>
                            <p className="text-white text-2xl font-bold">{stat.value}</p>
                            <p className={`text-xs ${stat.color} mt-1`}>{stat.change}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* AI Optimization Preview */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Cpu className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-2">Real-Time AI Optimization</h4>
                            <p className="text-gray-400 text-sm mb-4">
                              Our AI analyzes 50+ signals per second to optimize your campaigns automatically
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {['Bid Adjustment', 'Audience Targeting', 'Ad Scheduling', 'Budget Allocation'].map((tag, i) => (
                                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                      className="absolute -bottom-6 -left-6 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-green-500/30 shadow-xl hidden md:block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold">$2.4M</p>
                          <p className="text-xs text-gray-400">Revenue Generated</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 }}
                      className="absolute -top-4 -right-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-4 border border-purple-500/30 shadow-xl hidden md:block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-bold">50ms</p>
                          <p className="text-xs text-gray-400">Optimization Speed</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <Link
                  href="/authentication/sign-up"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5" />
                  Start AI-Powered Campaigns
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
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
          {/* GLOBE SECTION - Global Reach */}
          {/* ============================================ */}
          <GlobeSection />

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
          {/* LASER FLOW SECTION - Visual Effect */}
          {/* ============================================ */}
          <section className="relative py-32 px-4 border-t border-white/10 overflow-hidden">
            {/* LaserFlow Background */}
            <div className="absolute inset-0 z-0">
              <LaserFlow
                color="#8B5CF6"
                horizontalBeamOffset={0.0}
                verticalBeamOffset={-0.1}
                verticalSizing={2.5}
                horizontalSizing={0.6}
                fogIntensity={0.5}
                wispIntensity={4}
              />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Powered by Advanced AI
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Our cutting-edge artificial intelligence analyzes millions of data points to optimize your campaigns in real-time
                </p>
                
                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {[
                    { icon: <Brain className="w-8 h-8" />, title: "Neural Networks", desc: "Deep learning models trained on billions of ad interactions" },
                    { icon: <Zap className="w-8 h-8" />, title: "Real-time Processing", desc: "Instant optimization decisions every millisecond" },
                    { icon: <Target className="w-8 h-8" />, title: "Predictive Targeting", desc: "AI predicts user behavior before they act" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20"
                    >
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-purple-600/20 rounded-xl mb-4 text-purple-400">
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

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
          {/* NEWSLETTER SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 border-t border-white/10">
            <div className="container mx-auto max-w-2xl">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 text-center"
              >
                <Mail className="w-12 h-12 mx-auto mb-6 text-purple-400" />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                  Get Weekly AI Marketing Tips
                </h3>
                <p className="text-gray-400 mb-8">
                  Join 10,000+ marketers getting actionable insights every week
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-4">
                  No spam. Unsubscribe anytime.
                </p>
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
