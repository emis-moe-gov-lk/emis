import React from "react";

const StatCard = ({ title, value, badge, color, icon: Icon }) => {
  const colors = {
    indigo: {
      border: "hover:border-indigo-500",
      bar: "bg-indigo-500",
      iconBg: "group-hover:bg-indigo-50",
      iconText: "group-hover:text-indigo-600",
    },
    emerald: {
      border: "hover:border-emerald-500",
      bar: "bg-emerald-500",
      iconBg: "group-hover:bg-emerald-50",
      iconText: "group-hover:text-emerald-600",
    },
    blue: {
      border: "hover:border-blue-500",
      bar: "bg-blue-500",
      iconBg: "group-hover:bg-blue-50",
      iconText: "group-hover:text-blue-600",
    },
  };

  const style = colors[color] || colors.indigo;

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-2xl p-3 sm:p-4 transition-all duration-300 ${style.border} hover:shadow-md`}
    >
      <div
        className={`absolute left-0 top-4 bottom-4 w-1 ${style.bar} rounded-r-full opacity-40 group-hover:opacity-100 transition-opacity`}
      ></div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0 sm:items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 dark:bg-gray-700 rounded-xl flex items-center justify-center shrink-0">
            {Icon ? <Icon className="w-5 h-5 sm:w-6 sm:h-6" /> : null}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest truncate">
              {title}
            </p>

            <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none mt-1 break-words">
              {value?.toLocaleString ? value.toLocaleString() : value}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          {/* <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-[9px] font-bold rounded-md uppercase">
            {badge}
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
