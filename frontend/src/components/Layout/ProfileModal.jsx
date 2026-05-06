import React, { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router";

const ProfilePop = ({ isOpen, user, onClose, className = "" }) => {
  const navigate = useNavigate(); // hook to navigate
  const closeButtonRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // close when clicking/tapping outside the profile popover
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      const target = e.target || e.srcElement;
      if (containerRef.current && !containerRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen, onClose]);

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Profile menu"
      ref={containerRef}
      className={`
        absolute surface backdrop-blur-md rounded-xl p-4 z-50 origin-top-right
        transition-[opacity,transform] duration-200 ease-out
        ${className}
        ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0 pointer-events-none"}
      `}
    >
      {/* Close icon */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 p-1 rounded-full focus-ring"
        aria-label="Close profile menu"
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

          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
        <button
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 focus-ring"
          onClick={handleProfileClick}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePop;
