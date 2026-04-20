import React from "react";

const Card = ({ label, value }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border shadow-sm">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
};

export default Card;
