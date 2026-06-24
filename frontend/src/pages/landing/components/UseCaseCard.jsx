const UseCaseCard = ({ icon: Icon, title, description, bgGradient }) => {
  return (
    <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group cursor-default">
      <div className="flex-shrink-0">
        <div
          className={`flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-2xl text-white shadow-lg transition-transform duration-700 group-hover:scale-110 group-hover:rotate-3 ${bgGradient}`}
        >
          <Icon className="w-7 sm:w-8 h-7 sm:h-8" />
        </div>
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight transition-colors group-hover:text-blue-600">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default UseCaseCard;
