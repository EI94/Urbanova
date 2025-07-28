'use client';

import React, { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    children,
    disabled,
    ...props
  }, ref) => {

    const getVariantClasses = () => {
      switch (variant) {
        case 'primary':
          return 'btn-primary text-white';
        case 'secondary':
          return 'btn-secondary text-white';
        case 'accent':
          return 'btn-accent text-white';
        case 'outline':
          return 'btn-outline border-primary text-primary hover:bg-primary hover:text-white';
        case 'ghost':
          return 'btn-ghost text-primary hover:bg-primary/10';
        default:
          return 'btn-primary text-white';
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'btn-sm text-xs';
        case 'md':
          return 'text-sm py-2';
        case 'lg':
          return 'btn-lg text-base';
        default:
          return 'text-sm py-2';
      }
    };

    return (
      <button
        ref={ref}
        className={`
          btn
          ${getVariantClasses()}
          ${getSizeClasses()}
          ${fullWidth ? 'w-full' : ''}
          ${isLoading ? 'loading' : ''}
          transform transition duration-200 ease-in-out active:scale-95
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 