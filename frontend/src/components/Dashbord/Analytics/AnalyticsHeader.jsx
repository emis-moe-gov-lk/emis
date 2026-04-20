import { useState } from "react";

const AnalyticsHeader = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="mb-10 px-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase">
              Live Data
            </span>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Office distribution analytics
            </h3>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Geographic Distribution
          </h2>
        </div>

        {/* Search + Button */}
        <div className="mt-6 md:mt-0 flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border-0 ring-1 ring-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all w-72 shadow-sm"
            />
            <svg
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>

          <button
            type="button"
            className="p-3 bg-white ring-1 ring-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Search Result */}
      {search.trim().length > 0 && (
        <div className="mb-6 px-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600">
            Search result found for: <span className="font-bold">{search}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsHeader;
