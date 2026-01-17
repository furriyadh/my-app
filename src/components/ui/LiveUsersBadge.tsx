"use client";

import { useEffect, useState } from "react";

const avatars = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=45",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=46",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=47",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=48",
];

export default function LiveUsersBadge() {
    const [count, setCount] = useState(0);
    const targetCount = 2847;

    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const increment = targetCount / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetCount) {
                setCount(targetCount);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="inline-flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 shadow-2xl">
            {/* LIVE Indicator */}
            <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-bold text-green-400 tracking-wider">LIVE</span>
            </div>

            {/* Separator */}
            <div className="h-6 w-[1px] bg-white/20"></div>

            {/* Avatars */}
            <div className="flex -space-x-2">
                {avatars.map((avatar, i) => (
                    <div
                        key={i}
                        className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 overflow-hidden"
                    >
                        <img
                            src={avatar}
                            alt={`User ${i + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Counter */}
            <div className="flex flex-col">
                <span className="text-2xl font-bold text-white leading-none flex items-center gap-0.5">
                    {count.toLocaleString()}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">+</span>
                </span>
                <span className="text-xs text-zinc-400 font-medium">Users active in the last 24h</span>
            </div>
        </div>
    );
}
