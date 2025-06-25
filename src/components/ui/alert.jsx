import React from 'react';

// Utility function for combining classes
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Alert Component - متوافق مع المشروع
 */
const Alert = React.forwardRef(({ 
  className = '',
  variant = 'default',
  children,
  ...props 
}, ref) => {
  
  const variants = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Alert.displayName = 'Alert';

/**
 * AlertTitle Component
 */
const AlertTitle = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  );
});

AlertTitle.displayName = 'AlertTitle';

/**
 * AlertDescription Component
 */
const AlertDescription = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    >
      {children}
    </div>
  );
});

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };

