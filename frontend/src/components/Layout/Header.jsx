import React from "react";
import Logo from "../../assets/images/Emblem_of_Sri_Lanka.svg";
import AccountActions from "./AccountActions";

const Header = ({ isCollapsed }) => {
  return (
    <header className="sticky top-0 z-20 hidden lg:flex h-16 items-center justify-between surface-shell border-b">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center ">
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
      </div>

      <div className="flex items-center gap-2">
        <AccountActions layout="sidebar" />
      </div>
    </header>
  );
};

export default Header;
