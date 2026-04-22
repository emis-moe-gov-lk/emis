import React from "react";
import { HiBell, HiSearch } from "react-icons/hi";
import Logo from "../../assets/images/Emblem_of_Sri_Lanka.svg";
import { TextInput, Tooltip } from "flowbite-react";
import { FiGrid } from "react-icons/fi";

const Header = ({ isCollapsed }) => {
  return (
    <header className="sticky top-0 z-20 hidden lg:flex h-16 items-center justify-between bg-gray-100  ">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl shadow-sm bg-white dark:bg-gray-800  dark:border-gray-700">
          <img
            src={Logo}
            alt="Emblem"
            className="w-5 h-5 lg:w-7 lg:h-7 object-contain"
          />
        </div>
        {isCollapsed && (
          <div className="hidden lg:block">
            <p className="text-base font-bold text-sidebar-foreground">HRMS</p>
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Ministry of Education
            </p>
          </div>
        )}

        <div className="relative hidden md:block">
          <TextInput
            type="search"
            icon={HiSearch}
            placeholder="Search..."
            className="w-64 [&_input]:bg-white [&_input]:rounded-full [&_input]:border-transparent [&_input]:focus:border-blue-500 [&_input]:focus:ring-blue-500/20"
          />
        </div>
      </div>
      {/* <h1 className="text-xl font-bold tracking-tight text-foreground capitalize">
          {pageTitle}
        </h1> */}

      <div className="flex items-center gap-2">
        <Tooltip content="Notifications">
          <button className="relative p-3 rounded-xl hover:cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-300 text-foreground transition-colors">
            <HiBell className="w-5 h-5 opacity-70" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background"></span>
          </button>
        </Tooltip>
        {/* Divider */}
        <button className="p-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-300 text-foreground transition-colors">
          <FiGrid
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            size={18}
          />
        </button>
        {/* <div className="h-6 w-px bg-border mx-1"></div>
          <LogoutButton /> */}
      </div>
    </header>
  );
};

export default Header;
