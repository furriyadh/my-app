'use client';

import React from 'react';

interface InteractiveInputProps {
  className?: string;
  variant?: string;
  inputSize?: string;
  glow?: boolean;
  rounded?: string;
  hideAnimations?: boolean;
  uppercase?: boolean;
  textEffect?: string;
  shimmerColor?: string;
  shimmerSize?: string;
  shimmerDuration?: string;
  borderRadius?: string;
  background?: string;
  placeholder?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function InteractiveInput({
  className = 'bg-green-500 text-white',
  variant = 'default',
  inputSize = 'default',
  glow = true,
  rounded = 'custom',
  hideAnimations = false,
  uppercase = true,
  textEffect = 'normal',
  shimmerColor = '#39FF14',
  shimmerSize = '0.15em',
  shimmerDuration = '3s',
  borderRadius = '100px',
  background = 'rgba(0, 0, 0, 1)',
  placeholder = 'Generate with ScrollX UI',
  children,
  onClick
}: InteractiveInputProps) {

  const styles = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes glow-pulse {
      0%, 100% {
        box-shadow: 0 0 20px #39FF1440, 0 0 40px #39FF1420;
      }
      50% {
        box-shadow: 0 0 30px #39FF1460, 0 0 60px #39FF1430;
      }
    }

    .interactive-input {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 12px 20px;
      border: none;
      border-radius: ${borderRadius};
      background: ${background};
      color: ${shimmerColor};
      font-weight: 600;
      font-size: 14px;
      ${uppercase ? 'text-transform: uppercase;' : ''}
      letter-spacing: 0.5px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s ease;
      ${glow ? `box-shadow: 0 0 20px ${shimmerColor}40, 0 0 40px ${shimmerColor}20;` : ''}
    }

    .interactive-input:hover {
      transform: translateY(-2px) scale(1.02);
      ${glow ? 'animation: glow-pulse 2s infinite;' : ''}
    }

    .interactive-input::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        #39FF1460,
        transparent
      );
      ${hideAnimations ? '' : `animation: shimmer ${shimmerDuration} infinite;`}
    }

    .interactive-input:hover::before {
      ${hideAnimations ? '' : `animation: shimmer ${shimmerDuration} infinite;`}
    }

    .interactive-input::after {
      content: '';
      position: absolute;
      inset: 2px;
      border-radius: ${borderRadius};
      background: linear-gradient(45deg, transparent, #39FF1420, transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .interactive-input:hover::after {
      opacity: 1;
    }

    .shimmer-text {
      position: relative;
      z-index: 10;
      background: linear-gradient(90deg, #39FF14, #ffffff, #39FF14);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      ${hideAnimations ? '' : `animation: shimmer-text ${shimmerDuration} infinite;`}
    }

    @keyframes shimmer-text {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <button 
        className={`interactive-input ${className}`}
        onClick={onClick}
      >
        <span className="shimmer-text">
          {children || placeholder}
        </span>
      </button>
    </>
  );
}
