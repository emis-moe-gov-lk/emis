import React, { useState } from "react";
import profileMale from "../../../assets/images/profile_m.png";
import profileFemale from "../../../assets/images/profile_f.png";

const tabs = [
  "General",
  "Qualification",
  "Employment",
  "W&OP",
  "Family",
  "Edit Request",
];

const MyProfileHeader = ({ myprofile, permissions, onTabChange }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("General"); // default tab
  const isConfirmed = myprofile?.appointment?.is_confirmed;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab); // optional callback to parent
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 mt-10">
      {/* PROFILE HEADER */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-32 md:h-52 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        <div className="px-4 md:px-8 pb-6">
          <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={
                  myprofile?.gender_id === "G02" ? profileFemale : profileMale
                }
                alt="Profile"
                className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
              <span
                className={`absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 border-white ${
                  isConfirmed ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
            </div>

            {/* Name & Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                {myprofile?.title?.title_name} {myprofile?.name_with_initials}
              </h1>

              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">
                {myprofile?.current_appointment?.service?.service_name}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {myprofile?.current_appointment?.workplace?.institution?.name ||
                  "No Workplace Assigned"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {permissions?.canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                >
                  Send Edit Request
                </button>
              )}

              {permissions?.canDownload && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Get Document
                </button>
              )}
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="mt-6 flex gap-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                  ${
                    activeTab === tab
                      ? "bg-white dark:bg-gray-700 text-indigo-600"
                      : "text-gray-500 hover:bg-white dark:hover:bg-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SIMPLE MODAL */}
      {showEditModal && (
        <Modal title="Edit Profile" onClose={() => setShowEditModal(false)}>
          Edit Form Goes Here
        </Modal>
      )}
    </div>
  );
};

/* Modal Component */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default MyProfileHeader;
