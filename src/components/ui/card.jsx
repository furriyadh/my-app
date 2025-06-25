import React from 'react';

// Utility function for combining classes
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Card Component - متوافق مع المشروع
 */
const Card = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

/**
 * CardHeader Component
 */
const CardHeader = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

/**
 * CardTitle Component
 */
const CardTitle = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * CardDescription Component
 */
const CardDescription = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * CardContent Component
 */
const CardContent = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

/**
 * CardFooter Component
 */
const CardFooter = React.forwardRef(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
};

