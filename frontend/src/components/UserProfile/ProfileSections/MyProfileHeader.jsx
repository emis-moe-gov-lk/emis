import React, { useState } from "react";
import toast from "react-hot-toast";
import profileMale from "../../../assets/images/profile_m.png";
import profileFemale from "../../../assets/images/profile_f.png";
import { downloadTeacherProfileDocument } from "@/api/teacherService";

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
  const [isDownloadingDocument, setIsDownloadingDocument] = useState(false);
  const isConfirmed = myprofile?.appointment?.is_confirmed;

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab); // optional callback to parent
  };

  const handleDownloadDocument = async () => {
    const peopleId = myprofile?.people_id ?? myprofile?.id;
    if (!peopleId) return;

    setIsDownloadingDocument(true);
    try {
      const response = await downloadTeacherProfileDocument(peopleId);
      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `teacher-profile-${myprofile?.nic || peopleId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to download teacher document:", error);
      toast.error("Unable to download the teacher document.");
    } finally {
      setIsDownloadingDocument(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto pb-10 mt-10">
      {/* PROFILE HEADER */}
      <div className="surface rounded-2xl overflow-hidden">
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
                className="w-28 h-28 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-white dark:bg-gray-800"
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

              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {myprofile?.current_appointment?.workplace?.institution?.name ||
                  "No Workplace Assigned"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {permissions?.canEdit && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  Send Edit Request
                </button>
              )}

              {permissions?.canDownload && (
                <button
                  onClick={handleDownloadDocument}
                  disabled={isDownloadingDocument}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloadingDocument ? "Preparing PDF..." : "Get Document"}
                </button>
              )}
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="mt-6 flex gap-3 surface-muted p-2 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all
                  ${
                    activeTab === tab
                      ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300"
                      : "text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700"
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
      <div className="surface rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default MyProfileHeader;
