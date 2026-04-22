import React, { useState } from "react";
import Sidebar from "./Sidebar";
import PasswordForm from "./PasswordForm";
import AppearanceForm from "./AppearanceForm";
import Profile from "./Profile";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("Profile");

  const renderContent = () => {
    switch (activeTab) {
      case "Password":
        return <PasswordForm />;
      case "Appearance":
        return <AppearanceForm />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 dark:text-gray-100 p-6">
      <div className="max-w-6xl mx-auto dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-1">Settings</h2>
          <p className="text-gray-400">
            Manage your profile, account, and appearance settings
          </p>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main Content */}
          <div className="flex-1 p-8 dark:bg-gray-900">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
