'use client';

import React from 'react';

interface ShimmerButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'connect' | 'disconnect';
}

export default function ShimmerButton({ 
  children = "Shimmer Button", 
  onClick, 
  className = "", 
  disabled = false,
  variant = 'default'
}: ShimmerButtonProps) {
  const customCss = `
    /* This is the key to the seamless animation.
      The @property rule tells the browser that '--angle' is a custom property
      of type <angle>. This allows the browser to smoothly interpolate it
      during animations, preventing the "jump" at the end of the loop.
    */
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    /* The keyframe animation simply transitions the --angle property
      from its start (0deg) to its end (360deg).
    */
    @keyframes shimmer-spin {
      to {
        --angle: 360deg;
      }
    }
  `;

  const getVariantStyles = () => {
    switch (variant) {
      case 'connect':
        return {
          border: 'conic-gradient(from var(--angle), transparent 25%, #10b981, transparent 50%)',
          text: 'text-green-900',
          bg: 'bg-green-50 hover:bg-green-100'
        };
      case 'disconnect':
        return {
          border: 'conic-gradient(from var(--angle), transparent 25%, #ef4444, transparent 50%)',
          text: 'text-red-900',
          bg: 'bg-red-50 hover:bg-red-100'
        };
      default:
        return {
          border: 'conic-gradient(from var(--angle), transparent 25%, #06b6d4, transparent 50%)',
          text: 'text-gray-900 dark:text-white',
          bg: 'bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <div className={`flex items-center justify-center font-sans ${className}`}>
      <style>{customCss}</style>
      <button 
        onClick={onClick}
        disabled={disabled}
        className={`relative inline-flex items-center justify-center p-[1.5px] bg-gray-300 dark:bg-black rounded-full overflow-hidden group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div 
          className="absolute inset-0" 
          style={{
            background: variantStyles.border,
            animation: disabled ? 'none' : 'shimmer-spin 2.5s linear infinite'
          }} 
        />
        <span className={`relative z-10 inline-flex items-center justify-center w-full h-full px-8 py-3 ${variantStyles.text} ${variantStyles.bg} rounded-full transition-colors duration-300`}>
          {children}
        </span>
      </button>
    </div>
  );
}
