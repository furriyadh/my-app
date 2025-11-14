'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypeAnimationProps {
  words: string[];
  typingSpeed?: 'slow' | 'medium' | 'fast';
  deletingSpeed?: 'slow' | 'medium' | 'fast';
  pauseDuration?: number;
  className?: string;
  style?: React.CSSProperties;
}

const TypeAnimation: React.FC<TypeAnimationProps> = ({
  words,
  typingSpeed = 'medium',
  deletingSpeed = 'medium',
  pauseDuration = 2000,
  className = '',
  style = {},
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const speeds = {
    slow: 100,
    medium: 50,
    fast: 30,
  };

  const typeSpeed = speeds[typingSpeed];
  const deleteSpeed = speeds[deletingSpeed];

  useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && currentText === currentWord) {
      // Pause before deleting
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && currentText === '') {
      // Move to next word
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else if (isDeleting) {
      // Delete character
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, deleteSpeed);
    } else {
      // Type character
      timeout = setTimeout(() => {
        setCurrentText((prev) => currentWord.slice(0, prev.length + 1));
      }, typeSpeed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words, typeSpeed, deleteSpeed, pauseDuration]);

  return <span className={cn(className)} style={{ color: '#ffffff', ...style }}>{currentText}</span>;
};

export default TypeAnimation;

