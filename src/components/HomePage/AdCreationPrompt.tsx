"use client";
import GlowButton from '@/components/ui/glow-button';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Wand2, Loader2, Bot, MessageCircle, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useMediaQuery } from "react-responsive";
import AvatarGroup from "@/components/ui/avatar-group";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
};

export default function AdCreationPrompt() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // 50 Diverse Industry Examples for Google Ads
    const INDUSTRY_EXAMPLES = [
        "Summer sale for organic skincare", "Leads for luxury real estate in Dubai", "App install for fitness tracker",
        "B2B SaaS lead generation", "Emergency plumbing services 24/7", "Online yoga classes for beginners",
        "Coffee shop grand opening", "Dental implant consultation leads", "E-commerce fashion brand launch",
        "Corporate legal services", "Car insurance quote generator", "Travel agency promotion for Maldives",
        "Pet grooming local service", "Online coding bootcamp signup", "Restaurant weekend special menu",
        "Home renovation contractor leads", "SEO agency free audit", "Wedding photography portfolio",
        "Cybersecurity software demo", "Mortgage broker rate comparison", "Language learning app download",
        "Cleaning service subscription", "Financial planning webinar registration", "Electric vehicle test drive booking",
        "Boutique hotel weekend getaway", "Digital marketing course sales", "Roofing repair emergency service",
        "Sustainable clothing brand awareness", "Mobile game user acquisition", "Accounting firm tax season special",
        "Interior design consultation", "Gym membership summer discount", "Flower delivery same day",
        "Study abroad consultancy leads", "Cloud hosting free trial", "Vintage watch collector store",
        "Event catering quote request", "HR software for small business", "Solar panel installation leads",
        "Luxury car rental service", "Online therapy platform signups", "Coding for kids workshops",
        "Art gallery exhibition ticket sales", "Pest control local experts", "Video production agency showcase",
        "Cryptocurrency exchange registration", "Vegan meal prep delivery", "Music streaming app premium sub",
        "Industrial machinery B2B sales", "Virtual assistant service leads"
    ];

    const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

    // Responsive Breakpoints
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // Prevent hydration mismatch by only rendering desktop-specific styles after mount
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Rotate examples every 3.5s
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentExampleIndex((prev) => (prev + 1) % INDUSTRY_EXAMPLES.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Mouse move effect for spotlight (Desktop Only)
    useEffect(() => {
        if (!isDesktop) return;

        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            container.style.setProperty("--mouse-x", `${x}px`);
            container.style.setProperty("--mouse-y", `${y}px`);
        };

        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [isDesktop]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: prompt.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setPrompt("");
        setIsLoading(true);

        try {
            // Call AI Advisor API with conversation context
            const res = await fetch("/api/ai-advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: userMessage.content,
                    conversationHistory: messages
                }),
            });
            const data = await res.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.strategy || "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.",
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCampaign = async () => {
        try {
            // Save conversation context to localStorage
            localStorage.setItem("chatHistory", JSON.stringify(messages));

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push("/campaign/website-url");
            } else {
                router.push("/authentication/sign-up");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <section className={`relative z-30 px-4 transition-all duration-300 ${isMobile ? '-mt-16 mb-16' : '-mt-32 mb-32'}`}>
            <div className="mx-auto w-full max-w-[95rem] transition-all duration-300">
                <div
                    ref={containerRef}
                    className="group relative rounded-[3rem] bg-[#0A0A0A] p-[1px] shadow-2xl transition-all duration-500 hover:shadow-[0_0_100px_-20px_rgba(168,85,247,0.4)]"
                >
                    {/* Animated Gradient Border */}
                    <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-40" />

                    {/* Spotlight Gradient - Desktop Only */}
                    <div
                        className="pointer-events-none absolute -inset-px rounded-[3rem] opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{
                            background: isMounted && isDesktop
                                ? `radial-gradient(1000px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 40%)`
                                : 'none'
                        }}
                    />

                    {/* Content Container */}
                    <div className={`relative flex flex-col items-center rounded-[3rem] bg-[#0A0A0A]/90 backdrop-blur-xl ${isMobile ? 'p-6 py-8' : 'p-10 md:p-12'}`}>

                        {/* Header - Only show when no messages */}
                        {messages.length === 0 && (
                            <>
                                {/* 1. AvatarGroup */}
                                <div className="mb-6 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <AvatarGroup
                                            limit={4}
                                            avatarData={[
                                                { src: "https://i.pravatar.cc/150?u=a042581f4e29026024d", alt: "Google Ads Expert" },
                                                { src: "https://i.pravatar.cc/150?u=a04258a2462d826712d", alt: "Strategist" },
                                                { src: "https://i.pravatar.cc/150?u=a042581f4e29026704d", alt: "AI Advisor" },
                                                { src: "https://i.pravatar.cc/150?u=a04258114e29026302d", alt: "Analyst" },
                                            ]}
                                        />
                                        <span className="text-gray-400 text-sm font-medium">+10k Campaigns Managed</span>
                                    </div>
                                </div>

                                {/* 2. Main Title */}
                                <h1 className={`mb-6 text-center font-bold tracking-tight text-white leading-[1.1] ${isMobile ? 'text-3xl' : 'text-5xl md:text-6xl lg:text-7xl'}`}>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                                        Build your Google Ads in seconds
                                    </span>
                                    <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-x">
                                        with AI magic
                                    </span>
                                </h1>

                                {/* 3. Quick Suggestion Chips */}
                                <div className="mb-6 flex flex-wrap justify-center gap-3">
                                    {[
                                        "I want to create a campaign with minimal budget",
                                        "How do I start with Google Ads without experience?",
                                        "What campaign type suits my restaurant?"
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setPrompt(q)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/30 transition-all text-sm md:text-base"
                                        >
                                            <MessageCircle className="w-4 h-4 text-purple-400" />
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Chat Messages Area - Scrollable */}
                        {messages.length > 0 && (
                            <div className="w-full max-w-4xl mb-6 max-h-[60vh] overflow-y-auto space-y-4 px-2 scroll-smooth">
                                <AnimatePresence>
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.role === 'assistant' && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50 ring-2 ring-purple-400/30">
                                                        <Sparkles className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`
                                                max-w-[80%] rounded-2xl p-4 shadow-lg
                                                ${message.role === 'user'
                                                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-purple-500/20'
                                                    : 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-purple-500/20 text-gray-100 shadow-purple-500/10'
                                                }
                                            `}>
                                                {message.role === 'assistant' ? (
                                                    <div
                                                        className="prose prose-invert prose-sm max-w-none [&>p]:leading-relaxed [&>ul]:my-2 [&>ul>li]:my-1"
                                                        dir={/[\u0600-\u06FF]/.test(message.content) ? 'rtl' : 'ltr'}
                                                        style={{ textAlign: /[\u0600-\u06FF]/.test(message.content) ? 'right' : 'left' }}
                                                    >
                                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p
                                                        className="text-sm md:text-base leading-relaxed"
                                                        dir={/[\u0600-\u06FF]/.test(message.content) ? 'rtl' : 'ltr'}
                                                        style={{ textAlign: /[\u0600-\u06FF]/.test(message.content) ? 'right' : 'left' }}
                                                    >
                                                        {message.content}
                                                    </p>
                                                )}
                                            </div>

                                            {message.role === 'user' && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50 ring-2 ring-blue-400/30">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Input Form - Fixed at Bottom */}
                        <form onSubmit={handleSendMessage} className={`w-full max-w-4xl relative group/input z-20 sticky ${isMobile ? 'bottom-20' : 'bottom-6'}`}>
                            <div className={`
                                relative flex items-center overflow-hidden rounded-2xl border transition-all duration-300
                                ${isFocused
                                    ? "border-purple-500/50 bg-white/[0.03] shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]"
                                    : "border-white/10 bg-white/[0.02]"
                                }
                                ${isMobile ? 'flex-col p-3 gap-3 h-auto min-h-[80px]' : 'h-16 md:h-16'} 
                            `}>
                                {!isMobile && (
                                    <div className="pl-6 text-gray-400">
                                        <Sparkles className={`h-5 w-5 transition-colors duration-300 ${isFocused ? "text-purple-400 animate-pulse" : "text-gray-500"}`} />
                                    </div>
                                )}

                                <div className="relative flex-1 h-full">
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        disabled={isLoading}
                                        placeholder={messages.length === 0 ? "" : "Type your question here..."}
                                        className={`
                                            w-full h-full bg-transparent text-white outline-none 
                                            ${isMobile ? 'px-4 py-3 text-base placeholder:text-gray-500' : 'px-4 md:px-6 placeholder:text-gray-500 text-sm md:text-base'}
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    />

                                    {/* Dynamic Placeholder - Only when no messages */}
                                    {!prompt && messages.length === 0 && (
                                        <div className={`absolute inset-0 flex items-center pointer-events-none ${isMobile ? 'px-4 flex-wrap' : 'px-6'}`}>
                                            <span className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'} mr-2 whitespace-nowrap`}>
                                                Describe your ads,
                                            </span>
                                            <div className={`relative h-6 overflow-hidden ${isMobile ? 'w-full' : 'flex-1'}`}>
                                                <div
                                                    key={currentExampleIndex}
                                                    className={`animate-in fade-in slide-in-from-bottom-2 duration-500 text-gray-400 italic font-medium text-sm ${isMobile ? '' : 'whitespace-nowrap'}`}
                                                >
                                                    "{INDUSTRY_EXAMPLES[currentExampleIndex]}"
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={isMobile ? 'w-full' : 'pr-2'}>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !prompt.trim()}
                                        className={`
                                            relative z-20 inline-flex items-center justify-center gap-2 font-semibold text-white shadow-lg transition-all duration-300 
                                            bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500
                                            disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale
                                            ${isMobile ? 'w-full h-12 rounded-xl text-base' : 'h-12 px-6 rounded-xl text-base hover:scale-[1.02] hover:shadow-purple-500/25'}
                                        `}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Analyzing...</span>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.length === 0 ? "Generate" : "Send"}
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* CTA Buttons - Show only when there are messages */}
                        {messages.length > 0 && (
                            <div className="mt-6 w-full max-w-4xl flex flex-col sm:flex-row justify-center gap-4">
                                <GlowButton
                                    onClick={() => window.location.href = '/pricing'}
                                    variant="purple"
                                >
                                    <span className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                        View Pricing
                                    </span>
                                </GlowButton>
                                <GlowButton
                                    onClick={handleCreateCampaign}
                                    variant="blue"
                                >
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5" />
                                        Start Campaign
                                        <ArrowRight className="h-5 w-5" />
                                    </span>
                                </GlowButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
