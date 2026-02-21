import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 border-b-4 active:border-b-0 active:mt-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all";
  
  let variantStyle = "";
  switch (variant) {
    case 'primary':
      variantStyle = "bg-blue-600 border-blue-800 text-white hover:bg-blue-500";
      break;
    case 'secondary':
      variantStyle = "bg-gray-600 border-gray-800 text-white hover:bg-gray-500";
      break;
    case 'danger':
      variantStyle = "bg-red-600 border-red-800 text-white hover:bg-red-500";
      break;
  }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};