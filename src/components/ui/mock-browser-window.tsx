"use client";

import { cn } from "@/lib/utils";
import { Globe, Lock, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

interface BrowserWindowProps {
    url?: string;
    children?: React.ReactNode;
    className?: string;
    imageSrc?: string;
    variant?: "chrome" | "safari";
}

export function BrowserWindow({
    url = "https://app.adspro.ai/dashboard",
    children,
    className,
    imageSrc,
    variant = "chrome",
}: BrowserWindowProps) {
    return (
        <div
            className={cn(
                "relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700/50 shadow-2xl",
                className
            )}
        >
            {/* Browser Header */}
            <div className="bg-zinc-800/90 backdrop-blur-sm border-b border-zinc-700/50 px-3 py-2">
                <div className="flex items-center gap-3">
                    {/* Traffic Lights */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors" />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                        <button className="p-1 rounded hover:bg-zinc-700/50 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-zinc-700/50 transition-colors">
                            <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-zinc-700/50 transition-colors">
                            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                    </div>

                    {/* URL Bar */}
                    <div className="flex-1 mx-2">
                        <div className="flex items-center gap-2 bg-zinc-900/80 rounded-lg px-3 py-1.5 border border-zinc-700/50">
                            <Lock className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs text-zinc-400 truncate font-mono">
                                {url}
                            </span>
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-zinc-500" />
                    </div>
                </div>
            </div>

            {/* Browser Content */}
            <div className="relative bg-zinc-950">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Dashboard Preview"
                        className="w-full h-auto"
                    />
                ) : (
                    children
                )}
            </div>
        </div>
    );
}

export default BrowserWindow;
