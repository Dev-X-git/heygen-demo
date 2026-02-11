import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`
        bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-700 hover:to-purple-700
        text-white font-semibold text-base px-8 py-3 
        rounded-full 
        shadow-lg hover:shadow-xl
        transition-all duration-300
        transform hover:scale-105 active:scale-95
        disabled:hover:scale-100
        ${className}
      `}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
