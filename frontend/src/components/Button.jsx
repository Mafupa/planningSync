import React from 'react';

const Button = ({ 
  children,
  type, 
  onClick,
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const baseStyle = 'group relative w-full flex justify-center ';
  
  const variants = {
    primary: 'border border-transparent font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    onTab: 'text-indigo-600 hover:text-indigo-500 p-0 pb-4 border-b-2 border-transparent hover:border-indigo-500 h-auto shadow-none bg-transparent',
    offTab: 'text-gray-500 hover:text-gray-700 p-0 pb-4 border-b-2 border-transparent hover:border-gray-500 h-auto shadow-none bg-transparent',
    disabled: 'opacity-50 cursor-not-allowed',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        ${baseStyle}
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
