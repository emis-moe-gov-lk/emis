const UseCaseCard = ({ icon: Icon, title, description, bgGradient }) => {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div
          className={`flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-xl text-white shadow-lg ${bgGradient}`}
        >
          <Icon className="w-7 sm:w-8 h-7 sm:h-8" />
        </div>
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
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
