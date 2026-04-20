import React from "react";

const Select = ({ label, options, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <select
        {...props}
        className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
