import React from "react";

const OfficeGrid = ({ workplaceLevel, officeLists, search }) => {
  // Utility function to check if an office matches search
  const matchesSearch = (region) => {
    const name =
      region.short_name?.toLowerCase() ?? region.name?.toLowerCase() ?? "";
    return name.includes(search.toLowerCase().trim());
  };

  // Filtered list based on search
  const filteredOffices = officeLists.filter(matchesSearch);

  // Render ZEO/DEO cards for different levels
  const renderStatsCards = (region) => {
    if (workplaceLevel === "OLID001" || workplaceLevel === "OLID002") {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase">
              Zonal (ZEO)
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {region.total_zeo}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase">
              Divisional (DEO)
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {region.total_deo}
            </div>
          </div>
        </div>
      );
    }

    if (workplaceLevel === "OLID003") {
      return (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase">
              Divisional (DEO)
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {region.total_deo}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // 🔴 Disabled link (always disabled)
  const renderLink = () => {
    return (
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        className="flex items-center justify-center w-full py-3 rounded-xl text-xs font-bold
        bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
      >
        View More Details
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          ></path>
        </svg>
      </a>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredOffices.map((region, index) => (
        <div
          key={index}
          className="group bg-white dark:bg-gray-800/40 border border-slate-200 dark:border-gray-700 rounded-3xl transition-all duration-300 hover:shadow-xl dark:hover:shadow-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-50 dark:border-gray-700">
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">
              {region.short_name || region.name}
            </h4>
            <p className="text-xs text-slate-400 dark:text-gray-500">
              Region ID #{String(index + 1).padStart(2, "0")}
            </p>
          </div>

          {/* Stats */}
          <div className="p-6 bg-slate-50/50 dark:bg-gray-700/20">{renderStatsCards(region)}</div>

          {/* Total Institutions / Staff */}
          <div className="p-6">
            <div className="flex justify-between mb-6">
              <span className="text-sm font-bold text-slate-700 dark:text-gray-300">
                {workplaceLevel === "OLID005" || workplaceLevel === "OLID006"
                  ? "Total Staff"
                  : "Total Institutions"}
              </span>

              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {workplaceLevel === "OLID005" || workplaceLevel === "OLID006"
                  ? region.total_staff?.toLocaleString()
                  : region.total_institutions?.toLocaleString()}
              </span>
            </div>

            {/* Disabled Button */}
            {renderLink()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfficeGrid;
