import React, { ReactNode, MouseEventHandler } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'emphasis' | 'outline' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-[12px]',
    md: 'px-4 py-2.5 text-[14px]',
    lg: 'px-6 py-3 text-[16px]',
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#608BFF] to-[var(--color-primary)] hover:from-[#4B7CFF] hover:to-[#2757DF] text-white shadow-[0_4px_12px_rgba(47,99,246,0.25)]',
    secondary: 'bg-gradient-to-r from-[#7a7ee0] to-[var(--color-secondary)] hover:from-[#686CD5] hover:to-[#5a5ebf] text-white shadow-[0_4px_12px_rgba(104,108,213,0.25)]',
    tertiary: 'bg-gradient-to-r from-[#c074b5] to-[var(--color-tertiary)] hover:from-[#B055A4] hover:to-[#9e4a93] text-white shadow-[0_4px_12px_rgba(176,85,164,0.25)]',
    emphasis: 'bg-gradient-to-r from-[#c14a5c] to-[var(--color-emphasis)] hover:from-[#A92F41] hover:to-[#922838] text-white shadow-[0_4px_12px_rgba(169,47,65,0.25)]',
    outline: 'bg-[var(--color-neutral)] uav-inset hover:bg-[#E4E9F2] text-[#1F2937] border border-transparent',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
