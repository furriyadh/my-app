"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, Mic, ArrowUp, Loader2, Plus, MessageSquare, Palette, AudioLines } from 'lucide-react';
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

    const handleRedirectToSignIn = () => {
        router.push('/authentication/sign-in');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Redirect to sign-in page
        router.push('/authentication/sign-in');
    };

    return (
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
                    <TrustedUsers
                        avatars={[
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
                            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
                        ]}
                        rating={5}
                        totalUsersText={412856}
                        caption="Trusted by"
                        starColorClass="text-yellow-400"
                        ringColors={[
                            "ring-purple-500", "ring-blue-500", "ring-pink-500", "ring-green-500", "ring-orange-500", "ring-cyan-500", "ring-red-500", "ring-indigo-500",
                        ]}
                    />

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/authentication/sign-in"
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

                    <p className="text-center text-zinc-600 dark:text-zinc-500 text-sm">
                        ✓ Free plan available &nbsp;•&nbsp; ✓ No hidden fees &nbsp;•&nbsp; ✓ Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
}
