"use client";
import GlowButton from '@/components/ui/glow-button';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, MessageCircle, ArrowRight, ArrowUp, Loader2, Paperclip, Globe, Bell, Zap, Wand2, PenTool, User, Bot, Mic, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { useMediaQuery } from "react-responsive";
import AvatarGroup from "@/components/ui/avatar-group";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    images?: string[];
};

export default function AdCreationPrompt() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    // New ref for the scrollable chat container
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    // Short industries for dynamic buttons
    const INDUSTRIES = [
        "Real Estate", "Coffee Shop", "SaaS App", "Dental Clinic",
        "Fashion Store", "Fitness Gym", "Local Bakery", "Law Firm",
        "Online Course", "Travel Agency", "Pet Store", "Car Rental"
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

    useEffect(() => {
        // Scroll the chat container to bottom when messages update
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            (window as any).speechRecognitionInstance?.stop();
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'ar-SA'; // Default to Arabic as requested context implies, or 'en-US'

                recognition.onstart = () => setIsRecording(true);
                recognition.onend = () => {
                    if (isRecording) setIsRecording(false);
                };

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setPrompt(prev => prev + (prev ? " " : "") + transcript);
                };

                recognition.start();
                (window as any).speechRecognitionInstance = recognition;
            } else {
                alert("Speech recognition is not supported in this browser.");
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!prompt.trim() && selectedImages.length === 0) || isLoading) return;

        // Process images - Upload to Supabase Storage via Backend API (Bypassing RLS)
        const uploadPromises = selectedImages.map(async (file) => {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                return data.publicUrl;
            } catch (err) {
                console.error("Image upload processing error:", err);
                return "";
            }
        });

        const imageUrls = (await Promise.all(uploadPromises)).filter(url => url !== "");

        const userMessage: Message = {
            role: 'user',
            content: prompt.trim(),
            images: imageUrls.length > 0 ? imageUrls : undefined,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setPrompt("");
        setSelectedImages([]);
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
                    className="relative w-full max-w-4xl mx-auto bg-[#020617]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 transition-all duration-300 hover:shadow-3xl overflow-hidden"
                >
                    {/* Content Container */}
                    <div className={`relative flex flex-col items-center w-full h-auto max-h-[85vh] min-h-[400px] ${isMobile ? 'p-3 py-4' : 'p-6 md:p-10'}`}>

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
                                <h1 className={`text-center font-bold tracking-tight leading-[1.1] ${isMobile ? 'text-4xl mb-4' : 'text-5xl md:text-6xl lg:text-7xl mb-8'}`}>
                                    <span className="text-white">
                                        Build your Google Ads in seconds
                                    </span>
                                    <br />
                                    <span className="text-gray-500 dark:text-gray-500">
                                        with AI magic
                                    </span>
                                </h1>

                                {/* 3. Quick Suggestion Chips - Dynamic & Short */}
                                <div className="flex flex-wrap justify-center gap-3 w-full my-3 md:my-8">
                                    {[
                                        { icon: Zap, text: `Promote ${INDUSTRIES[currentExampleIndex % INDUSTRIES.length]}`, prompt: `Create a high-converting ad campaign for a ${INDUSTRIES[currentExampleIndex % INDUSTRIES.length]}` },
                                        { icon: Search, text: `${INDUSTRIES[currentExampleIndex % INDUSTRIES.length]} KW`, prompt: `Find the best high-intent keywords for ${INDUSTRIES[currentExampleIndex % INDUSTRIES.length]}` },
                                        { icon: PenTool, text: `Ad Copy`, prompt: `Write compelling ad headlines and descriptions for ${INDUSTRIES[currentExampleIndex % INDUSTRIES.length]}` }
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setPrompt(item.prompt)}
                                            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1e1e2d] border border-white/5 text-gray-300 hover:bg-[#252536] hover:border-purple-500/30 transition-all text-sm md:text-base font-medium group active:scale-95"
                                        >
                                            <item.icon className="w-4 h-4 text-blue-400 group-hover:text-purple-400 transition-colors" />
                                            <span>{item.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Chat Messages Area - Scrollable */}
                        {messages.length > 0 && (
                            <div
                                ref={chatContainerRef}
                                className="flex-1 w-full max-w-4xl mb-2 overflow-y-auto space-y-4 px-2 custom-scrollbar overscroll-contain [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-[3px]"
                                style={{
                                    scrollBehavior: 'auto',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)',
                                    overscrollBehavior: 'auto' // Allow page scroll when boundary reached
                                }}
                                data-lenis-prevent="true"
                            >
                                <AnimatePresence>
                                    {messages.map((message, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }} // Reduced motion distance for smoother feel
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
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

                                            {/* Render Attached Images if any */}
                                            {message.images && message.images.length > 0 && (
                                                <div className="flex gap-2 mt-2 flex-wrap justify-end w-full">
                                                    {message.images.map((img, i) => (
                                                        <img key={i} src={img} alt="Attached" className="w-24 h-24 object-cover rounded-lg border border-white/10 shadow-md" />
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Input Form - Sticky Footer Integrated */}
                        <form onSubmit={handleSendMessage} className={`w-full mt-auto relative z-20 sticky ${isMobile ? 'bottom-0' : 'bottom-0'}`}>

                            <div className={`bg-[#1e1e2d] backdrop-blur-xl border border-white/5 ${isMobile ? 'p-3 rounded-2xl' : 'p-5 rounded-3xl'} shadow-lg transition-all duration-300`}>

                                {/* Image Preview Area - Refined */}
                                {selectedImages.length > 0 && (
                                    <div className="mb-3 px-2">
                                        <h3 className="text-gray-500 text-[10px] font-normal mb-2 flex items-center gap-1.5 opacity-70">
                                            <Paperclip size={10} />
                                            Extract only text from images and files.
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedImages.map((file, idx) => (
                                                <div key={idx} className="relative group bg-white/5 border border-white/10 rounded-xl p-2 flex items-center gap-3 pr-8">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt="preview"
                                                        className="w-10 h-10 object-cover rounded-lg"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-200 font-medium truncate max-w-[120px]">{file.name}</span>
                                                        <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB • Uploading...</span>
                                                    </div>
                                                    <div className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="text-gray-400 hover:text-red-400 transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Input Area - Textarea */}
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    disabled={isLoading}
                                    placeholder={messages.length === 0 ? "Describe your ads..." : "Type your question here..."}
                                    rows={2}
                                    className="w-full p-2 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none resize-none text-base font-medium leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                                />

                                {/* Controls */}
                                <div className="flex flex-row items-center justify-between gap-2">
                                    {/* Left side controls */}
                                    <div className="flex flex-wrap items-center gap-2 pl-1">
                                        {/* Tools Button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-2 px-2 md:px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-white/5 rounded-lg transition-all duration-200 group active:scale-95"
                                        >
                                            <Paperclip size={20} className="transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                            <span className="font-medium text-sm">Tools</span>
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileSelect}
                                        />

                                        {/* Search Button */}
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-2 md:px-3 py-2 text-gray-400 hover:text-gray-100 hover:bg-white/5 rounded-lg transition-all duration-200 group active:scale-95"
                                        >
                                            <Globe size={20} className="group-hover:text-blue-400 transition-colors" />
                                            <span className="font-medium text-sm">Search</span>
                                        </button>
                                    </div>

                                    {/* Right side controls */}
                                    <div className="flex items-center gap-2 md:gap-3">
                                        {/* Bell Icon */}
                                        {/* Mic Icon */}
                                        <button
                                            type="button"
                                            onClick={toggleRecording}
                                            className={`p-2 rounded-lg transition-all active:scale-95 ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <Mic size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || (!prompt.trim() && selectedImages.length === 0)}
                                            className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl ${(prompt.trim() || selectedImages.length > 0) && !isLoading
                                                ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-blue-500/20'
                                                : 'bg-gradient-to-br from-gray-800 to-gray-700 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {isLoading ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <ArrowRight size={20} className="text-white" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Privacy Notice */}
                        <p className="mt-4 text-center text-xs text-gray-500">
                            AI may make mistakes. We recommend checking important information. <a href="#" className="underline hover:text-gray-400">Privacy Notice</a>
                        </p>

                        {/* CTA Buttons - Show only when there are messages */}
                        {messages.length > 0 && (
                            <div className="mt-6 w-full max-w-4xl flex flex-col sm:flex-row justify-center gap-4">

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
