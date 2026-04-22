import { Tooltip } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import BrandIcon from "./BrandIcon";
import { HiBell, HiCog, HiMenu, HiUser, HiX } from "react-icons/hi";

const NavBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 z-50 w-full lg:hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm h-16">
      <div className="flex items-center justify-between w-full h-full px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all active:scale-95"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
          <BrandIcon />
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content="Profile">
            <button
              onClick={() => navigate("/dashboard/profile")}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Go to profile"
            >
              <HiUser className="w-5 h-5" />
            </button>
          </Tooltip>

          <Tooltip content="Settings">
            <button
              onClick={() => navigate("/dashboard/Settings")}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label="Go to settings"
            >
              <HiCog className="w-5 h-5" />
            </button>
          </Tooltip>

          <Tooltip content="Notifications">
            <button className="relative p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
              <HiBell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-gray-100 dark:ring-gray-900"></span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
