"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TrustedUsersProps {
  className?: string;
  targetCount?: number;
}

const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=45",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=46",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=47",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=48",
];

export const TrustedUsers: React.FC<TrustedUsersProps> = ({
  className = "",
  targetCount = 2847,
}) => {
  const [count, setCount] = useState(0);

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
  }, [targetCount]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full py-2 px-4 shadow-lg transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_8px_rgba(139,92,246,0.5),0_0_80px_20px_rgba(139,92,246,0.2)] hover:border-purple-500/50",
        className
      )}
    >
      {/* LIVE Indicator */}
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-xs font-bold text-green-400 tracking-wider">LIVE</span>
      </div>

      {/* Separator */}
      <div className="h-5 w-[1px] bg-white/20"></div>

      {/* Avatars */}
      <div className="flex -space-x-2">
        {avatars.map((avatar, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full border-2 border-zinc-900 bg-zinc-800 overflow-hidden"
          >
            <img
              src={avatar}
              alt={`User ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="flex flex-col">
        <span className="text-lg font-bold text-white leading-none flex items-center gap-0.5">
          {count.toLocaleString()}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">+</span>
        </span>
        <span className="text-[10px] text-zinc-400 font-medium">Users active in the last 24h</span>
      </div>
    </div>
  );
};
