'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface Card3DWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export default function Card3DWrapper({ children, className }: Card3DWrapperProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate rotation based on mouse position (max 10 degrees like integrations)
        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -10;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(className)}
            style={{
                transform,
                transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
                transformStyle: 'preserve-3d',
            }}
        >
            {children}
        </div>
    );
}
