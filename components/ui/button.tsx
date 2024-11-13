import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button {...props} className={`p-2 bg-gray-200 dark:bg-gray-800 rounded ${props.className}`}>
      {children}
    </button>
  );
};
