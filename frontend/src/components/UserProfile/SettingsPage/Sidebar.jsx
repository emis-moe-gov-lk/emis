import React from "react";

const tabs = ["Profile", "Password", "Appearance"];

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-1/4 border-r border-gray-200 p-4">
      <ul className="space-y-2">
        {tabs.map((tab) => (
          <li key={tab}>
            <button
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-blue-100  text-blue-700 font-semibold"
                  : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
