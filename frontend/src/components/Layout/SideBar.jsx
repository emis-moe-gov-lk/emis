import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar } from "flowbite-react";
import { HiChevronDown } from "react-icons/hi";

import { filterMenuItemsByPermissions, menuItems } from "../../config/menuItems";
import { useAuthUser } from "../../context/useAuthUser";
import LogoutButton2 from "../auth/LogoutButton2";
import BrandIcon from "./BrandIcon";

const SideBar = ({
  isSidebarOpen,
  setIsSidebarOpen,
  isMobile,
  isCollapsed,
  onToggle,
}) => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const { hasPermission } = useAuthUser();

  const isParentActive = (children) =>
    children?.some((child) => location.pathname.startsWith(child.to));

  const toggleMenu = (id) => {
    setOpenMenu(openMenu === id ? null : id);
  };

  const filteredMenu = filterMenuItemsByPermissions(menuItems, hasPermission);
  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
        lg:static lg:translate-x-0
        ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
        pt-16 lg:pt-0
      `}
    >
      <Sidebar className="h-full w-full surface-shell [&>div]:bg-transparent [&>div]:p-0">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="hidden lg:flex h-14 items-center px-3">
            <BrandIcon onToggle={onToggle} isCollapsed={isCollapsed} />
          </div>

          {/* Menu */}
          <div className="flex-1 overflow-y-auto px-2 py-3 text-gray-900 dark:text-gray-100 scrollbar-theme">
            {filteredMenu.map((section, sectionIndex) => (
              <div key={`${section.section}-${sectionIndex}`} className="mb-4">
                {/* Section title */}
                {!isCollapsed && (
                  <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {section.section}
                  </p>
                )}

                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => {
                    /* ======================
                       DROPDOWN ITEMS
                    ====================== */

                    if (item.children) {
                      return (
                        <div key={`${item.id}-${itemIndex}`}>
                          {/* COLLAPSED */}
                          {isCollapsed ? (
                            <div
                              className="flex justify-center items-center py-2 rounded-lg cursor-pointer text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/5 focus-ring"
                              onClick={() => {
                                onToggle();
                                setOpenMenu(item.id);
                              }}
                            >
                              {item.icon && <item.icon className="w-4 h-4" />}
                            </div>
                          ) : (
                            <>
                              {/* Parent */}
                              <div
                                onClick={() => toggleMenu(item.id)}
                                className={`flex items-center px-3 py-2 rounded-lg cursor-pointer text-xs transition focus-ring
                                ${
                                  isParentActive(item.children)
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/5"
                                }`}
                              >
                                  {item.icon && (
                                  <item.icon className="w-4 h-4 mr-2" />
                                )}

                                <span className="flex-1">{item.label}</span>

                                <HiChevronDown
                                  className={`w-3 h-3 transition-transform ${
                                    openMenu === item.id ? "rotate-180" : ""
                                  }`}
                                />
                              </div>

                              {/* Children */}
                                  {openMenu === item.id && (
                                <div className="ml-6 mt-1 space-y-1">
                                  {item.children.map((child, childIndex) => {
                                    const isDisabled = !child.to;
                                    return isDisabled ? (
                                      <div
                                        key={`${child.id}-${childIndex}`}
                                        className="block px-2 py-1.5 text-xs rounded-md text-gray-400 dark:text-gray-500"
                                      >
                                        {child.label}
                                      </div>
                                    ) : (
                                      <NavLink
                                        key={`${child.id}-${childIndex}`}
                                        to={child.to}
                                        className={({ isActive }) =>
                                          `block px-2 py-1.5 text-xs rounded-md transition focus-ring
                                          ${
                                            isActive
                                              ? "bg-gray-200 dark:bg-gray-800 text-blue-600 dark:text-blue-300 font-semibold"
                                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-white/5"
                                          }`
                                        }
                                      >
                                        {child.label}
                                      </NavLink>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    }

                    /* ======================
                       NORMAL ITEMS
                    ====================== */

                    return (
                      <NavLink
                        key={`${item.id}-${itemIndex}`}
                        to={item.to}
                        onClick={() => isMobile && setIsSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center rounded-lg text-xs transition focus-ring
                            ${isCollapsed ? "justify-center py-2" : "px-3 py-2"}
                            ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-white/5"
                            }`
                          }
                      >
                        {item.icon && (
                          <item.icon
                            className={`w-4 h-4 ${!isCollapsed ? "mr-2" : ""}`}
                          />
                        )}

                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <LogoutButton2 isCollapsed={isCollapsed} />
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default SideBar;
