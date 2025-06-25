import React from 'react';

// Utility function for combining classes
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Button Component - متوافق مع المشروع
 */
const Button = React.forwardRef(({ 
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  children,
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  // Variant styles
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'text-gray-700 hover:bg-gray-100',
    link: 'text-blue-600 underline-offset-4 hover:underline'
  };

  // Size styles
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10'
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;

