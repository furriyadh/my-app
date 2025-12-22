import * as React from 'react';
import { cn } from '../../lib/utils';

// Type definitions
interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Alert Component - متوافق مع المشروع
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ 
  className = '',
  variant = 'default',
  children,
  ...props 
}, ref) => {
  
  const variants = {
    default: 'bg-background text-foreground',
    destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
  };

  return React.createElement(
    'div',
    {
      ref,
      role: 'alert',
      className: cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        variants[variant],
        className
      ),
      ...props
    },
    children
  );
});

Alert.displayName = 'Alert';

/**
 * AlertTitle Component
 */
const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return React.createElement(
    'h5',
    {
      ref,
      className: cn('mb-1 font-medium leading-none tracking-tight', className),
      ...props
    },
    children
  );
});

AlertTitle.displayName = 'AlertTitle';

/**
 * AlertDescription Component
 */
const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(({ 
  className = '',
  children,
  ...props 
}, ref) => {
  return React.createElement(
    'div',
    {
      ref,
      className: cn('text-sm [&_p]:leading-relaxed', className),
      ...props
    },
    children
  );
});

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };

