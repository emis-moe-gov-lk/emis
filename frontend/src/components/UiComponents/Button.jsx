import React from "react";

const widthClasses = {
  full: "w-full",
  auto: "w-auto",
  sm: "w-28",
  md: "w-40",
  lg: "w-56",
};

const variantClasses = {
  primary:
    "text-white bg-blue-600 hover:bg-blue-700 shadow-sm",
  secondary:
    "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
  ghost:
    "text-blue-700 bg-transparent hover:bg-blue-50",
  danger:
    "text-white bg-red-600 hover:bg-red-700 shadow-sm",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const Button = ({
  text,
  children,
  icon,
  width = "auto",
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-semibold
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${widthClasses[width] || widthClasses.auto}
        ${className}
      `}
      {...props}
    >
      {icon ? <span className="flex items-center">{icon}</span> : null}
      {children || text}
    </button>
  );
};

export default Button;
