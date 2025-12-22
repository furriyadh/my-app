"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type AnimationDirection = "loop" | "vloop";

interface LogoItem {
  icon: React.ReactNode;
  label: string;
}

interface LogoStepperProps {
  logos: LogoItem[];
  animationDuration?: number;
  animationDelay?: number;
  direction?: AnimationDirection;
  visibleCount?: number;
}

export const LogoStepper: React.FC<LogoStepperProps> = ({
  logos,
  animationDuration = 0.6,
  animationDelay = 1.2,
  direction = "loop",
  visibleCount = 5,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length);
    }, animationDelay * 1000);

    return () => clearInterval(interval);
  }, [logos.length, animationDelay]);

  const getVisibleLogos = () => {
    const visible = [];
    const offset = Math.floor(visibleCount / 2);

    for (let i = -offset; i <= offset; i++) {
      const index = (currentIndex + i + logos.length) % logos.length;
      visible.push({
        logo: logos[index],
        originalIndex: index,
        position: i,
      });
    }

    return visible;
  };

  const visibleLogos = getVisibleLogos();

  return (
    <div className="relative w-full flex items-start justify-center overflow-hidden py-8">
      <div
        className="flex items-start justify-center gap-8"
        style={{ width: "fit-content" }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visibleLogos.map(({ logo, originalIndex, position }) => {
            let lineOpacity = 0;
            if (position === 0) lineOpacity = 1;
            else if (position === -1) lineOpacity = 0.3;
            else if (position === 1) lineOpacity = 0.3;

            return (
              <motion.div
                key={originalIndex}
                layout="position"
                initial={{
                  x: direction === "loop" ? 120 : -120,
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  x: 0,
                  opacity: position === 0 ? 1 : 0.3,
                  scale: position === 0 ? 1 : 0.75,
                }}
                exit={{
                  x: direction === "loop" ? -120 : 120,
                  opacity: 0,
                  scale: 0.7,
                }}
                transition={{
                  duration: animationDuration,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="flex flex-col items-center flex-shrink-0 min-h-[240px] w-[120px]"
              >
                <motion.div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 hover:border-gray-600 transition-all duration-300">
                  <div className="w-16 h-16 flex items-center justify-center">
                    {logo.icon}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: lineOpacity }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: animationDuration,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="flex flex-col items-center mt-6 h-32"
                >
                  <div className="w-px h-20 mb-4 bg-gray-700" />
                  <span className="text-gray-400 uppercase text-sm font-semibold tracking-wider whitespace-nowrap">
                    {logo.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

