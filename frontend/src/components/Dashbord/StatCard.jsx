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

  const style = colors[color];

  return (
    <div
      className={`group relative bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-300 ${style.border} hover:shadow-md`}
    >
      <div
        className={`absolute left-0 top-4 bottom-4 w-1 ${style.bar} rounded-r-full opacity-40 group-hover:opacity-100 transition-opacity`}
      ></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
            {Icon ? <Icon className="w-6 h-6" /> : null}
          </div>

          <div className="ml-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {title}
            </p>

            <p className="text-2xl font-black text-slate-900 leading-none mt-1">
              {value.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-md uppercase">
            {badge}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
