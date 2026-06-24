import React from "react";
import StatCard from "./StatCard";

const StatsSection = () => {
  const stats = [
    {
      value: "10,000+",
      title: "Schools Connected",
      subtitle: "Across All Nine Provinces",
    },
    {
      value: "4M+",
      title: "Student Records",
      subtitle: "From Grade 1 to A/Levels",
    },
    {
      value: "250K+",
      title: "Registered Educators",
      subtitle: "Teachers and Administrators",
    },
    {
      value: "95%",
      title: "Daily System Access",
      subtitle: "Primary Education Management Platform",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Serving <span className="text-blue-600">Sri Lanka's Education</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            EMIS provides a secure, centralized system supporting daily operations of all government schools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              title={stat.title}
              subtitle={stat.subtitle}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
