"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Mic, ArrowUp, Loader2, Plus, MessageSquare, Palette, BarChart3 } from 'lucide-react';
import { TrustedUsers } from "@/components/ui/trusted-users";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

// Synchronized Scenarios for typewriter
const SCENARIOS = [
    { industry: "Real Estate", prompt: "Create a campaign for luxury apartments in Dubai..." },
    { industry: "Coffee Shop", prompt: "Promote a new Coffee Shop opening in London..." },
    { industry: "SaaS App", prompt: "Generate leads for a B2B SaaS project management tool..." },
    { industry: "Pet Store", prompt: "Increase foot traffic for a local Pet Store..." },
];

export default function AdCreationPrompt() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [typewriterText, setTypewriterText] = useState("");
    const [scenarioIndex, setScenarioIndex] = useState(0);
    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Typewriter effect
    useEffect(() => {
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
    }, [scenarioIndex]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Future: Handle file upload logic here
            console.log("Files selected:", files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);

        // Save prompt to localStorage to persist across navigation
        if (typeof window !== 'undefined') {
            localStorage.setItem('campaign_prompt', prompt);
        }

        router.push('/google-ads/campaigns/new');
    };

    return (
        <section className="relative z-40 px-4 mb-16">
            <div className="mx-auto max-w-4xl">
                {/* Lovable-style Input Box - Exact Match */}
                <form
                    onSubmit={handleSubmit}
                    className="group flex flex-col gap-2 p-3 w-full rounded-[32px] border border-white/20 dark:border-zinc-700/50 bg-white/10 dark:bg-zinc-900/50 backdrop-blur-xl text-base shadow-xl ring-1 ring-black/[0.05] dark:ring-white/[0.05] transition-all duration-150 ease-in-out focus-within:ring-black/[0.1] dark:focus-within:ring-white/[0.1] hover:ring-black/[0.08] dark:hover:ring-white/[0.08] pointer-events-auto"
                >
                    {/* Textarea Container */}
                    <div className="relative flex flex-1 items-center">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            className="flex w-full rounded-md px-2 py-2 transition-colors duration-150 ease-in-out placeholder:text-gray-400 focus-visible:outline-none resize-none border-none text-base leading-snug max-h-[max(35svh,5rem)] bg-transparent text-zinc-900 dark:text-white flex-1"
                            style={{ height: "100px" }}
                            placeholder=""
                            maxLength={50000}
                        />
                        {/* Typewriter placeholder */}
                        {!prompt && (
                            <div className="absolute top-2 left-2 pointer-events-none text-gray-400 dark:text-gray-500 text-base">
                                {typewriterText}
                                <span className="animate-pulse text-purple-500 ml-0.5">|</span>
                            </div>
                        )}
                    </div>

                    {/* Tools Bar */}
                    <div className="flex gap-1 flex-wrap items-center">
                        {/* Plus Button */}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out border border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 h-10 w-10 rounded-full p-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white md:h-8 md:w-8"
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
                            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out border border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 py-2 h-10 w-10 gap-1.5 rounded-full px-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white md:h-8 md:w-fit"
                        >
                            <Paperclip className="h-4 w-4" />
                            <span className="hidden md:flex">Attach</span>
                        </button>

                        {/* Theme Button */}
                        <button
                            type="button"
                            className="items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out border border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 px-3 py-2 gap-1.5 hidden h-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white md:flex"
                            disabled
                        >
                            <div className="flex min-w-0 flex-1 items-center gap-1">
                                <Palette className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">Theme</span>
                            </div>
                            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.526 15.582a.75.75 0 0 0 1.004-.052l5-5a.75.75 0 1 0-1.06-1.06L12 13.94 7.53 9.47a.75.75 0 1 0-1.06 1.06l5 5z" />
                            </svg>
                        </button>

                        {/* Right Side Tools */}
                        <div className="ml-auto flex items-center gap-1">
                            {/* Chat Button */}
                            <button
                                type="button"
                                className="items-center justify-center whitespace-nowrap text-sm transition-colors duration-100 ease-in-out border border-gray-200 dark:border-white/10 bg-transparent flex h-10 gap-1.5 rounded-full px-3 py-0 font-normal text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 md:h-8 md:font-medium"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Chat
                            </button>

                            {/* Voice/Wave Button */}
                            <button
                                type="button"
                                className="gap-2 whitespace-nowrap text-sm font-medium ease-in-out border border-gray-200 dark:border-white/10 bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 relative z-10 flex shrink-0 rounded-full p-0 text-gray-500 dark:text-gray-400 transition-opacity duration-150 hover:text-gray-900 dark:hover:text-white items-center justify-center h-10 w-10 md:h-8 md:w-8"
                            >
                                <BarChart3 className="relative z-10 h-5 w-5" />
                            </button>

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 dark:bg-blue-600 transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 md:h-8 md:w-8"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                ) : (
                                    <ArrowUp className="h-6 w-6 text-white" />
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Trust Badge & CTAs */}
                <div className="flex flex-col items-center mt-12 space-y-8">
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
                            className="px-8 py-4 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 text-zinc-900 dark:text-white rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Watch Demo
                        </Link>
                    </div>

                    <p className="text-center text-zinc-600 dark:text-gray-500 text-sm">
                        ✓ No credit card required &nbsp;•&nbsp; ✓ 14-day free trial &nbsp;•&nbsp; ✓ Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
}
