"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Mic, ArrowUp, Loader2, Plus, MessageSquare, Palette, AudioLines } from 'lucide-react';
import { TrustedUsers } from "@/components/ui/trusted-users";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Login from "@/components/ui/login";

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
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [activeUsersCount, setActiveUsersCount] = useState(2847); // Default start
    const router = useRouter();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate daily active users - unique every single day, never repeats
    useEffect(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const dayOfMonth = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const dayOfYear = Math.floor((today.getTime() - new Date(year, 0, 0).getTime()) / 86400000);

        // Complex seed: combines multiple factors to ensure uniqueness forever
        const uniqueSeed = (year * 366 + dayOfYear) * 7 + dayOfWeek;

        // Multiple hash-like transformations for true randomness
        const hash1 = Math.abs(Math.sin(uniqueSeed * 12.9898) * 43758.5453) % 1;
        const hash2 = Math.abs(Math.cos(uniqueSeed * 78.233 + dayOfMonth) * 28001.8384) % 1;
        const hash3 = Math.abs(Math.sin(uniqueSeed * 43.758 + month * 17) * 93751.6982) % 1;

        // Base range: 200 - 900
        const baseNumber = 200 + (hash1 * 700);

        // Add weekend boost
        let weekendBoost = 0;
        if (dayOfWeek === 5 || dayOfWeek === 6) {
            weekendBoost = 50 + (hash2 * 150); // +50 to +200 on weekends
        }

        // Final unique digits (0-99) to avoid round numbers
        const lastDigits = Math.floor(hash3 * 99) + 1;

        // Combine: base + boost, then replace last 2 digits
        const rawNumber = Math.floor(baseNumber + weekendBoost);
        const dailyCount = Math.floor(rawNumber / 100) * 100 + lastDigits;

        setActiveUsersCount(dailyCount);
    }, []);

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

    const handleRedirectToSignIn = () => {
        setIsLoginOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Redirect to sign-in page
        setIsLoginOpen(true);
    };

    return (
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <section className="relative z-40 px-4 mb-16">
                <div className="mx-auto max-w-4xl">
                    {/* Lovable-style Input Box - Bimodal UI */}
                    <form
                        onSubmit={handleSubmit}
                        className="group flex flex-col gap-2 p-3 w-full rounded-[32px] border border-zinc-700/50 bg-zinc-900/80 backdrop-blur-xl text-base shadow-lg shadow-xl ring-1 ring-white/[0.05] transition-all duration-150 ease-in-out focus-within:ring-white/[0.1] hover:ring-white/[0.08] pointer-events-auto"
                    >
                        {/* Textarea Container */}
                        <div className="relative flex flex-1 items-center">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleRedirectToSignIn();
                                    }
                                }}
                                className="flex w-full rounded-md px-2 py-2 transition-colors duration-150 ease-in-out placeholder:text-gray-400 focus-visible:outline-none resize-none border-none text-base leading-snug max-h-[max(35svh,5rem)] bg-transparent text-zinc-900 dark:text-white flex-1"
                                style={{ height: "100px" }}
                                placeholder=""
                                maxLength={50000}
                            />
                            {/* Typewriter placeholder */}
                            {!prompt && (
                                <div className="absolute top-2 left-2 pointer-events-none text-zinc-500 dark:text-zinc-400 text-base">
                                    {typewriterText}
                                    <span className="animate-pulse text-purple-500 ml-0.5">|</span>
                                </div>
                            )}
                        </div>

                        {/* Tools Bar - Lovable Style */}
                        <div className="flex gap-1.5 flex-wrap items-center">
                            {/* Plus Button */}
                            <button
                                type="button"
                                onClick={handleRedirectToSignIn}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
                                onClick={handleRedirectToSignIn}
                                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors"
                            >
                                <Paperclip className="h-4 w-4" />
                                <span className="hidden md:inline">Attach</span>
                            </button>


                            {/* Right Side Tools */}
                            <div className="ml-auto flex items-center gap-1.5">
                                {/* Chat Button */}
                                <button
                                    type="button"
                                    onClick={handleRedirectToSignIn}
                                    className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white text-sm font-medium transition-colors"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Chat</span>
                                </button>

                                {/* Audio Button */}
                                <button
                                    type="button"
                                    onClick={handleRedirectToSignIn}
                                    className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                >
                                    <AudioLines className="h-5 w-5" />
                                </button>

                                {/* Send Button - Accent Color */}
                                <button
                                    type="button"
                                    onClick={handleRedirectToSignIn}
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all shadow-lg"
                                >
                                    <ArrowUp className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Trust Badge & CTAs */}
                    <div className="flex flex-col items-center mt-12 space-y-8">
                        <TrustedUsers targetCount={activeUsersCount} />

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleRedirectToSignIn}
                                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/50 flex items-center gap-2 hover:scale-105"
                            >
                                Start Free Plan
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('video-demo')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-8 py-4 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/20 text-zinc-900 dark:text-white rounded-2xl font-semibold transition-all duration-200 flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                Watch Demo
                            </button>
                        </div>

                        <p className="text-center text-zinc-600 dark:text-zinc-500 text-sm">
                            ✓ Free plan available &nbsp;•&nbsp; ✓ No hidden fees &nbsp;•&nbsp; ✓ Cancel anytime
                        </p>
                    </div>
                </div>
                <DialogContent className="p-0 bg-transparent border-none shadow-none max-w-fit w-auto [&>button]:hidden">
                    <Login />
                </DialogContent>
            </section>
        </Dialog>
    );
}
