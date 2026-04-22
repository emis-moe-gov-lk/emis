import React from "react";

const InfoBlock = ({ label, value }) => {
  return (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {value}
      </p>
    </div>
  );
};

export default InfoBlock;
