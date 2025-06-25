import React from 'react';

// Utility function for combining classes
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Progress Component - متوافق مع المشروع
 */
const Progress = React.forwardRef(({ 
  className = '',
  value = 0,
  max = 100,
  ...props 
}, ref) => {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div
      ref={ref}
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});

Progress.displayName = 'Progress';

export { Progress };
export default Progress;

