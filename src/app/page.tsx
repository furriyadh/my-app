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
import dynamic from "next/dynamic";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip
} from "recharts";

// Dynamic imports to avoid SSR issues
const LaserFlow = dynamic(() => import("@/components/ui/laser-flow"), { ssr: false });
const ThreeDCarousel = dynamic(() => import("@/components/ui/3d-carousel"), { ssr: false });

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

// Floating Particles Component - Fixed for SSR
const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    scale: number;
    animateY: number;
    duration: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    // Generate particles only on client side
    const newParticles = [...Array(50)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * 800,
      scale: Math.random() * 0.5 + 0.5,
      animateY: Math.random() * -200 - 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: particle.scale,
          }}
          animate={{
            y: [null, particle.animateY],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay,
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
          {/* FEATURES SECTION - Ultimate AI Showcase */}
          {/* ============================================ */}
          <section className="py-24 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black"></div>
            <div className="absolute inset-0">
              <div className="absolute w-[800px] h-[800px] top-0 right-0 bg-purple-600/10 rounded-full blur-[200px] animate-pulse"></div>
              <div className="absolute w-[600px] h-[600px] bottom-0 left-0 bg-blue-600/10 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }}></div>
              {/* Floating Particles - Fixed positions */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
                    style={{
                      left: `${(i * 5) % 100}%`,
                      top: `${(i * 7) % 100}%`,
                    }}
                    animate={{
                      y: [0, -100, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
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
                <motion.div 
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 border border-purple-500/30 rounded-full mb-8"
                  animate={{ boxShadow: ['0 0 20px rgba(139, 92, 246, 0.2)', '0 0 40px rgba(139, 92, 246, 0.4)', '0 0 20px rgba(139, 92, 246, 0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <Cpu className="w-5 h-5 text-purple-400" />
                    <motion.div 
                      className="absolute inset-0 bg-purple-400 rounded-full blur-sm"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <span className="text-purple-300 font-medium">Next-Gen AI Technology</span>
                </motion.div>

                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="text-white">Why Choose </span>
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Our Platform?
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  The most advanced AI-powered advertising platform trusted by 10,000+ businesses worldwide
                </p>
              </motion.div>

              {/* Main Feature - AI Brain Visualization */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <div className="bg-gradient-to-br from-purple-900/40 via-gray-900 to-blue-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-purple-500/20 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-500">
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.4) 1px, transparent 0)`,
                      backgroundSize: '32px 32px'
                    }}></div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full blur-[150px] group-hover:scale-110 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left - AI Brain Animation */}
                    <div className="relative">
                      <div className="relative w-full aspect-square max-w-md mx-auto">
                        {/* Central Brain */}
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-48 h-48 rounded-full border border-purple-500/30 border-dashed"></div>
                        </motion.div>
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-64 h-64 rounded-full border border-blue-500/20 border-dashed"></div>
                        </motion.div>
                        <motion.div 
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="w-80 h-80 rounded-full border border-cyan-500/10 border-dashed"></div>
                        </motion.div>
                        
                        {/* Center Brain Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div 
                            className="w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50"
                            animate={{ 
                              boxShadow: ['0 0 40px rgba(139, 92, 246, 0.5)', '0 0 80px rgba(139, 92, 246, 0.8)', '0 0 40px rgba(139, 92, 246, 0.5)']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Brain className="w-16 h-16 text-white" />
                          </motion.div>
                        </div>

                        {/* Orbiting Features */}
                        {[
                          { icon: <Target className="w-5 h-5" />, label: "Targeting", angle: 0, color: "from-blue-500 to-cyan-500" },
                          { icon: <TrendingUp className="w-5 h-5" />, label: "Growth", angle: 60, color: "from-green-500 to-emerald-500" },
                          { icon: <Zap className="w-5 h-5" />, label: "Speed", angle: 120, color: "from-yellow-500 to-orange-500" },
                          { icon: <Shield className="w-5 h-5" />, label: "Security", angle: 180, color: "from-cyan-500 to-blue-500" },
                          { icon: <BarChart3 className="w-5 h-5" />, label: "Analytics", angle: 240, color: "from-purple-500 to-pink-500" },
                          { icon: <Sparkles className="w-5 h-5" />, label: "AI Magic", angle: 300, color: "from-pink-500 to-red-500" },
                        ].map((item, i) => (
                          <motion.div
                            key={i}
                            className="absolute"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: `rotate(${item.angle}deg) translateX(140px) rotate(-${item.angle}deg)`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                          >
                            <motion.div 
                              className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg -ml-7 -mt-7`}
                              whileHover={{ scale: 1.2 }}
                              animate={{ y: [0, -5, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            >
                              {item.icon}
                            </motion.div>
                          </motion.div>
                        ))}

                        {/* Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                            const rad = (angle * Math.PI) / 180;
                            const x2 = 200 + Math.cos(rad) * 140;
                            const y2 = 200 + Math.sin(rad) * 140;
                            return (
                              <motion.line
                                key={i}
                                x1="200"
                                y1="200"
                                x2={x2}
                                y2={y2}
                                stroke="url(#lineGradient)"
                                strokeWidth="1"
                                strokeDasharray="5,5"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: 0.1 * i }}
                              />
                            );
                          })}
                          <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.5)" />
                              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>

                    {/* Right - Features List */}
                    <div className="space-y-6">
                      <div>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium">Core AI Engine</span>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
                          Neural Network Optimization
                        </h3>
                        <p className="text-gray-400 text-lg">
                          Our proprietary AI analyzes billions of data points across thousands of campaigns to deliver unprecedented optimization results.
                        </p>
                      </div>

                      {/* Feature Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: "2.5B+", label: "Data Points Analyzed Daily", icon: <BarChart3 className="w-5 h-5" /> },
                          { value: "50ms", label: "Real-time Optimization", icon: <Zap className="w-5 h-5" /> },
                          { value: "99.9%", label: "Uptime Guarantee", icon: <Shield className="w-5 h-5" /> },
                          { value: "24/7", label: "Autonomous Operation", icon: <Brain className="w-5 h-5" /> },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * i }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                          >
                            <div className="text-purple-400 mb-2">{stat.icon}</div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-gray-400">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>

                      {/* AI Capabilities */}
                      <div className="flex flex-wrap gap-2">
                        {['Auto Bidding', 'Smart Targeting', 'A/B Testing', 'Budget Allocation', 'Keyword Discovery', 'Ad Copy Generation'].map((tag, i) => (
                          <motion.span 
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.05 * i }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-sm text-gray-300 hover:border-purple-500/40 transition-colors cursor-default"
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Secondary Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    icon: <TrendingUp className="w-7 h-7" />, 
                    title: "Real-Time Analytics", 
                    desc: "Live dashboards with instant performance insights",
                    stat: "Live",
                    statColor: "text-green-400",
                    gradient: "from-green-600 to-emerald-600",
                    border: "border-green-500/20 hover:border-green-500/40"
                  },
                  { 
                    icon: <Target className="w-7 h-7" />, 
                    title: "Smart Targeting", 
                    desc: "AI identifies your ideal audience automatically",
                    stat: "98%",
                    statColor: "text-blue-400",
                    gradient: "from-blue-600 to-cyan-600",
                    border: "border-blue-500/20 hover:border-blue-500/40"
                  },
                  { 
                    icon: <Zap className="w-7 h-7" />, 
                    title: "Instant Setup", 
                    desc: "Connect and start optimizing in minutes",
                    stat: "5 min",
                    statColor: "text-orange-400",
                    gradient: "from-orange-600 to-red-600",
                    border: "border-orange-500/20 hover:border-orange-500/40"
                  },
                  { 
                    icon: <Shield className="w-7 h-7" />, 
                    title: "Enterprise Security", 
                    desc: "Bank-level encryption & SOC 2 compliance",
                    stat: "SOC 2",
                    statColor: "text-cyan-400",
                    gradient: "from-cyan-600 to-blue-600",
                    border: "border-cyan-500/20 hover:border-cyan-500/40"
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 backdrop-blur-sm border ${feature.border} rounded-2xl p-6 relative overflow-hidden group transition-all duration-500`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="relative z-10">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{feature.desc}</p>
                      <div className={`${feature.statColor} text-2xl font-bold`}>{feature.stat}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ============================================ */}
          {/* AI-POWERED AD EXAMPLES - Ultimate Showcase */}
          {/* ============================================ */}
          <section className="py-24 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black"></div>
            <div className="absolute inset-0">
              <div className="absolute w-[800px] h-[800px] top-0 left-1/4 bg-green-600/10 rounded-full blur-[200px] animate-pulse"></div>
              <div className="absolute w-[600px] h-[600px] bottom-0 right-1/4 bg-blue-600/10 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute w-[400px] h-[400px] top-1/2 right-0 bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
              {/* Matrix-like falling code effect */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-green-400 text-xs font-mono"
                    style={{ left: `${i * 7}%` }}
                    animate={{ y: ['-100%', '100vh'] }}
                    transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.3 }}
                  >
                    {['01', '10', 'AI', '→', '◆', '∞', '⚡'].map((char, j) => (
                      <div key={j} className="my-4">{char}</div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
              {/* Header with AI Animation */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                {/* AI Status Badge - Enhanced */}
                <motion.div 
                  className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-cyan-600/20 border border-green-500/30 rounded-full mb-8 backdrop-blur-xl"
                  animate={{ 
                    boxShadow: ['0 0 30px rgba(34, 197, 94, 0.3)', '0 0 60px rgba(34, 197, 94, 0.5)', '0 0 30px rgba(34, 197, 94, 0.3)'],
                    borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.6)', 'rgba(34, 197, 94, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-5 h-5 text-white" />
                    </motion.div>
                    <motion.div 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-green-300 font-bold text-sm">AI Engine Active</p>
                    <p className="text-green-400/60 text-xs">Processing 2,847 campaigns</p>
                  </div>
                  <div className="h-8 w-px bg-green-500/30"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs font-mono">LIVE</span>
                    <motion.div 
                      className="w-2 h-2 bg-green-400 rounded-full"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

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
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${item.color} border rounded-full text-sm text-white/90 backdrop-blur-sm cursor-default`}
                    >
                      {item.icon}
                      {item.text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Main Content - AI Command Center Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side - AI Code Generator with Modern Loader */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-5 space-y-6"
                >
                  {/* Modern AI Loader Card */}
                  <div className="relative h-full flex flex-col justify-center">
                    {/* Floating Status Badge */}
                    <motion.div 
                      className="absolute -top-4 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/30"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-4 h-4 text-white" />
                      </motion.div>
                      <span className="text-white text-xs font-bold">AI Campaign Generator</span>
                      <motion.div 
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </motion.div>

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
                </motion.div>

                {/* Right Side - 3D Carousel Ad Preview */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-7"
                >
                  {/* 3D Carousel Container */}
                  <div className="relative">
                    {/* Floating AI Badge */}
                    <motion.div 
                      className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 rounded-full shadow-2xl shadow-green-500/40"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-5 h-5 text-white" />
                      </motion.div>
                      <span className="text-white font-bold">AI Generated Ads • Drag to Explore</span>
                      <motion.div
                        className="flex gap-1"
                      >
                        <motion.div className="w-1.5 h-1.5 bg-white rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
                        <motion.div className="w-1.5 h-1.5 bg-white rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                        <motion.div className="w-1.5 h-1.5 bg-white rounded-full" animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                      </motion.div>
                    </motion.div>

                    {/* Glow Effect Behind Carousel */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div 
                        className="w-[500px] h-[500px] bg-gradient-to-r from-green-600/30 via-blue-600/30 to-purple-600/30 rounded-full blur-[100px]"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                    </div>

                    {/* 3D Carousel */}
                    <div className="h-[500px] relative z-10">
                      <ThreeDCarousel 
                        radius={320}
                        cardW={200}
                        cardH={280}
                        items={[
                          // Google Pixel Search Ad
                          <div key="pixel" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2.5 flex-1 flex flex-col pb-8">
                              <span className="text-[9px] text-gray-500 font-bold">Sponsored</span>
                              <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                                <div className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-500 font-bold text-[9px]">G</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-gray-800 font-medium text-[10px] truncate">pixel.google</p>
                                </div>
                              </div>
                              <h3 className="text-blue-700 font-medium text-xs mb-1 leading-tight line-clamp-2">
                                Google Pixel Smartphone - Meet Pixel Phones
                              </h3>
                              <p className="text-gray-600 text-[9px] flex-1 line-clamp-3">
                                Pixel provides productivity, security, and support for your business.
                              </p>
                              <div className="space-y-1 border-t pt-1.5 mt-1">
                                <p className="text-blue-700 text-[9px] truncate">Find the Right Pixel</p>
                                <p className="text-blue-700 text-[9px] truncate">Google Phones Info</p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +340%
                                </span>
                                <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> AI</span>
                              </div>
                            </div>
                          </div>,

                          // Google Play Ad
                          <div key="play" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2.5 flex-1 flex flex-col pb-8">
                              <span className="text-[9px] text-gray-500 font-bold">Sponsored</span>
                              <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                                <div className="w-5 h-5 flex-shrink-0">
                                  <svg viewBox="0 0 24 24" className="w-full h-full">
                                    <path fill="#EA4335" d="M3.5 20.5l9.5-9.5-9.5-9.5v19z"/>
                                    <path fill="#FBBC04" d="M3.5 20.5l12-7-2.5-2.5-9.5 9.5z"/>
                                    <path fill="#34A853" d="M15.5 13.5l5-3-5-3v6z"/>
                                    <path fill="#4285F4" d="M3.5 1.5l12 7-2.5 2.5-9.5-9.5z"/>
                                  </svg>
                                </div>
                                <p className="text-gray-800 font-medium text-[10px] truncate">Google Play</p>
                              </div>
                              <h3 className="text-blue-700 font-medium text-xs mb-1 leading-tight line-clamp-2">
                                Shop popular brands - Gift cards
                              </h3>
                              <p className="text-gray-600 text-[9px] flex-1 line-clamp-4">
                                Google Play is the secure, simple way to shop and send gift cards.
                              </p>
                              <div className="flex items-center gap-1 text-[8px] text-gray-500 mt-1">
                                <Star className="w-2.5 h-2.5 text-yellow-500" fill="#eab308" />
                                <span>4.8 • 100M+</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +280%
                                </span>
                                <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> AI</span>
                              </div>
                            </div>
                          </div>,

                          // Google Cloud Ad
                          <div key="cloud" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2.5 flex-1 flex flex-col pb-8">
                              <span className="text-[9px] text-gray-500 font-bold">Sponsored</span>
                              <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center p-0.5 flex-shrink-0">
                                  <svg viewBox="0 0 24 24" className="w-full h-full">
                                    <path fill="#4285F4" d="M12 7.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5-4.5-2-4.5-4.5 2-4.5 4.5-4.5z"/>
                                    <path fill="#EA4335" d="M19.5 12c0-1.4-.4-2.7-1-3.8l-3 3c.3.5.5 1.1.5 1.8h3.5z"/>
                                  </svg>
                                </div>
                                <p className="text-gray-800 font-medium text-[10px] truncate">Google Cloud</p>
                              </div>
                              <h3 className="text-blue-700 font-medium text-xs mb-1 leading-tight line-clamp-2">
                                Google Cloud Built for AI
                              </h3>
                              <p className="text-gray-600 text-[9px] flex-1 line-clamp-4">
                                Code using any language. Deploy as container. $300 free credits.
                              </p>
                              <div className="border-t pt-1 mt-1 space-y-0.5">
                                <p className="text-blue-700 text-[9px] truncate">Start Free Trial</p>
                                <p className="text-blue-700 text-[9px] truncate">View Pricing</p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +420%
                                </span>
                                <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> AI</span>
                              </div>
                            </div>
                          </div>,

                          // Shopping Ad
                          <div key="shopping" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2 flex-1 flex flex-col pb-8">
                              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded mb-2">
                                <img 
                                  src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=150&fit=crop" 
                                  alt="Pixel Phone" 
                                  className="w-full h-28 object-contain"
                                />
                              </div>
                              <h4 className="text-blue-700 font-medium text-[10px] mb-0.5 line-clamp-2">
                                Pixel 10 Pro Fold 256GB
                              </h4>
                              <p className="text-gray-800 font-bold text-sm">$1,799</p>
                              <p className="text-gray-500 text-[9px]">Google Store</p>
                              <div className="flex items-center gap-0.5 mt-1">
                                <div className="flex text-yellow-400 text-[8px]">★★★★★</div>
                                <span className="text-gray-500 text-[8px]">(2.8k)</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +520%
                                </span>
                                <span>Shopping</span>
                              </div>
                            </div>
                          </div>,

                          // Display Ad - Dark Theme
                          <div key="display" className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2.5 flex-1 flex flex-col pb-8">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-[9px] text-gray-400">Ad</span>
                                <span className="text-[9px] text-purple-400 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> AI Generated
                                </span>
                              </div>
                              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-2">
                                <Rocket className="w-5 h-5 text-purple-400" />
                              </div>
                              <h3 className="text-white text-sm font-bold mb-1">Scale Your Business</h3>
                              <p className="text-gray-400 text-[9px] flex-1 line-clamp-3">
                                AI-powered marketing that delivers real results. Start free today.
                              </p>
                              <button className="w-full bg-white text-purple-700 py-1.5 rounded-full font-bold text-[10px] mt-2">
                                Start Free Trial →
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +250%
                                </span>
                                <span>Display</span>
                              </div>
                            </div>
                          </div>,

                          // App Ad
                          <div key="app" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2 flex-1 flex flex-col pb-8">
                              <div className="flex items-start gap-2 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 flex items-center justify-center shadow flex-shrink-0">
                                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                                    <path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-gray-800 font-bold text-[11px]">Google Pay</h4>
                                  <p className="text-gray-500 text-[9px]">Online shopping</p>
                                </div>
                              </div>
                              <div className="flex justify-between text-center border-y py-1.5 mb-2 text-[8px]">
                                <div className="flex-1">
                                  <p className="text-gray-500">DL</p>
                                  <p className="text-gray-800 font-medium">100M+</p>
                                </div>
                                <div className="flex-1 border-x">
                                  <p className="text-gray-500">CAT</p>
                                  <p className="text-gray-800 font-medium">Finance</p>
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-500">DEV</p>
                                  <p className="text-gray-800 font-medium">Google</p>
                                </div>
                              </div>
                              <img 
                                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=80&fit=crop" 
                                alt="App" 
                                className="w-full h-16 object-cover rounded mb-2"
                              />
                              <button className="w-full bg-blue-600 text-white py-1.5 rounded-full font-bold text-[10px]">
                                Install
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-teal-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +680%
                                </span>
                                <span>App</span>
                              </div>
                            </div>
                          </div>,

                          // Video Ad
                          <div key="video" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="flex items-center gap-1.5 p-2">
                              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-purple-600 font-bold text-[9px]">S</span>
                              </div>
                              <span className="text-gray-600 text-[9px]">Sponsored</span>
                            </div>
                            <div className="relative flex-shrink-0">
                              <img 
                                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=120&fit=crop" 
                                alt="Google Nest" 
                                className="w-full h-28 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                  <Play className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" />
                                </div>
                              </div>
                              <div className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-white text-[8px]">
                                0:30
                              </div>
                            </div>
                            <div className="p-2 flex-1 flex flex-col pb-8">
                              <p className="text-gray-800 text-[9px] leading-snug line-clamp-3">
                                Nest Learning Thermostat. Stay up-to-date on your home...
                              </p>
                              <div className="flex items-center gap-2 mt-auto pt-1 text-gray-400 text-sm">
                                <span>♡</span>
                                <span>↗</span>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +320%
                                </span>
                                <span>Video</span>
                              </div>
                            </div>
                          </div>,

                          // Search Ad
                          <div key="search" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2.5 flex-1 flex flex-col pb-8">
                              <span className="text-[9px] text-gray-500 font-bold">Sponsored</span>
                              <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                                <div className="w-5 h-5 flex-shrink-0">
                                  <svg viewBox="0 0 24 24" className="w-full h-full">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                  </svg>
                                </div>
                                <p className="text-gray-800 font-medium text-[10px] truncate">google.com</p>
                              </div>
                              <h3 className="text-blue-700 font-medium text-xs mb-1 leading-tight line-clamp-2">
                                How Google Search works
                              </h3>
                              <p className="text-gray-600 text-[9px] mb-1.5 line-clamp-2">
                                Learn how Google provides helpful information.
                              </p>
                              <div className="space-y-0.5 border-t pt-1 flex-1">
                                <p className="text-blue-700 text-[9px] truncate">Learn Search</p>
                                <p className="text-blue-700 text-[9px] truncate">Detecting Spam</p>
                                <p className="text-blue-700 text-[9px] truncate">Search Features</p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +380%
                                </span>
                                <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> AI</span>
                              </div>
                            </div>
                          </div>,

                          // Fi Ad
                          <div key="fi" className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
                            <div className="p-2.5 flex-1 flex flex-col pb-8">
                              <span className="text-[9px] text-gray-500 font-bold">Sponsored</span>
                              <div className="flex items-center gap-1.5 mt-1 mb-1.5">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 via-green-400 to-yellow-400 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-[8px]">Fi</span>
                                </div>
                                <p className="text-gray-800 font-medium text-[10px] truncate">Google Fi</p>
                              </div>
                              <h3 className="text-blue-700 font-medium text-xs mb-1 leading-tight line-clamp-2">
                                Try Fi for free - Start trial
                              </h3>
                              <p className="text-gray-600 text-[9px] flex-1 line-clamp-3">
                                Test Google Fi coverage. $50/mo. Cancel anytime.
                              </p>
                              <div className="space-y-0.5 border-t pt-1 mt-1">
                                <p className="text-blue-700 text-[9px] truncate">Try Fi Free</p>
                                <p className="text-blue-700 text-[9px] truncate">7 days trial</p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-teal-500 px-2 py-1.5">
                              <div className="flex items-center justify-between text-white text-[8px]">
                                <span className="flex items-center gap-0.5 font-bold">
                                  <TrendingUp className="w-2.5 h-2.5" /> +190%
                                </span>
                                <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> AI</span>
                              </div>
                            </div>
                          </div>,
                        ]}
                      />
                    </div>

                    {/* Bottom Stats Bar */}
                    <motion.div 
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 px-6 py-3 bg-black/80 backdrop-blur-xl rounded-full border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-400 text-sm">9 Ad Types</span>
                      </div>
                      <div className="h-4 w-px bg-white/20"></div>
                      <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                        <TrendingUp className="w-4 h-4" />
                        <span>Avg +365% Performance</span>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom CTA - Enhanced */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-20"
              >
                <div className="inline-block">
                  <Link
                    href="/authentication/sign-up"
                    className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 text-white rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 overflow-hidden"
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <Brain className="w-7 h-7 relative z-10" />
                    <span className="relative z-10">Start Creating AI-Powered Ads</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
                  </Link>
                </div>
                <p className="text-gray-500 mt-6 flex items-center justify-center gap-4">
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
              </motion.div>
            </div>
          </section>

          {/* ============================================ */}
          {/* AI PERFORMANCE CHARTS SECTION - Enhanced */}
          {/* ============================================ */}
          <section className="py-24 px-4 border-t border-white/10 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black"></div>
            <div className="absolute inset-0">
              <div className="absolute w-[600px] h-[600px] top-0 left-1/4 bg-green-600/10 rounded-full blur-[200px] animate-pulse"></div>
              <div className="absolute w-[600px] h-[600px] bottom-0 right-1/4 bg-blue-600/10 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
              {/* Header */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="text-center mb-16"
              >
                <motion.div 
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full mb-8"
                  animate={{ boxShadow: ['0 0 20px rgba(34, 197, 94, 0.2)', '0 0 40px rgba(34, 197, 94, 0.3)', '0 0 20px rgba(34, 197, 94, 0.2)'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="relative">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    <motion.div 
                      className="absolute inset-0 bg-green-400 rounded-full blur-sm"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <span className="text-green-300 font-medium">Live Performance Data</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </motion.div>

                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="text-white">See the </span>
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Difference
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Real results from businesses using our AI platform - updated in real-time
                </p>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
              >
                {[
                  { value: "+340%", label: "Avg. CTR Increase", color: "text-green-400", bg: "from-green-600/20" },
                  { value: "-65%", label: "CPA Reduction", color: "text-blue-400", bg: "from-blue-600/20" },
                  { value: "4.8x", label: "ROAS Improvement", color: "text-purple-400", bg: "from-purple-600/20" },
                  { value: "24/7", label: "AI Optimization", color: "text-cyan-400", bg: "from-cyan-600/20" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${stat.bg} to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-white/20 transition-all`}
                  >
                    <p className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1 - AI vs Manual Performance */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-500"
                >
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
                </motion.div>

                {/* Chart 2 - Cost Reduction */}
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-900 via-gray-900 to-green-900/20 backdrop-blur-xl rounded-3xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-500"
                >
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
                </motion.div>
              </div>

              {/* Bottom Insight */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-green-900/30 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
              >
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
