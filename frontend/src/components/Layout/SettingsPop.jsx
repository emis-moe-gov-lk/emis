import { FiX } from "react-icons/fi";

const SettingsPop = ({ isOpen, onClose }) => {
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
      className={`
        absolute right-16 bottom-10 w-56
        bg-white/90 backdrop-blur-md border border-gray-300 rounded-xl shadow-lg p-4 z-50
        transition-all duration-300 ease-out
        ${isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Settings</h3>

        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-200 transition"
        >
          <FiX className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <ul className="flex flex-col gap-2 text-xs text-gray-700">
        <li
          className="hover:bg-gray-100 p-2 rounded cursor-pointer"
          onClick={handleSystemSettingsClick}
        >
          System Settings
        </li>
        <li
          className="hover:bg-gray-100 p-2 rounded cursor-pointer"
          onClick={handleSystemSettingsClick1}
        >
          Version
        </li>
        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">
          Notifications
        </li>
        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">
          Privacy
        </li>
      </ul>
    </div>
  );
};

export default SettingsPop;
