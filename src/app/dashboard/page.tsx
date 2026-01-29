"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, ArrowUp, Loader2, Plus, MessageSquare, Mic, MicOff, Bot, User, RotateCcw, Rocket } from 'lucide-react';
import AITextLoading from "@/components/kokonutui/ai-text-loading";
import { createClient } from "@/utils/supabase/client";
import { useAISpeechToText } from "@/lib/hooks/useAISpeechToText";
import { useLanguage } from "@/lib/hooks/useLanguage";

// Types
interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

// Parse message content and extract buttons
interface ParsedContent {
    text: string;
    buttons: { label: string; url: string }[];
}

function parseMessageWithButtons(content: string): ParsedContent {
    const buttonRegex = /\[BUTTON:([^\]]+):([^\]]+)\]/g;
    const buttons: { label: string; url: string }[] = [];

    let match;
    while ((match = buttonRegex.exec(content)) !== null) {
        buttons.push({
            label: match[1],
            url: match[2]
        });
    }

    // Remove button syntax from text
    const text = content.replace(buttonRegex, '').trim();

    return { text, buttons };
}

// Synchronized Scenarios for typewriter
const SCENARIOS = [
    { industry: "Real Estate", prompt: "Create a campaign for luxury apartments in Dubai..." },
    { industry: "Coffee Shop", prompt: "Promote a new Coffee Shop opening in London..." },
    { industry: "SaaS App", prompt: "Generate leads for a B2B SaaS project management tool..." },
    { industry: "Pet Store", prompt: "Increase foot traffic for a local Pet Store..." },
    { industry: "E-commerce", prompt: "Boost online sales for a fashion e-commerce store..." },
];

// AI Loading texts
const AI_LOADING_TEXTS = [
    "Thinking...",
    "Analyzing your request...",
    "Generating campaign ideas...",
    "Optimizing for conversions...",
    "Almost ready...",
];

export default function DashboardAIPage() {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [typewriterText, setTypewriterText] = useState("");
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const [userName, setUserName] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get user's preferred language for speech recognition
    const { language: appLanguage } = useLanguage();

    // Map app language codes to Web Speech API language codes
    const getSpeechLanguage = (lang: string): string => {
        const languageMap: Record<string, string> = {
            'en': 'en-US',
            'ar': 'ar-SA',
            'de': 'de-DE',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
        };
        return languageMap[lang] || 'en-US';
    };

    // Fetch User Name
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Get name from metadata or fall back to email
                const name = user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split('@')[0] ||
                    "Client";
                setUserName(name);
            }
        };
        fetchUser();
    }, []);



    // AI Speech-to-Text Hook - Uses user's preferred language
    const {
        isRecording: isListening,
        isProcessing: isTranscribing,
        error: speechError,
        toggleRecording: toggleListening,
        stopRecording: stopListening,
        isSupported: isSpeechSupported,
    } = useAISpeechToText({
        onTranscript: (text) => {
            setPrompt((prev) => prev + (prev ? " " : "") + text);
        },
        onError: (error) => {
            console.error("Speech error:", error);
        },
        silenceDelay: 2000, // 2 seconds of silence = auto send
        language: getSpeechLanguage(appLanguage), // Use user's preferred language
    });

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isAIThinking]);

    // Auto-focus textarea on page load and after each message
    useEffect(() => {
        textareaRef.current?.focus();
    }, [messages, isAIThinking]);

    // Typewriter effect (only when no messages and not listening)
    useEffect(() => {
        if (messages.length > 0 || isListening || prompt) return;

        const scenario = SCENARIOS[scenarioIndex];
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            if (!isDeleting) {
                if (charIndex <= scenario.prompt.length) {
                    setTypewriterText(scenario.prompt.slice(0, charIndex));
                    charIndex++;
                } else {
                    setTimeout(() => { isDeleting = true; }, 2000);
                }
            } else {
                if (charIndex > 0) {
                    setTypewriterText(scenario.prompt.slice(0, charIndex - 1));
                    charIndex--;
                } else {
                    isDeleting = false;
                    setScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
                }
            }
        };

        const interval = setInterval(type, isDeleting ? 30 : 80);
        return () => clearInterval(interval);
    }, [scenarioIndex, isListening, prompt, messages.length]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            console.log("Files selected:", files);
        }
    };

    const handleVoiceInput = () => {
        if (!isSpeechSupported) {
            alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
            return;
        }
        toggleListening();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isAIThinking) return;

        // Stop listening when sending message
        if (isListening) {
            stopListening();
        }

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: prompt.trim(),
            timestamp: new Date(),
        };

        // Add user message and clear input
        setMessages((prev) => [...prev, userMessage]);
        setPrompt("");
        setIsAIThinking(true);

        try {
            // Build conversation history for the API
            const conversationHistory = messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            }));

            // Call the AI advisor API
            const response = await fetch("/api/ai-advisor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: userMessage.content,
                    conversationHistory,
                }),
            });

            const data = await response.json();

            // Add AI response
            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.strategy || "عذراً، حدث خطأ مؤقت. يرجى المحاولة مرة أخرى.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI Chat Error:", error);

            // Add error message
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsAIThinking(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setPrompt("");
    };

    // Get display text for placeholder
    // Get display text for placeholder
    const getPlaceholderText = () => {
        if (isTranscribing) {
            return "Processing audio...";
        }
        if (isListening) {
            return "🎤 Recording...";
        }
        if (hasMessages) {
            return "Type a message...";
        }
        return typewriterText;
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="relative h-[calc(100vh-120px)] overflow-hidden flex flex-col">
            {/* Header with New Chat button (always visible for spacing) */}
            <div className="flex justify-end px-4 py-2 min-h-[48px]">
                {hasMessages && (
                    <button
                        onClick={handleNewChat}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        New Chat
                    </button>
                )}
            </div>

            {/* Main Content Area - Takes remaining space */}
            <div className="relative flex flex-col flex-1 px-4 overflow-hidden">

                {/* Title Section (shown only when no messages) */}
                {!hasMessages && (
                    <div className="flex flex-col items-center justify-center flex-1">
                        {/* Animated Connector Line */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-1 h-6 bg-gradient-to-b from-transparent via-purple-500 to-purple-500 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        </div>

                        {/* Welcome Header */}
                        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <h2 className="text-2xl md:text-3xl font-medium text-gray-500 dark:text-zinc-400 mb-2">
                                Welcome, <span className="text-gray-900 dark:text-white font-semibold">{userName}</span> 👋
                            </h2>
                        </div>

                        {/* Main Title */}
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Create high-converting campaigns by
                            </h1>
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-1 h-8 bg-purple-500 rounded-full" />
                                <span className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent">
                                    chatting with AI
                                </span>
                                <span className="w-1 h-8 bg-purple-500 rounded-full" />
                            </div>
                        </div>

                        {/* Connector dot */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-transparent rounded-full animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Chat Messages Area */}
                {hasMessages && (
                    <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full mb-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent hover:scrollbar-thumb-purple-500/50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {/* AI Avatar */}
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                                        : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                        }`}
                                >
                                    {message.role === "assistant" ? (
                                        <>
                                            {/* Parse and render AI message with buttons */}
                                            {(() => {
                                                const parsed = parseMessageWithButtons(message.content);
                                                return (
                                                    <>
                                                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                                                            {parsed.text}
                                                        </div>
                                                        {parsed.buttons.length > 0 && (
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {parsed.buttons.map((btn, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => router.push(btn.url)}
                                                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                                                    >
                                                                        {btn.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </>
                                    ) : (
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                                            {message.content}
                                        </div>
                                    )}
                                </div>

                                {/* User Avatar */}
                                {message.role === "user" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-600 flex items-center justify-center">
                                        <User className="h-5 w-5 text-gray-600 dark:text-zinc-300" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* AI Thinking Indicator */}
                        {isAIThinking && (
                            <div className="flex gap-1 justify-start items-center">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="">
                                    <AITextLoading
                                        texts={AI_LOADING_TEXTS}
                                        interval={1500}
                                        className="!text-sm text-gray-500 dark:text-zinc-400 !p-0"
                                    />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* AI Chat Input Box */}
                <div className={`w-full max-w-4xl mx-auto ${hasMessages ? "" : ""}`}>
                    <form
                        onSubmit={handleSubmit}
                        className={`group flex flex-col gap-2 p-3 w-full rounded-[32px] border ${isListening
                            ? "border-red-500/50 ring-2 ring-red-500/30"
                            : "border-gray-200 dark:border-zinc-700/50"
                            } bg-white dark:bg-zinc-900/80 backdrop-blur-xl text-base shadow-lg ring-1 ring-gray-200/50 dark:ring-white/[0.05] transition-all duration-150 ease-in-out focus-within:ring-purple-500/50 focus-within:border-purple-500/50 hover:ring-gray-300 dark:hover:ring-white/[0.08]`}
                    >
                        {/* Textarea Container */}
                        <div className="relative flex flex-1 items-center">
                            <textarea
                                ref={textareaRef}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e as unknown as React.FormEvent);
                                    }
                                }}
                                className="flex w-full rounded-md px-2 py-2 transition-colors duration-150 ease-in-out placeholder:text-gray-400 focus-visible:outline-none resize-none border-none text-base leading-snug max-h-[max(35svh,5rem)] bg-transparent text-gray-900 dark:text-white flex-1"
                                style={{ height: hasMessages ? "60px" : "100px" }}
                                placeholder=""
                                maxLength={50000}
                                disabled={isAIThinking}
                            />
                            {/* Typewriter/Listening/Processing placeholder */}
                            {!prompt && !isAIThinking && (
                                <div className={`absolute top-2 left-2 pointer-events-none text-base flex items-center gap-2 ${isTranscribing ? "text-amber-500" :
                                    isListening ? "text-red-500" :
                                        "text-gray-500 dark:text-zinc-400"
                                    }`}>
                                    {isTranscribing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="animate-pulse font-medium">Processing audio...</span>
                                        </>
                                    ) : isListening ? (
                                        <>
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                            <span className="font-medium">Recording...</span>
                                        </>
                                    ) : (
                                        <>
                                            {getPlaceholderText()}
                                            <span className="animate-pulse ml-0.5 text-purple-500">|</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tools Bar */}
                        <div className="flex gap-1.5 flex-wrap items-center">
                            {/* Plus Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                                disabled={isAIThinking}
                            >
                                <Plus className="h-5 w-5" />
                            </button>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                onChange={handleFileSelect}
                            />

                            {/* Attach Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                                disabled={isAIThinking}
                            >
                                <Paperclip className="h-4 w-4" />
                                <span className="hidden md:inline">Attach</span>
                            </button>

                            {/* Right Side Tools */}
                            <div className="ml-auto flex items-center gap-1.5">
                                {/* Chat Button */}
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                                    disabled={isAIThinking}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Chat</span>
                                </button>

                                {/* Voice Button with animation */}
                                <button
                                    type="button"
                                    onClick={handleVoiceInput}
                                    className={`inline-flex items-center justify-center h-9 w-9 rounded-full transition-all ${isListening
                                        ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    disabled={isAIThinking}
                                    title={isListening ? "Stop listening" : "Start voice input"}
                                >
                                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                </button>

                                {/* Send Button */}
                                <button
                                    type="submit"
                                    disabled={isAIThinking || !prompt.trim()}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAIThinking ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <ArrowUp className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Speech Error Message */}
                    {speechError && (
                        <p className="mt-2 text-sm text-red-500 text-center">
                            {speechError}
                        </p>
                    )}
                </div>

                {/* Voice Listening Indicator */}
                {isListening && (
                    <div className="mt-4 flex flex-col items-center gap-3">
                        <div className="flex items-center justify-center gap-1 h-8">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-red-500 rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 100}%`,
                                        animationDelay: `${i * 0.05}s`,
                                        animationDuration: "0.5s",
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-red-500 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            Listening... Click mic to stop
                        </span>
                    </div>
                )}


                {/* Helper Text (only when no messages) */}
                {!hasMessages && (
                    <p className="mt-6 text-sm text-gray-600 dark:text-zinc-500 text-center max-w-xl mx-auto">
                        {isSpeechSupported
                            ? "Type or use your voice to describe your campaign goals. Our AI will create optimized Google Ads campaigns for you."
                            : "Describe your campaign goals, target audience, and budget. Our AI will create optimized Google Ads campaigns for you."
                        }
                    </p>
                )}
            </div>
        </div>
    );
}
