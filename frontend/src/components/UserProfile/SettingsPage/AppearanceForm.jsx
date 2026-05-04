import React, { useEffect, useState } from "react";
import { FiSun, FiMoon, FiMonitor, FiCheck } from "react-icons/fi";
import { getTheme, setTheme as applyTheme } from "../../../lib/theme";

const AppearanceForm = () => {
  const [theme, setTheme] = useState(() => getTheme());

  const themeOptions = [
    {
      id: "light",
      name: "Light Mode",
      icon: FiSun,
      description: "Use bright appearance",
      color: "text-yellow-500",
    },
    {
      id: "dark",
      name: "Dark Mode",
      icon: FiMoon,
      description: "Use dark appearance",
      color: "text-indigo-500",
    },
    {
      id: "system",
      name: "System Default",
      icon: FiMonitor,
      description: "Match your system preference",
      color: "text-green-500",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Appearance Settings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose how you want the interface to look
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;

            return (
                <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id);
                  applyTheme(option.id);
                }}
                className={`
                  w-full p-4 rounded-xl transition-all duration-200
                  flex items-center justify-between
                  ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400"
                      : "bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`
                      p-2 rounded-lg
                      ${isActive ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-100 dark:bg-gray-700"}
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5
                        ${isActive ? option.color : "text-gray-600 dark:text-gray-400"}
                      `}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className={`
                        font-medium
                        ${isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"}
                      `}
                    >
                      {option.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <div className="bg-blue-500 rounded-full p-1">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Preview Section */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            💡 Tip: Changes apply immediately. Your preference will be saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppearanceForm;