"use client";
import GlowButton from "@/components/UI/glow-button";
import GlowingBorderCard from "@/components/UI/glowingbordercard";
import { InteractiveInput } from "@/components/UI/interactive-input";
import ModernLoader from "@/components/UI/modern-loader";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight, Loader2, Paperclip, Globe, Zap, PenTool, Bot, Mic, X, Play, ArrowUp } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { useMediaQuery } from "react-responsive";
import AvatarGroup from "@/components/UI/avatar-group";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { TrustedUsers } from "@/components/ui/trusted-users";
import Link from "next/link";

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    images?: string[];
};

// User Avatars for consistent identity per session (Dynamic selection)
const USER_AVATARS = [
    { src: "https://i.pravatar.cc/150?u=a042581f4e29026024d", alt: "Google Ads Expert" },
    { src: "https://i.pravatar.cc/150?u=a04258a2462d826712d", alt: "Strategist" },
    { src: "https://i.pravatar.cc/150?u=a042581f4e29026704d", alt: "AI Advisor" },
    { src: "https://i.pravatar.cc/150?u=a04258114e29026302d", alt: "Analyst" },
];

// Synchronized Scenarios: Pairs the Typewriter Prompt with the Short Industry Name for Buttons
const SCENARIOS = [
    { industry: "Real Estate", prompt: "Create a campaign for luxury apartments in Dubai..." },
    { industry: "Coffee Shop", prompt: "Promote a new Coffee Shop opening in London..." },
    { industry: "SaaS App", prompt: "Generate leads for a B2B SaaS project management tool..." },
    { industry: "Dental Clinic", prompt: "Get more appointments for a local Dental Clinic..." },
    { industry: "Fashion Store", prompt: "Boost sales for an online vintage Fashion Store..." },
    { industry: "Fitness Gym", prompt: "Sign up new members for a 24/7 Fitness Gym..." },
    { industry: "Local Bakery", prompt: "Advertise fresh pastries for a Local Bakery..." },
    { industry: "Law Firm", prompt: "Find clients for a corporate Law Firm..." },
    { industry: "Online Course", prompt: "Sell more enrollments for a Python Online Course..." },
    { industry: "Travel Agency", prompt: "Book more holiday packages for a Travel Agency..." },
    { industry: "Pet Store", prompt: "Increase foot traffic for a local Pet Store..." },
    { industry: "Car Rental", prompt: "Get bookings for a luxury Car Rental service..." }
];

export default function AdCreationPrompt() {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    // State for dynamic user avatar
    const [userAvatar, setUserAvatar] = useState(USER_AVATARS[0]);

    // Typewriter State
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [typewriterText, setTypewriterText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(50);

    const currentScenario = SCENARIOS[currentScenarioIndex];

    useEffect(() => {
        // Randomly select an avatar on mount to simulate different users/conversations
        setUserAvatar(USER_AVATARS[Math.floor(Math.random() * USER_AVATARS.length)]);
        setIsMounted(true);
    }, []);

    // Typewriter Logic
    useEffect(() => {
        const handleType = () => {
            const fullText = currentScenario.prompt;

            if (isDeleting) {
                setTypewriterText(prev => fullText.substring(0, prev.length - 1));
                setTypingSpeed(30); // Faster deleting
            } else {
                setTypewriterText(prev => fullText.substring(0, prev.length + 1));
                setTypingSpeed(50); // Normal typing
            }

            if (!isDeleting && typewriterText === fullText) {
                // Finished typing, wait before deleting
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && typewriterText === "") {
                // Finished deleting, move to next scenario
                setIsDeleting(false);
                setCurrentScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
            }
        };

        const timer = setTimeout(handleType, typingSpeed);
        return () => clearTimeout(timer);
    }, [typewriterText, isDeleting, typingSpeed, currentScenario.prompt]);

    // New ref for the scrollable chat container
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Responsive Breakpoints
    const isDesktop = useMediaQuery({ minWidth: 1024 });
    const isMobile = useMediaQuery({ maxWidth: 767 });

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
        // Scroll logic: Anchor the latest user message to the top to show the Q&A flow clearly
        const lastMessageIndex = messages.length - 1;
        if (lastMessageIndex >= 0) {
            const lastMessage = messages[lastMessageIndex];

            // If User sends: Scroll User Message to Top
            // If Assistant sends: Scroll Previous Message (User Message) to Top to keep context
            let targetIndex = -1;

            if (lastMessage.role === 'user') {
                targetIndex = lastMessageIndex;
            } else if (lastMessage.role === 'assistant' && lastMessageIndex > 0) {
                targetIndex = lastMessageIndex - 1;
            }

            if (targetIndex !== -1) {
                const element = document.getElementById(`message-${targetIndex}`);
                if (element && chatContainerRef.current) {
                    // setTimeout ensures DOM is ready after render
                    setTimeout(() => {
                        const container = chatContainerRef.current;
                        if (!container) return;

                        const containerRect = container.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();

                        // Current scroll + distance from top of container
                        const relativeTop = elementRect.top - containerRect.top;

                        container.scrollTo({
                            top: container.scrollTop + relativeTop - 10, // -10 for a little padding
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            }
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
                recognition.interimResults = false; // Set to false to prevent duplication loops
                recognition.lang = 'ar-SA';

                recognition.onstart = () => setIsRecording(true);
                recognition.onend = () => {
                    if (isRecording) setIsRecording(false);
                };

                recognition.onresult = (event: any) => {
                    // With interimResults=false, we only get final results here
                    const transcript = event.results[event.results.length - 1][0].transcript;
                    if (transcript) {
                        setPrompt(prev => prev + (prev && !prev.endsWith(' ') ? " " : "") + transcript);
                    }
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

        // Auto-stop recording if active
        if (isRecording) {
            setIsRecording(false);
            (window as any).speechRecognitionInstance?.stop();
        }

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
                    className="relative max-w-6xl mx-auto h-[40rem] md:h-[45rem] w-full bg-transparent transition-all duration-300 hover:shadow-3xl overflow-visible"
                >
                    {/* Content Container */}
                    <div className="h-full w-full overflow-hidden rounded-2xl bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative flex flex-col transition-all duration-300 hover:shadow-purple-500/10 hover:border-white/20">
                        {/* Mac Window Header */}
                        <div className="h-10 w-full bg-white/5 border-b border-white/10 flex items-center px-4 gap-2 flex-shrink-0 backdrop-blur-md">
                            <div className="h-3 w-3 rounded-full bg-[#FF5F56]"></div>
                            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]"></div>
                            <div className="h-3 w-3 rounded-full bg-[#27C93F]"></div>
                        </div>

                        {/* Main App Area */}
                        <div className={`flex-1 flex flex-col items-center w-full h-full overflow-hidden ${isMobile ? 'p-3 py-4' : 'p-6 md:p-10'}`}>

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
                                    <h2 className={`text-center !mb-8 !text-[24px] md:!text-[28px] lg:!text-[34px] xl:!text-[36px] -tracking-[.5px] md:-tracking-[.6px] lg:-tracking-[.8px] xl:-tracking-[1px] !leading-[1.2] !font-bold !text-white`}>
                                        <span className="!text-white">
                                            Build your Google Ads in seconds with AI magic
                                        </span>
                                    </h2>

                                    {/* 3. Quick Suggestion Chips - Dynamic & Synced with Typewriter */}
                                    <div className="flex flex-wrap justify-center gap-3 w-full my-3 md:my-8">
                                        {[
                                            { icon: Zap, text: `Promote ${currentScenario.industry}`, prompt: `Create a high-converting ad campaign for ${currentScenario.industry}` },
                                            { icon: Search, text: `${currentScenario.industry} KW`, prompt: `Find the best high-intent keywords for ${currentScenario.industry}` },
                                            { icon: PenTool, text: `Ad Copy`, prompt: `Write compelling ad headlines and descriptions for ${currentScenario.industry}` }
                                        ].map((item, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setPrompt(item.prompt)} // Use item.prompt which has the full context
                                                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1e1e2d] border border-white/5 text-gray-300 hover:bg-[#252536] hover:border-purple-500/30 transition-all text-sm md:text-base font-medium group active:scale-95 animate-in fade-in zoom-in duration-300"
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
                                    className="flex-1 w-full max-w-7xl mb-2 overflow-y-auto space-y-4 px-2 custom-scrollbar overscroll-contain [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-[3px]"
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
                                                id={`message-${index}`}
                                                initial={{ opacity: 0, y: 10 }} // Reduced motion distance for smoother feel
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {message.role === 'assistant' && (
                                                    <Bot className="w-9 h-9 text-[#8b5cf6] drop-shadow-sm flex-shrink-0" />
                                                )}

                                                <div className={`
                                                max-w-[85%] rounded-2xl p-3 shadow-md relative overflow-hidden
                                                ${message.role === 'user'
                                                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-purple-500/10 rounded-tr-sm'
                                                        : 'bg-[#1a1a2e]/95 backdrop-blur-md border border-purple-500/20 text-gray-100 shadow-purple-500/5 rounded-tl-sm'
                                                    }
                                                group transition-all duration-300 hover:shadow-lg
                                            `}>
                                                    {/* Decorative subtle glow for AI messages */}
                                                    {message.role === 'assistant' && (
                                                        <div className="absolute -top-10 -left-10 w-16 h-16 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-500"></div>
                                                    )}

                                                    {message.role === 'assistant' ? (
                                                        <div
                                                            className="prose prose-invert prose-sm max-w-none [&>p]:leading-relaxed [&>ul]:my-1 [&>ul>li]:my-0.5 font-light tracking-wide"
                                                            dir={/[\u0600-\u06FF]/.test(message.content) ? 'rtl' : 'ltr'}
                                                            style={{ textAlign: /[\u0600-\u06FF]/.test(message.content) ? 'right' : 'left' }}
                                                        >
                                                            <ReactMarkdown>{message.content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        <p
                                                            className="text-sm leading-relaxed font-medium"
                                                            dir={/[\u0600-\u06FF]/.test(message.content) ? 'rtl' : 'ltr'}
                                                            style={{ textAlign: /[\u0600-\u06FF]/.test(message.content) ? 'right' : 'left' }}
                                                        >
                                                            {message.content}
                                                        </p>
                                                    )}
                                                </div>

                                                {message.role === 'user' && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-md shadow-blue-500/30 ring-1 ring-blue-400/50 overflow-hidden">
                                                            <img
                                                                src={userAvatar.src}
                                                                alt={userAvatar.alt}
                                                                className="w-full h-full object-cover"
                                                            />
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

                                <div className={`bg-black/30 backdrop-blur-xl border border-white/10 ${isMobile ? 'p-2 rounded-xl' : 'px-4 py-3 rounded-2xl'} shadow-lg transition-all duration-300 hover:border-purple-500/30 hover:shadow-purple-500/10`}>

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

                                    {/* Input Area - Textarea with Standard Placeholder + Custom Typewriter Overlay */}
                                    <div className="relative w-full">
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
                                            // Empty placeholder when messages exist (so no typewriter), standard text otherwise
                                            placeholder={messages.length === 0 ? "" : "Type your question here..."}
                                            rows={1}
                                            className="w-full p-2 bg-transparent text-gray-100 placeholder-transparent focus:outline-none resize-none text-base font-medium leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed mb-0 relative z-10"
                                        />

                                        {/* Custom Typewriter Overlay (Only visible when empty & initial state) */}
                                        {messages.length === 0 && !prompt && (
                                            <div className="absolute top-0 left-0 w-full h-full p-2 pointer-events-none flex items-start z-0 overflow-hidden">
                                                <span className="text-gray-500 text-base font-medium leading-relaxed whitespace-pre-wrap">
                                                    {typewriterText}
                                                    <span className="animate-pulse text-purple-500 font-bold ml-0.5 inline-block">|</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

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
                                            {isRecording && (
                                                <span className="text-red-500 font-medium text-sm animate-pulse whitespace-nowrap hidden md:inline-block">
                                                    Recording...
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={toggleRecording}
                                                className={`p-2 rounded-lg transition-all active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                            >
                                                <Mic size={20} />
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isLoading || (!prompt.trim() && selectedImages.length === 0)}
                                                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={20} className="animate-spin" />
                                                ) : (
                                                    <ArrowUp size={20} className="text-white" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>



                        </div>
                    </div>

                    {/* CTA Buttons - Moved OUTSIDE the card, below it */}
                    {messages.length > 0 && (
                        <div className="mt-8 flex justify-center w-full relative z-40 pb-10">
                            <GlowButton
                                onClick={handleCreateCampaign}
                                variant="blue"
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white shadow-2xl shadow-purple-500/20"
                            >
                                <span className="flex items-center gap-2 text-lg px-6 py-1">
                                    <Sparkles className="h-5 w-5 text-purple-400" />
                                    Start Campaign
                                    <ArrowRight className="h-5 w-5 text-purple-400" />
                                </span>
                            </GlowButton>
                        </div>
                    )}
                </div>

                {/* Trust Badge & CTAs - Migrated from HeroSection */}
                <div className="flex flex-col items-center mt-6 md:mt-12 space-y-8 relative z-40 pb-10">
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
                            "ring-purple-500", "ring-blue-500", "ring-pink-500", "ring-green-500", "ring-orange-500",
                        ]}
                    />

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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

                    <p className="text-center text-gray-500 text-sm">
                        ✓ No credit card required &nbsp;•&nbsp; ✓ 14-day free trial &nbsp;•&nbsp; ✓ Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
}
