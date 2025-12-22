'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className
}) => {
  return React.createElement(
    'div',
    {
      className: cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )
    },
    children
  );
};

