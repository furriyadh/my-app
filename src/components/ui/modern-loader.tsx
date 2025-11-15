"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import TypeAnimation from "@/components/ui/typeanimation";

interface ModernLoaderProps {
  words?: string[];
  currentStep?: number;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({
  words = [
    "Setting things up...",
    "Initializing modules...",
    "Almost ready...",
  ],
  currentStep,
}) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = useMemo(
    () => [
      "bg-gray-500",
      "bg-teal-500",
      "bg-blue-500",
      "bg-gray-600",
      "bg-pink-500",
    ],
    []
  );

  const BUFFER = 20;
  const MAX_LINES = 100;

  const generateLines = useCallback(
    (count = 20) =>
      Array.from({ length: count }, (_, idx) => ({
        id: Date.now() + idx,
        segments: Array.from(
          { length: Math.floor(Math.random() * 4) + 1 },
          () => ({
            width: `${Math.floor(Math.random() * 160) + 100}px`,
            color: colors[Math.floor(Math.random() * colors.length)],
            isCircle: Math.random() > 0.93,
            indent: Math.random() > 0.7 ? 1 : 0,
          })
        ),
      })),
    [colors]
  );

  const [lines, setLines] = useState(() => generateLines());

  const getVisibleRange = () => {
    const start = Math.max(0, currentLine - BUFFER);
    const end = Math.min(lines.length, currentLine + BUFFER);
    return { start, end };
  };

  const { start: visibleStart, end: visibleEnd } = getVisibleRange();

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentLine]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentLine((prev) => {
        const nextLine = prev + 1;
        if (nextLine >= lines.length - 10)
          setLines((old) => [...old, ...generateLines(50)]);
        return nextLine;
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [currentLine, lines.length, generateLines]);

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((prev) => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (lines.length > MAX_LINES && currentLine > BUFFER * 2) {
        setLines((oldLines) => {
          const safeIndex = currentLine - BUFFER * 2;
          if (safeIndex > 0) {
            setCurrentLine((prev) => prev - safeIndex);
            return oldLines.slice(safeIndex);
          }
          return oldLines;
        });
      }
    };

    const interval = setInterval(cleanup, 5000);
    return () => clearInterval(interval);
  }, [currentLine, lines.length]);

  const visibleLines = lines.slice(visibleStart, visibleEnd);

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="relative bg-[#1e1e1e] h-[600px] rounded-3xl overflow-hidden animate-glow"
        style={{ 
          color: '#ffffff',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          boxShadow: `
            0 8px 32px 0 rgba(0, 0, 0, 0.7),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 0 60px rgba(59, 130, 246, 0.05),
            0 0 80px rgba(59, 130, 246, 0.4),
            0 0 120px rgba(139, 92, 246, 0.2)
          `
        }}
      >
        <div className="px-8 py-6 flex items-center z-10 relative modern-loader-text" style={{ 
          background: 'linear-gradient(180deg, #2d2d2d 0%, #252525 100%)', 
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              animate={{ 
                boxShadow: ['0 0 10px rgba(239,68,68,0.5)', '0 0 20px rgba(239,68,68,0.8)', '0 0 10px rgba(239,68,68,0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
              animate={{ 
                boxShadow: ['0 0 10px rgba(234,179,8,0.5)', '0 0 20px rgba(234,179,8,0.8)', '0 0 10px rgba(234,179,8,0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div 
              className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              animate={{ 
                boxShadow: ['0 0 10px rgba(34,197,94,0.5)', '0 0 20px rgba(34,197,94,0.8)', '0 0 10px rgba(34,197,94,0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 text-center"
            style={{ color: '#ffffff' }}
          >
            <p style={{ 
              color: '#ffffff',
              fontSize: '1.125rem',
              fontFamily: 'monospace',
              display: 'block',
              width: '100%',
              margin: 0,
              padding: 0,
              WebkitTextFillColor: '#ffffff'
            } as React.CSSProperties}>
              <TypeAnimation
                words={words}
                typingSpeed="slow"
                deletingSpeed="slow"
                pauseDuration={2000}
                className=""
                style={{ color: '#ffffff' }}
              />
            </p>
          </motion.div>
        </div>

        <div
          ref={containerRef}
          className="relative px-10 py-8 font-mono text-lg overflow-y-hidden h-[calc(100%-84px)]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.03) 0%, rgba(0, 0, 0, 0) 70%)'
          }}
        >
          <div className="space-y-4 relative z-10">
            <AnimatePresence mode="sync">
              {visibleLines.map((line, idx) => {
                const actualIndex = visibleStart + idx;
                if (actualIndex >= currentLine) return null;

                const extraMargin = (idx + 1) % 4 === 0 ? "mt-4" : "";
                const paddingClass = line.segments[0]?.indent ? "pl-8" : "";

                return (
                  <React.Fragment key={line.id}>
                    <motion.div
                      className={cn(
                        "flex items-center gap-4 h-10",
                        extraMargin,
                        paddingClass
                      )}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {line.segments.map((seg, i) =>
                        seg.isCircle ? (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            className={cn(
                              "w-8 h-8 rounded-full opacity-50",
                              seg.color
                            )}
                          />
                        ) : (
                          <motion.div
                            key={i}
                            initial={{ width: 0 }}
                            animate={{ width: seg.width }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className={cn(
                              "h-6 rounded-sm opacity-50",
                              seg.color
                            )}
                            style={{ width: seg.width }}
                          />
                        )
                      )}
                    </motion.div>

                    {(actualIndex + 1) % 6 === 0 && (
                      <motion.div
                        className="w-full h-2 bg-gray-700 rounded-sm opacity-30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>

            {currentLine < lines.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center h-10"
                style={{
                  paddingLeft: `${
                    lines[currentLine]?.segments[0]?.indent ? 32 : 0
                  }px`,
                }}
              >
                <motion.div
                  animate={{ opacity: cursorVisible ? 1 : 0 }}
                  transition={{ duration: 0.1 }}
                  className="w-1 h-7 bg-blue-500"
                />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernLoader;
