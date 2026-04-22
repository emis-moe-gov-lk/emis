import React from "react";

const Input = ({ label, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <input
        {...props}
        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default Input;
