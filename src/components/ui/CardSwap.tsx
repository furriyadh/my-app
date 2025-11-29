'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardSwapProps {
  cards: React.ReactNode[];
  autoSwap?: boolean;
  interval?: number;
  className?: string;
  showIndicators?: boolean;
  enableSwipe?: boolean;
}

export default function CardSwap({ 
  cards, 
  autoSwap = true, 
  interval = 3000,
  className = '',
  showIndicators = true,
  enableSwipe = true
}: CardSwapProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Auto-swap functionality
  useEffect(() => {
    if (!autoSwap || cards.length <= 1) return;

    const timer = setInterval(() => {
      nextCard();
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, autoSwap, interval, cards.length]);

  const nextCard = () => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goToCard = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  const variants = {
    enter: (direction: string) => ({
      x: direction === 'right' ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction === 'right' ? 45 : -45
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: string) => ({
      x: direction === 'right' ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction === 'right' ? -45 : 45
    })
  };

  // Swipe handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!enableSwipe || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextCard();
    } else if (isRightSwipe) {
      prevCard();
    }
  };

  if (cards.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No cards to display</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Cards Container */}
      <div 
        className="relative w-full overflow-hidden perspective-1000"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
              rotateY: { duration: 0.4 }
            }}
            className="w-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {cards[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons - Only show if more than 1 card */}
      {cards.length > 1 && (
        <>
          <button
            onClick={prevCard}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 border border-gray-200 dark:border-gray-700"
            aria-label="Previous card"
          >
            <svg 
              className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextCard}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 border border-gray-200 dark:border-gray-700"
            aria-label="Next card"
          >
            <svg 
              className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators - Only show if more than 1 card */}
      {showIndicators && cards.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`
                transition-all duration-300 rounded-full
                ${index === currentIndex 
                  ? 'w-8 h-2 bg-blue-600 dark:bg-blue-400' 
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }
              `}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Card Counter */}
      {cards.length > 1 && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {currentIndex + 1} / {cards.length}
          </p>
        </div>
      )}
    </div>
  );
}

// Example Card Component for reference
export function ExampleCard({ title, content, gradient }: { title: string; content: string; gradient: string }) {
  return (
    <div className={`p-8 rounded-2xl shadow-xl ${gradient} min-h-[300px] flex flex-col justify-center items-center text-white`}>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-center text-lg opacity-90">{content}</p>
    </div>
  );
}

