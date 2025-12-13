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
  'violet-600': 'rgb(124, 58, 237)',
  'violet-500': 'rgb(139, 92, 246)',
  'emerald-500': 'rgb(16, 185, 129)',
  'emerald-400': 'rgb(52, 211, 153)',
  'green-500': 'rgb(34, 197, 94)',
  'green-400': 'rgb(74, 222, 128)',
  'blue-500': 'rgb(59, 130, 246)',
  'blue-400': 'rgb(96, 165, 250)',
  'cyan-500': 'rgb(6, 182, 212)',
  'cyan-400': 'rgb(34, 211, 238)',
  'amber-500': 'rgb(245, 158, 11)',
  'amber-400': 'rgb(251, 191, 36)',
  'yellow-500': 'rgb(234, 179, 8)',
  'yellow-400': 'rgb(250, 204, 21)',
  'orange-500': 'rgb(249, 115, 22)',
  'orange-400': 'rgb(251, 146, 60)',
  'red-500': 'rgb(239, 68, 68)',
  'red-400': 'rgb(248, 113, 113)',
  'rose-500': 'rgb(244, 63, 94)',
  'rose-400': 'rgb(251, 113, 133)',
};

export default function GlowingBorderCard({
  children,
  fromColor,
  toColor,
  className,
  noBackground = false,
  rounded = "lg",
}: GlowingBorderCardProps & { noBackground?: boolean; rounded?: "lg" | "xl" }) {
  const fromRgb = colorMap[fromColor] || 'rgb(16, 185, 129)'; // Default to emerald-500
  const toRgb = colorMap[toColor] || 'rgb(74, 222, 128)';     // Default to green-400

  return (
    <div className={cn("relative group", className)}>
      <div
        className={`absolute -inset-0.5 rounded-${rounded} blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt`}
        style={{
          background: `linear-gradient(to right, ${fromRgb}, ${toRgb})`
        }}
      />
      {noBackground ? (
        <div className={`relative h-full rounded-${rounded}`}>
          {children}
        </div>
      ) : (
        <div className={`relative flex items-center justify-center h-full rounded-${rounded} p-4`} style={{ backgroundColor: '#000000' }}>
          {children}
        </div>
      )}
    </div>
  );
}
