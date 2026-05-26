const StatCard = ({ value, title, subtitle }) => {
  return (
    <div className="relative p-6 sm:p-8 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-100 group">
      {/* Top Accent Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/10 group-hover:bg-blue-600 transition-colors duration-500 rounded-t-2xl" />
      
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <div className="text-4xl sm:text-5xl font-black text-slate-900 mb-3 tabular-nums tracking-tighter">
          {value}
        </div>
        <div className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-1">
          {title}
        </div>
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">
          {subtitle}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
