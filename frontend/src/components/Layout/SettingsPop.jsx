import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SettingsPop = ({ isOpen, onClose, className = "" }) => {
  const navigate = useNavigate();
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

  // Close when clicking/tapping outside the popover
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

  const handleSystemSettingsClick = () => {
    onClose();
    navigate("/dashboard/settings");
  };
  const handleSystemSettingsClick1 = () => {
    onClose();
    navigate("/dashboard/VersionPage");
  };

  return (
    <div
      id="settings-popover"
      ref={containerRef}
      role="menu"
      aria-label="Settings options"
      aria-hidden={!isOpen}
      className={`
        absolute surface backdrop-blur-md rounded-xl p-4 z-50
        transition-all duration-300 ease-out
        ${className}
        ${isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Settings</h3>

        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-white/5 transition focus-ring"
          aria-label="Close settings"
        >
          <FiX className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Content */}
      <ul className="flex flex-col gap-2 text-xs text-gray-700 dark:text-gray-300">
        <li>
          <button
            type="button"
            className="w-full text-left hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded cursor-pointer focus-ring"
            onClick={handleSystemSettingsClick}
          >
            System Settings
          </button>
        </li>
        <li>
          <button
            type="button"
            className="w-full text-left hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded cursor-pointer focus-ring"
            onClick={handleSystemSettingsClick1}
          >
            Version
          </button>
        </li>
        <li>
          <button type="button" className="w-full text-left hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded cursor-pointer focus-ring">
            Notifications
          </button>
        </li>
        <li>
          <button type="button" className="w-full text-left hover:bg-gray-100 dark:hover:bg-white/5 p-2 rounded cursor-pointer focus-ring">
            Privacy
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SettingsPop;
