import React from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router";

const ProfilePop = ({ isOpen, user, onClose }) => {
  const navigate = useNavigate(); // hook to navigate
  console.log(user);
  console.log(user);

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    onClose();
  };

  return (
    <div
      className={`
        absolute right-16 bottom-10 w-60 
        bg-white/30 backdrop-blur-md border border-gray-500 rounded-xl shadow-lg p-4 z-50
        transition-transform duration-300 ease-out
        ${isOpen ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0 pointer-events-none"}
      `}
    >
      {/* Close icon */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 p-1 rounded-full"
      >
        <FiX size={18} />
      </button>

      <div className="flex flex-col items-center gap-2 mt-2">
        <div className="flex items-center justify-between mb-2">
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
          />
        </div>

        <h2 className="text-sm font-semibold">{user.name}</h2>
        <p className="text-gray-500 text-xs">{user.email}</p>
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
          onClick={handleProfileClick}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePop;
