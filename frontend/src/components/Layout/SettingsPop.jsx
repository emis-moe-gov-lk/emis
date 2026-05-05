import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

const SettingsPop = ({ isOpen, onClose }) => {
  const closeButtonRef = useRef(null);

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

  const handleSystemSettingsClick = () => {
    // Logic to navigate to system settings page
    window.location.href = "/dashboard/settings"; // replace with your route
  };
  const handleSystemSettingsClick1 = () => {
    // Logic to navigate to system settings page
    window.location.href = "/dashboard/VersionPage"; // replace with your route
  };

  return (
    <div
      id="settings-popover"
      role="menu"
      aria-label="Settings options"
      aria-hidden={!isOpen}
      className={`
        absolute right-16 bottom-10 w-56
        surface backdrop-blur-md rounded-xl p-4 z-50
        transition-all duration-300 ease-out
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
