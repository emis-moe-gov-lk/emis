import { MenuIcon } from "lucide-react";

const BrandIcon = ({ onToggle, isCollapsed }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className="w-10 h-10 hidden lg:flex items-center justify-center rounded-xl
                   hover:bg-gray-100 dark:hover:bg-gray-700 transition  "
      >
        <MenuIcon className="w-10 h-10 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition hover:text-gray-800 dark:hover:text-gray-200" />
      </button>

      {/* Hide text when collapsed */}
      {!isCollapsed && (
        <div className="hidden lg:block">
          <p className="text-base font-bold text-sidebar-foreground">HRMS</p>
          <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
            Ministry of Education
          </p>
        </div>
      )}
    </div>
  );
};

export default BrandIcon;
