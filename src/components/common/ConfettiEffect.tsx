'use client';

import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  isActive,
  duration = 3000,
  particleCount = 50,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      
      // إنشاء قطع الكونفيتي
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < particleCount; i++) {
        pieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          velocityX: (Math.random() - 0.5) * 4,
          velocityY: Math.random() * 3 + 2,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }
      setConfetti(pieces);

      // إخفاء التأثير بعد المدة المحددة
      const timer = setTimeout(() => {
        setIsVisible(false);
        setConfetti([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, particleCount, colors]);

  useEffect(() => {
    if (!isVisible || confetti.length === 0) return;

    const animationFrame = requestAnimationFrame(function animate() {
      setConfetti(prevConfetti => 
        prevConfetti.map(piece => ({
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + piece.velocityY,
          rotation: piece.rotation + piece.rotationSpeed,
          velocityY: piece.velocityY + 0.1 // الجاذبية
        })).filter(piece => piece.y < window.innerHeight + 50) // إزالة القطع التي خرجت من الشاشة
      );

      if (isVisible) {
        requestAnimationFrame(animate);
      }
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, confetti.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
            opacity: 0.8,
            transition: 'opacity 0.3s ease-out'
          }}
        />
      ))}
    </div>
  );
};

