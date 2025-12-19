"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Wand2, Loader2, Bot, MessageCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useMediaQuery } from "react-responsive";
import AvatarGroup from "@/components/ui/avatar-group";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function AdCreationPrompt() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [strategy, setStrategy] = useState<string | null>(null);
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
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
    const [isMounted, setIsMounted] = useState(false);

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

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setStrategy(null);

        try {
            // Call AI Advisor API
            const res = await fetch("/api/ai-advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();

            if (data.strategy) {
                setStrategy(data.strategy);
            } else {
                // Fallback direct redirect if API fails
                proceedToCampaign();
            }
        } catch (error) {
            console.error(error);
            proceedToCampaign(); // Fallback
        } finally {
            setIsLoading(false);
        }
    };

    const proceedToCampaign = async () => {
        try {
            localStorage.setItem("initialAdPrompt", prompt);
            if (strategy) {
                localStorage.setItem("aiStrategy", strategy);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push("/campaign/new");
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

                        {/* 1. Header with AvatarGroup */}
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

                        {/* 4. Input Form */}
                        {!strategy ? (
                            <form onSubmit={handleGenerate} className="w-full max-w-6xl relative group/input z-20">
                                <div className={`
                                    relative flex items-center overflow-hidden rounded-2xl border transition-all duration-300
                                    ${isFocused
                                        ? "border-purple-500/50 bg-white/[0.03] shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]"
                                        : "border-white/10 bg-white/[0.02]"
                                    }
                                    ${isMobile ? 'flex-col p-2 gap-2 h-auto' : 'h-20 md:h-20'} 
                                `}>
                                    {!isMobile && (
                                        <div className="pl-6 text-gray-400">
                                            <Wand2 className={`h-6 w-6 transition-colors duration-300 ${isFocused ? "text-purple-400" : "text-gray-500"}`} />
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
                                            className={`
                                                relative w-full h-full bg-transparent text-white placeholder-transparent focus:outline-none z-10
                                                ${isMobile ? 'px-4 text-base text-center' : 'px-6 text-xl'}
                                            `}
                                        />

                                        {/* Dynamic Placeholder */}
                                        {!prompt && (
                                            <div className={`absolute inset-0 flex items-center pointer-events-none ${isMobile ? 'justify-center px-4' : 'px-6'}`}>
                                                <span className={`text-gray-500 ${isMobile ? 'text-base' : 'text-xl'} mr-2`}>
                                                    Describe your ads,
                                                </span>
                                                <div className="relative h-6 overflow-hidden flex-1">
                                                    <div
                                                        key={currentExampleIndex}
                                                        className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-gray-400 italic font-medium whitespace-nowrap"
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
                                                ${isMobile ? 'w-full h-12 rounded-xl text-base' : 'h-16 px-8 rounded-xl text-lg hover:scale-[1.02] hover:shadow-purple-500/25'}
                                            `}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Thinking...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    Generate
                                                    <ArrowRight className="h-5 w-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* 5. Quick Suggestion Chips */}
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    {[
                                        "هل يمكن للإعلانات أن تنجح في عملي؟",
                                        "ما هي أفضل استراتيجية إعلانية لاستهداف الشباب؟",
                                        "أريد إنشاء حملة بأقل ميزانية ممكنة"
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
                            </form>
                        ) : (
                            // AI Strategy Card (Answer)
                            <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-500">
                                <div className="rounded-3xl border border-purple-500/20 bg-white/[0.03] p-8 backdrop-blur-xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 rounded-full bg-purple-500/20">
                                            <Bot className="h-8 w-8 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">AI Strategy Suggestion</h3>
                                            <p className="text-gray-400">Based on Google Ads Best Practices</p>
                                        </div>
                                    </div>

                                    <div className="prose prose-invert max-w-none mb-8 text-left">
                                        <ReactMarkdown>{strategy}</ReactMarkdown>
                                    </div>

                                    <div className="flex gap-4 justify-end flex-wrap md:flex-nowrap">
                                        <button
                                            onClick={() => setStrategy(null)}
                                            className="w-full md:w-auto px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                                        >
                                            Ask Another Question
                                        </button>
                                        <button
                                            onClick={proceedToCampaign}
                                            className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            Launch Campaign <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
