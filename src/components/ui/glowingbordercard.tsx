import React from "react";
import { cn } from "@/lib/utils";

type GlowingBorderCardProps = {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  className?: string;
};

export default function GlowingBorderCard({
  children,
  fromColor,
  toColor,
  className,
}: GlowingBorderCardProps) {
  return (
    <div className={cn("relative group", className)}>
      <div
        className="absolute -inset-0.5 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        style={{
          background: `linear-gradient(to right, rgb(147, 51, 234), rgb(147, 51, 234))`
        }}
      />
      <div className="relative flex items-center justify-center h-full rounded-lg p-4" style={{ backgroundColor: '#000000' }}>
        {children}
      </div>
    </div>
  );
}
