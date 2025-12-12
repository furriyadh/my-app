"use client";

import { cn } from "@/lib/utils";

import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
  children,
  className,
  containerClassName,
  speed = "normal",
  autoRotate = false,
  autoRotateSpeed = 8,
  disabled = false,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  speed?: "fast" | "medium" | "normal";
  autoRotate?: boolean;
  autoRotateSpeed?: number; // seconds for full rotation cycle
  disabled?: boolean; // completely disable all 3D effects
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-rotation animation
  useEffect(() => {
    if (!autoRotate || isMouseEntered || !innerRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      // Calculate rotation based on time (slow elliptical motion)
      const progress = (elapsed / (autoRotateSpeed * 1000)) % 1;
      const angle = progress * Math.PI * 2;

      // Create a gentle floating/orbiting effect - very slow and subtle
      const rotateY = Math.sin(angle) * 2.5; // ±2.5 degrees Y (reduced from 5)
      const rotateX = Math.cos(angle * 0.5) * 1.5; // ±1.5 degrees X (reduced from 3)

      if (innerRef.current) {
        innerRef.current.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, isMouseEntered, autoRotateSpeed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !containerRef.current || !innerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const divisor = speed === "fast" ? 20 : speed === "medium" ? 60 : 100;
    const x = (e.clientX - left - width / 2) / divisor;
    const y = (e.clientY - top - height / 2) / divisor;
    innerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsMouseEntered(true);
    // Reset animation start time when leaving hover
    startTimeRef.current = 0;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!innerRef.current) return;
    setIsMouseEntered(false);
    if (!autoRotate) {
      innerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
    // Reset start time for smooth animation restart
    startTimeRef.current = 0;
  };
  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "flex items-center justify-center w-full",
          containerClassName
        )}
        style={{
          perspective: speed === "fast" ? "800px" : speed === "medium" ? "800px" : "1000px",
        }}
      >
        <div
          ref={innerRef}
          className={cn(
            "relative w-full",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
            transition: isMouseEntered
              ? "transform 0.1s ease-out"
              : "transform 0.4s ease-out",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <div
      className={cn(
        "h-96 w-96 [transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    handleAnimations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMouseEntered]);

  const handleAnimations = () => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  };

  // Always render as div for proper ref handling
  return (
    <div
      ref={ref}
      className={cn("w-fit transition duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </div>
  );
};

// Create a hook to use the context
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};

