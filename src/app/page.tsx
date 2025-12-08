"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Footer from "@/components/FrontPage/Footer";
import Navbar from "@/components/FrontPage/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { 
  Plus, ChevronDown, Mic, ArrowUp, Sparkles, TrendingUp, Target, Zap, 
  BarChart3, Users, Globe, CheckCircle, ArrowRight, Brain, Rocket, Shield,
  Play, Star, Check, Crown, Cpu, LineChart as LineChartIcon, PieChart as PieChartIcon,
  MessageCircle, X, Send, ChevronUp, Wand2, MousePointer, LayoutDashboard,
  ArrowDownRight, ArrowUpRight, Mail, Phone, HelpCircle, Layers
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
import ModernLoader from "@/components/ui/modern-loader";
import { MotionGrid } from "@/components/ui/motion-grid";
import ElectroBorder from "@/components/ui/electro-border";
import dynamic from "next/dynamic";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";

// Dynamic imports to avoid SSR issues
const LaserFlow = dynamic(() => import("@/components/ui/laser-flow"), { ssr: false });
const CircularGallery = dynamic(() => import("@/components/ui/CircularGallery"), { ssr: false });

// Animation variants - Ultra light for performance
const fadeInUp = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 }
};

const scaleIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } }
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

// Fixed pricing in USD only
const PRICING = {
  single: 30,           // $30/month for single account
  multiple: 100,        // $100/month for multiple accounts
  singleYearly: 24,     // $24/month (20% discount)
  multipleYearly: 80,   // $80/month (20% discount)
};

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


// Live AI Stats Component - Static for better performance
const LiveAIStats = () => {
  const stats = {
    campaigns: "10,247+",
    savings: "$2.8M",
    ctrImprovement: "+342%",
    activeOptimizations: "1,847"
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {[
        { value: stats.campaigns, label: "Campaigns Optimized", icon: <Rocket className="w-4 h-4" />, color: "from-green-500 to-emerald-500" },
        { value: stats.savings, label: "Budget Saved", icon: <TrendingUp className="w-4 h-4" />, color: "from-blue-500 to-cyan-500" },
        { value: stats.ctrImprovement, label: "Avg CTR Boost", icon: <Target className="w-4 h-4" />, color: "from-purple-500 to-pink-500" },
        { value: stats.activeOptimizations, label: "Live Optimizations", icon: <Zap className="w-4 h-4" />, color: "from-orange-500 to-red-500" },
      ].map((stat, i) => (
        <div
          key={i}
          className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 md:p-4 overflow-hidden group hover:bg-white/10 transition-colors"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
          <div className="relative z-10">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} text-white mb-2`}>
              {stat.icon}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-bold text-white">{stat.value}</span>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        </div>
      ))}
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
            <div className="p-4 ">
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

// Progress Bar Component
const ScrollProgressBar = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    
    const updateProgress = () => {
      if (progressRef.current) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressRef.current.style.width = `${progress}%`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateProgress(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1.5 bg-black/20 backdrop-blur-sm">
      <div 
        ref={progressRef}
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-50% to-cyan-400 relative will-change-[width]"
        style={{ 
          width: '0%',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 0 40px rgba(236, 72, 153, 0.6), 0 0 60px rgba(34, 211, 238, 0.4)'
        }}
      >
        {/* Glow tip */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-sm" />
      </div>
    </div>
  );
};

// Back to Top Button Component
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-purple-500/40"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
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

  // Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

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
      title: "Advanced AI for Google Ads",
      description: "We use the latest AI models to create and optimize highly effective Google Ads campaigns"
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Precise Audience Targeting",
      description: "Identify your ideal audience with high accuracy using advanced Google Ads analytics"
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Comprehensive Campaign Analytics",
      description: "Detailed reports and real-time analytics for your Google Ads campaign performance"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Auto Campaign Optimization",
      description: "AI automatically optimizes your Google Ads campaigns for best ROAS and lower CPC"
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: "All Google Ads Types",
      description: "Support Search, Display, Shopping, Video, and Performance Max campaigns worldwide"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Secure Ad Account Management",
      description: "Your Google Ads accounts are protected with the highest global security standards"
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

  // Pricing is fixed in USD

  return (
    <>
      {/* Progress Bar */}
      <ScrollProgressBar />
      
      {/* Back to Top Button */}
      <BackToTopButton />
      
      <div className="front-page-body overflow-hidden bg-black min-h-screen text-white relative" dir="ltr">
        {/* Global Motion Grid Background */}
        <div className="fixed inset-0 z-0">
          <MotionGrid
            speed="3s"
            opacity={0.15}
            enableGlow={true}
            lineColor="147, 51, 234"
            backgroundColor="#000000"
            gridSpacing="20px"
            className="w-full h-full"
          />
            </div>
        
        <Navbar />
        
        <main className="min-h-screen bg-transparent text-white relative z-10">
          {/* ============================================ */}
          {/* HERO SECTION - AI Chat Interface */}
          {/* ============================================ */}
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

              {/* Trust Badge - Immediately after chat */}
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

          {/* ============================================ */}
          {/* PARTNERS SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                  Trusted by Industry Leaders
                </h2>
                <p className="text-lg text-gray-400 hover:text-gray-300 transition-colors">
                  Leading companies use our platform to achieve their advertising goals
                </p>
              </div>

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
          {/* AI vs COMPETITORS COMPARISON SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-5xl relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm font-medium">Compare Your Options</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Furriyadh AI for Google Ads</span>?
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  See how our AI‑powered Google Ads management platform compares to agencies and freelancers
                </p>
              </div>

              {/* Comparison Table - 3 Columns (without DIY) */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4 p-4 md:p-6 border-b border-white/10 bg-white/5">
                  <div className="text-gray-400 text-xs md:text-sm font-medium">Metric</div>
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-orange-400 text-[10px] md:text-xs">Freelancer</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Globe className="w-4 h-4 text-purple-400" />
                      </div>
                      <span className="text-purple-400 text-[10px] md:text-xs">Agency</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-green-400 text-[10px] md:text-xs font-semibold">Furriyadh AI</span>
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
                    className="grid grid-cols-4 gap-4 p-4 md:p-5 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="text-white font-medium text-xs md:text-sm">{row.metric}</div>
                    <div className={`text-center text-xs md:text-sm ${row.freelancerColor}`}>{row.freelancer}</div>
                    <div className={`text-center text-xs md:text-sm ${row.agencyColor}`}>{row.agency}</div>
                    <div className={`text-center text-xs md:text-sm font-semibold ${row.aiColor}`}>{row.ai}</div>
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
                    <Link href="/auth/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Try Furriyadh AI Free
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* AI-POWERED AD EXAMPLES - Ultimate Showcase */}
          {/* ============================================ */}
          <section className="py-24 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
              {/* Header with AI Animation */}
              <div className="text-center mb-16">
                {/* AI Status Badge - Enhanced */}
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-cyan-600/20 border border-green-500/30 rounded-full mb-8 backdrop-blur-xl shadow-lg shadow-green-500/20">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-300 font-bold text-sm">AI Engine Active</p>
                    <p className="text-green-400/60 text-xs">Processing 2,847 campaigns</p>
                  </div>
                  <div className="h-8 w-px bg-green-500/30"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs font-mono">LIVE</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  </div>
                  
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                  <span className="text-white">Watch AI Create </span>
                  <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Winning Campaigns
                  </span>
                  </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
                  See our AI analyze, create, and optimize ads in real-time. From competitor analysis to launch in seconds.
                  </p>
                  
                {/* AI Capabilities - Enhanced Pills */}
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { icon: <Wand2 className="w-4 h-4" />, text: "Auto Copy Generation", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30" },
                    { icon: <Target className="w-4 h-4" />, text: "Smart Audience AI", color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30" },
                    { icon: <Zap className="w-4 h-4" />, text: "Real-time Bidding", color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" },
                    { icon: <BarChart3 className="w-4 h-4" />, text: "Predictive Analytics", color: "from-green-500/20 to-emerald-500/20 border-green-500/30" },
                    { icon: <Brain className="w-4 h-4" />, text: "Neural Optimization", color: "from-pink-500/20 to-red-500/20 border-pink-500/30" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${item.color} border rounded-full text-sm text-white/90 backdrop-blur-sm cursor-default hover:scale-105 transition-transform`}
                    >
                      {item.icon}
                      {item.text}
                    </div>
                  ))}
                      </div>
                    </div>
                    
              {/* Main Content - AI Campaign Generator - Centered */}
              <div className="flex justify-center items-center w-full">
                <div className="w-full max-w-2xl mx-auto px-4">
                  {/* Modern AI Loader Card */}
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-cyan-600/20 rounded-3xl blur-xl"></div>
                    
                    {/* Modern Loader Container */}
                    <div className="relative bg-gray-950/90 backdrop-blur-xl rounded-3xl border border-green-500/30 overflow-hidden shadow-2xl shadow-green-500/20">
                      <ModernLoader 
                        words={[
                          "Analyzing competitor ads...",
                          "Generating AI headlines...",
                          "Optimizing bid strategy...",
                          "Predicting CTR scores...",
                          "Creating ad variations...",
                          "Targeting ideal audience...",
                          "Calculating optimal budget...",
                          "Refining ad copy...",
                          "Building campaign structure...",
                          "Maximizing ROAS potential...",
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Circular Gallery - AI Generated Ads Showcase */}
              <div className="mt-12 md:mt-20 relative">
                {/* Section Header */}
                <div className="text-center mb-6 md:mb-12">
                  <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full mb-4 md:mb-6">
                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    <span className="text-purple-300 text-sm md:text-base font-medium">AI-Generated Ad Gallery</span>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4">
                    Explore All Ad Types
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto px-4">
                    Drag to explore our AI-generated campaigns across Search, Display, Shopping, Video, and more
                  </p>
                </div>

                {/* Circular Gallery - Responsive */}
                <div className="h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] xl:h-[600px] relative">
                  <CircularGallery
                    items={[
                      { image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600", text: "Search Ads" },
                      { image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600", text: "Display Ads" },
                      { image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600", text: "Shopping Ads" },
                      { image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600", text: "Video Ads" },
                      { image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600", text: "App Campaigns" },
                      { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600", text: "Performance Max" },
                      { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600", text: "Smart Campaigns" },
                      { image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=600", text: "Discovery Ads" },
                    ]}
                    bend={3}
                    textColor="#ffffff"
                    borderRadius={0.05}
                    scrollSpeed={2}
                    scrollEase={0.02}
                  />
                </div>
              </div>

              {/* Bottom CTA - Enhanced */}
              <div className="text-center mt-12">
                <div className="inline-block">
                  <Link
                    href="/authentication/sign-up"
                    className="group relative inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 overflow-hidden"
                  >
                    <Brain className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Start Creating AI-Powered Ads</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                  </Link>
                </div>
                <p className="text-gray-500 mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    14-day free trial
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Cancel anytime
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* AI PERFORMANCE CHARTS SECTION - Enhanced */}
          {/* ============================================ */}
          <section className="py-24 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
              {/* Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full mb-8 shadow-lg shadow-green-500/20">
                  <div className="relative">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-green-300 font-medium">Live Performance Data</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="text-white">See the </span>
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Difference
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Real results from businesses using our AI platform - updated in real-time
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  { value: "+340%", label: "Avg. CTR Increase", color: "text-green-400", bg: "from-green-600/20" },
                  { value: "-65%", label: "CPA Reduction", color: "text-blue-400", bg: "from-blue-600/20" },
                  { value: "4.8x", label: "ROAS Improvement", color: "text-purple-400", bg: "from-purple-600/20" },
                  { value: "24/7", label: "AI Optimization", color: "text-cyan-400", bg: "from-cyan-600/20" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${stat.bg} to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all`}
                  >
                    <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                ))}
                  </div>
                  
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1 - AI vs Manual Performance */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Performance Comparison</h3>
                        <p className="text-gray-400 text-xs">AI vs Manual Management</p>
                    </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                        <span className="text-xs text-gray-400">AI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="text-xs text-gray-400">Manual</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={aiPerformanceData}>
                      <defs>
                        <linearGradient id="colorAi2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorManual2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #8b5cf6',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 10px 40px rgba(139, 92, 246, 0.3)'
                        }} 
                      />
                      <Area type="monotone" dataKey="ai" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAi2)" />
                      <Area type="monotone" dataKey="manual" stroke="#6b7280" strokeWidth={2} fillOpacity={1} fill="url(#colorManual2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">+180% Better Performance with AI</span>
                  </div>
                </div>

                {/* Chart 2 - Cost Reduction */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-600/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-400" />
                  </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Cost Optimization</h3>
                        <p className="text-gray-400 text-xs">CPA Reduction Over Time</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                      <span className="text-green-400 text-sm font-bold">-50% CPA</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={aiPerformanceData}>
                      <defs>
                        <linearGradient id="colorCost2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0.2}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                      <YAxis stroke="#9ca3af" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #22c55e',
                          borderRadius: '12px',
                          color: '#fff',
                          boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 8, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-2xl font-bold text-red-400">$120</p>
                      <p className="text-xs text-gray-400 mt-1">Starting CPA</p>
                      </div>
                    <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">$60</p>
                      <p className="text-xs text-gray-400 mt-1">Current CPA</p>
                      </div>
                    <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                      <p className="text-2xl font-bold text-green-400">50%</p>
                      <p className="text-xs text-gray-400 mt-1">Savings</p>
                    </div>
                  </div>
                      </div>
                    </div>
                    
              {/* Bottom Insight */}
              <div className="mt-12 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                      </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">AI Optimization Running</h3>
                      <p className="text-gray-400">Our AI has made <span className="text-green-400 font-semibold">2,847 optimizations</span> in the last 24 hours</p>
                      </div>
                    </div>
                  <Link
                    href="/authentication/sign-up"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  >
                    Get These Results
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* TESTIMONIALS SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  What Our Clients Say About Google Ads Management
                </h2>
                <p className="text-xl text-gray-400">
                  Thousands of companies trust our platform to manage their Google Ads campaigns and increase conversions
                </p>
                      </div>

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
          <section className="py-20 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-5xl relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full mb-6">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300">Simple Pricing</span>
                  </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Choose Your Google Ads Management Plan
                </h2>
                <p className="text-xl text-gray-400 mb-8">
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
                  
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Plan 1 - Manage Client Accounts with ElectroBorder */}
                <ElectroBorder
                  borderColor="#10b981"
                  borderWidth={2}
                  radius="1.5rem"
                  distortion={0.5}
                  animationSpeed={0.6}
                  glow={true}
                  aura={true}
                  glowBlur={25}
                >
                  <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 h-full">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs font-medium">Your Accounts</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Manage Client Accounts</h3>
                      <p className="text-gray-400 text-sm">AI management for your existing Google Ads accounts</p>
                    </div>
                    
                    {/* Pricing Options - USD Only */}
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

                {/* Plan 2 - Work on Our Accounts with ElectroBorder */}
                <ElectroBorder
                  borderColor="#a855f7"
                  borderWidth={2}
                  radius="1.5rem"
                  distortion={0.8}
                  animationSpeed={0.8}
                  glow={true}
                  aura={true}
                  glowBlur={35}
                >
                  <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 h-full relative">
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

          {/* ============================================ */}
          {/* GLOBE SECTION - Global Reach */}
          {/* ============================================ */}
          <GlobeSection />

          {/* ============================================ */}
          {/* FAQ SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-3xl">
              <div className="text-center mb-12">
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

          {/* ============================================ */}
          {/* FINAL CTA SECTION */}
          {/* ============================================ */}
          <section className="py-20 px-4 relative overflow-hidden">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
                <Sparkles className="w-16 h-16 mx-auto mb-6 text-purple-400" />
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Ready to Transform Your Google Ads Campaigns?
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Join thousands of businesses that trust our platform to manage and optimize their Google Ads campaigns. Start your free trial today and see the difference AI makes.
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
                
                {/* SEO-rich paragraph */}
                <p className="mt-8 text-sm text-gray-500 max-w-3xl mx-auto leading-relaxed">
                  Furriyadh is a specialized Google Ads (Google AdWords) management platform that helps businesses worldwide run high‑performance Search, Display, Video, Shopping, and Performance Max campaigns. Our AI‑powered tools handle keyword research, ad copywriting, bid optimization, and continuous campaign improvement to maximize your ROAS and minimize cost per click.
                </p>
              </div>
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
