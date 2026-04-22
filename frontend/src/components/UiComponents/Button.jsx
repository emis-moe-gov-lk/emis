import React from "react";

const widthClasses = {
  full: "w-full",
  auto: "w-auto",
  sm: "w-28",
  md: "w-40",
  lg: "w-56",
};

const Button = ({ text, icon, width = "auto" }) => {
  return (
    <button
      className={`
        flex items-center justify-center gap-2
        rounded-full px-4 py-3 text-sm font-semibold
        text-white
        border-2 border-white/40
        bg-gradient-to-r from-blue-600 to-indigo-700
        shadow-md shadow-blue-500/30
        transition-all duration-300
        hover:border-white hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-400
        ${widthClasses[width]}
      `}
    >
      <span className="text-white text-lg flex items-center">{icon}</span>
      {text}
    </button>
  );
};

export default Button;
