import * as React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'slim' | 'thick';
  indicatorClassName?: string;
  indicatorStyle?: React.CSSProperties;
}

/**
 * Progress Component - Enhanced with variant support
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ 
  className = '',
  value = 0,
  max = 100,
  variant = 'default',
  indicatorClassName = '',
  indicatorStyle = {},
  ...props 
}, ref) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  // Variant-based heights
  const heightClasses = {
    slim: 'h-2',
    default: 'h-4',
    thick: 'h-6'
  };
  
  return React.createElement(
    'div',
    {
      ref,
      className: cn(
        'relative w-full overflow-hidden rounded-full bg-secondary',
        heightClasses[variant],
        className
      ),
      ...props
    },
    React.createElement('div', {
      className: cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorClassName
      ),
      style: { 
        transform: `translateX(-${100 - percentage}%)`,
        ...indicatorStyle
      }
    })
  );
});

Progress.displayName = 'Progress';

export { Progress };
export default Progress;

