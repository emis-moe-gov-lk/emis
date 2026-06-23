import {
  HiOfficeBuilding,
  HiGlobeAlt,
  HiLibrary,
  HiAcademicCap,
  HiChevronRight,
} from "react-icons/hi";

const OfficesOverview = () => {
  const hierarchy = [
    {
      name: "Ministry of Education",
      count: 1,
      tag: "CENTRAL POLICY",
      icon: <HiGlobeAlt className="w-6 h-6" />,
      color: "from-blue-600 to-indigo-700",
    },
    {
      name: "Provincial Ministry",
      count: 9,
      tag: "LEVEL 2",
      icon: <HiOfficeBuilding className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-600",
    },
    {
      name: "Provincial Education Office",
      count: 9,
      tag: "LEVEL 3",
      icon: <HiOfficeBuilding className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Zonal Education Office",
      count: 100,
      tag: "LEVEL 4",
      icon: <HiLibrary className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Divisional Education Office",
      count: 312,
      tag: "LEVEL 5",
      icon: <HiLibrary className="w-6 h-6" />,
      color: "from-cyan-500 to-teal-500",
    },
    {
      name: "Institution (Schools)",
      count: 10096,
      tag: "SERVICE POINT",
      icon: <HiAcademicCap className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="p-2 lg:p-6 space-y-10 max-w-5xl mx-auto font-sans">
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          Sri Lanka Education System{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
            Office Hierarchy
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          A structural overview of the administrative levels governing the
          national education framework.
        </p>
      </div>

      {/* Hierarchy Visualization */}
      <div className="relative space-y-6">
        {/* Connecting Line (Vertical) */}
        <div className="absolute left-[31px] top-10 bottom-10 w-0.5 bg-linear-to-b from-blue-100 via-indigo-100 to-emerald-50 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 hidden md:block"></div>

        {hierarchy.map((item, index) => (
          <div
            key={item.name}
            className="group relative flex flex-col md:flex-row md:items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl active:scale-[0.99]"
          >
            {/* Icon Circle */}
            <div
              className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br ${item.color} text-white shadow-lg shadow-blue-500/10 shrink-0 transform group-hover:rotate-6 transition-transform`}
            >
              {item.icon}
              {/* Index Badge */}
              <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-[10px] font-black w-6 h-6 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700">
                0{index + 1}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    <HiOfficeBuilding className="w-4 h-4 opacity-70" />
                    {item.count.toLocaleString()} Total Workplaces
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                  {item.tag}
                </span>
                <HiChevronRight className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Decorative background blob */}
            <div
              className={`absolute -right-4 -bottom-4 w-24 h-24 bg-linear-to-br ${item.color} opacity-0 group-hover:opacity-[0.03] rounded-full blur-2xl transition-opacity`}
            ></div>
          </div>
        ))}
      </div>

      {/* Quick Summary Footer */}
      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] p-8 mt-12 border border-blue-100 dark:border-blue-900/30 text-center">
        <p className="text-blue-700 dark:text-blue-300 font-medium">
          Total National Educational Points:{" "}
          <span className="font-black text-blue-900 dark:text-blue-100 text-lg ml-1">
            {hierarchy
              .reduce((acc, curr) => acc + curr.count, 0)
              .toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OfficesOverview;
