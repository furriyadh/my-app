"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdCreationPrompt() {
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);

        try {
            // 1. Save prompt to localStorage for handoff
            localStorage.setItem("initialAdPrompt", prompt);

            // 2. Check auth status
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                // 3a. User is logged in -> Go to Campaign Creation directly
                router.push("/campaign/new");
            } else {
                // 3b. User is NOT logged in -> Go to Sign Up
                router.push("/authentication/sign-up");
            }
        } catch (error) {
            console.error("Error starting ad creation:", error);
            setIsLoading(false);
        }
    };

    return (
        <section className="relative z-30 -mt-20 mb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="relative group">
                    {/* Glassmorphism Background with Neon Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl opacity-75 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                    <div className="relative relative flex flex-col items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">

                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                Build your ad in seconds with AI
                            </h2>
                        </div>

                        <form onSubmit={handleStart} className="w-full relative">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe your ad... (e.g., 'Create a video ad for my coffee shop opening')"
                                    className="w-full h-16 pl-6 pr-36 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-lg"
                                />

                                <button
                                    type="submit"
                                    disabled={isLoading || !prompt.trim()}
                                    className="absolute right-2 h-12 px-6 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Generate</span>
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-gray-500">
                            <span>Try:</span>
                            <button
                                onClick={() => setPrompt("Summer sale video for fashion brand")}
                                className="hover:text-cyan-400 transition-colors cursor-pointer"
                            >
                                "Summer sale video"
                            </button>
                            <span className="opacity-50">•</span>
                            <button
                                onClick={() => setPrompt("Real estate lead generation campaign")}
                                className="hover:text-purple-400 transition-colors cursor-pointer"
                            >
                                "Real estate leads"
                            </button>
                            <span className="opacity-50">•</span>
                            <button
                                onClick={() => setPrompt("App install ads for fitness tracker")}
                                className="hover:text-pink-400 transition-colors cursor-pointer"
                            >
                                "App install ads"
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
