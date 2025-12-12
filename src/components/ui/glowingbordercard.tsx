import React from "react";
import { cn } from "@/lib/utils";

type GlowingBorderCardProps = {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  className?: string;
};

// Map Tailwind color names to RGB values
const colorMap: { [key: string]: string } = {
  'purple-600': 'rgb(147, 51, 234)',
  'purple-500': 'rgb(168, 85, 247)',
  'emerald-500': 'rgb(16, 185, 129)',
  'emerald-400': 'rgb(52, 211, 153)',
  'green-500': 'rgb(34, 197, 94)',
  'green-400': 'rgb(74, 222, 128)',
  'blue-500': 'rgb(59, 130, 246)',
  'blue-400': 'rgb(96, 165, 250)',
};

export default function GlowingBorderCard({
  children,
  fromColor,
  toColor,
  className,
}: GlowingBorderCardProps) {
  const fromRgb = colorMap[fromColor] || 'rgb(16, 185, 129)'; // Default to emerald-500
  const toRgb = colorMap[toColor] || 'rgb(74, 222, 128)';     // Default to green-400

  return (
    <div className={cn("relative group", className)}>
      <div
        className="absolute -inset-0.5 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        style={{
          background: `linear-gradient(to right, ${fromRgb}, ${toRgb})`
        }}
      />
      <div className="relative flex items-center justify-center h-full rounded-lg p-4" style={{ backgroundColor: '#000000' }}>
        {children}
      </div>
    </div>
  );
}
