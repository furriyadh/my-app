import * as React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

/**
 * Progress Component - متوافق مع المشروع
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ 
  className = '',
  value = 0,
  max = 100,
  ...props 
}, ref) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return React.createElement(
    'div',
    {
      ref,
      className: cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      ),
      ...props
    },
    React.createElement('div', {
      className: "h-full w-full flex-1 bg-primary transition-all",
      style: { transform: `translateX(-${100 - percentage}%)` }
    })
  );
});

Progress.displayName = 'Progress';

export { Progress };
export default Progress;

