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
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:border-indigo-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                Zonal (ZEO)
              </span>
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800">
                {region.total_zeo}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Offices
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:border-emerald-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                Divisional (DEO)
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800">
                {region.total_deo}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Offices
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (workplaceLevel === "OLID003") {
      return (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:border-emerald-100 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">
                Divisional (DEO)
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-800">
                {region.total_deo}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Offices
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (workplaceLevel === "OLID004") return null;

    if (workplaceLevel === "OLID005" || workplaceLevel === "OLID006")
      return null;
  };

  // Render the "View More Details" link
  const renderLink = (region) => {
    let href = "#";
    switch (workplaceLevel) {
      case "OLID001":
        href = `/offices/pmoe/${region.id}/overview`;
        break;
      case "OLID002":
        href = `/offices/peo/${region.id}/overview`;
        break;
      case "OLID003":
        href = `/offices/zeo/${region.id}/overview`;
        break;
      case "OLID004":
        href = `/offices/deo/${region.id}/overview`;
        break;
      case "OLID005":
      case "OLID006":
        href = `/institutions/${region.id}/overview`;
        break;
      default:
        break;
    }
    return (
      <a
        href={href}
        className="flex items-center justify-center w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 hover:shadow-indigo-200"
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
          data-region
          className="group bg-white border border-slate-200 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-300"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800 leading-tight">
                  {region.short_name || region.name}
                </h4>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Region ID #{String(index + 1).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 bg-slate-50/50">{renderStatsCards(region)}</div>

          {/* Total Institutions / Staff */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-bold text-slate-700">
                  {workplaceLevel === "OLID005" || workplaceLevel === "OLID006"
                    ? "Total Staff"
                    : "Total Institutions"}
                </p>
                <p className="text-xs text-slate-500">
                  Registered across the region
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-indigo-600">
                  {workplaceLevel === "OLID005" || workplaceLevel === "OLID006"
                    ? region.total_staff?.toLocaleString()
                    : region.total_institutions?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Link */}
            {renderLink(region)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfficeGrid;
