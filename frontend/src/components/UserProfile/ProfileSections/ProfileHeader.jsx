import React, { useState } from "react";
import AvatarUploader from "../SettingsPage/AvatarUploader";
import {
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaEdit,
} from "react-icons/fa";

const tabs = [
  { id: "general", label: "General", icon: FaUser },
  { id: "qualifications", label: "Qualifications", icon: FaGraduationCap },
  { id: "employment", label: "Employment", icon: FaBriefcase },
  { id: "family", label: "Family", icon: FaUsers },
  { id: "edit", label: "Edit Request", icon: FaEdit },
];

const ProfileHeader = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="relative w-full rounded-t-4xl overflow-hidden border bg-gray-100">
      {/* Top cover */}
      <div className="h-32 bg-gray-100"></div>

      {/* Avatar */}
      <div className="absolute left-12 top-16 z-20">
        <div className="rounded-full border-4 border-white shadow-lg bg-white p-1">
          <AvatarUploader />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white pt-5 pb-3 px-6 rounded-t-4xl m-4">
        {/* Name */}
        <div className="ml-40">
          <h1 className="text-3xl font-semibold text-gray-800">
            Mohammed Shadhir
          </h1>
          <p className="text-2xl text-gray-500">SLTS</p>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 border-b border-gray-200 justify-between">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm rounded-t-md
                border border-b-0
                ${
                  activeTab === id
                    ? "bg-white text-gray-800 border-gray-300 shadow-sm"
                    : "bg-gray-100 text-gray-500 border-transparent hover:text-gray-700"
                }
              `}
            >
              <Icon className="text-sm" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
