import React, { useState, useRef, useEffect } from "react";
import { HiUser, HiCog, HiLogout, HiChevronDown } from "react-icons/hi";
import userImg from "../../assets/images/users/user_profille2.jpeg";
import { useAuthContext } from "@asgardeo/auth-react";
import { useNavigate } from "react-router-dom";
import { CgProfile } from "react-icons/cg";

const UserProfile = ({ userInfo, placement = "bottom" }) => {
  const { signOut } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!userInfo) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-100">
        <img src={userImg} alt="User" className="w-6 h-6 rounded-full" />
        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold truncate">Loading...</p>
          <p className="text-xs truncate opacity-70">Please wait</p>
        </div>
      </div>
    );
  }

  // Determine dropdown position
  const dropdownPosition =
    placement === "top" ? "bottom-full mb-6" : "top-full mt-2";

  return (
    <div className="relative inline-block w-full   text-left" ref={dropdownRef}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer
             hover:bg-slate-100 dark:hover:bg-gray-700 transition"
      >
        <img
          src={userImg}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />

        <div className="text-left leading-tight max-w-[140px]">
          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
            Mohammed Shadhir
          </p>
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
            mohammedshadhir5@gmail.com
          </p>
        </div>

        <HiChevronDown
          className={`w-4 h-4 text-slate-400 dark:text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown menu */}
      {open && (
        <div
          className={`absolute w-full p-4 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 ${dropdownPosition} shadow-theme-lg dark:bg-gray-800 absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 `}
        >
          <ul className="py-1 text-sm text-gray-700">
            <li>
              <button
                className="w-full text-left px-4 py-2 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-300 hover:rounded-lg flex items-center gap-2"
                onClick={() => {
                  navigate("/dashboard/profile/");
                  setOpen(false); // close dropdown
                }}
              >
                <HiUser /> Profile
              </button>
            </li>
            <li>
              <button
                className="w-full text-left px-4 py-2 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 hover:bg-gray-100 hover:rounded-lg flex items-center gap-2"
                onClick={() => {
                  navigate("/dashboard/settings");
                  setOpen(false);
                }}
              >
                <HiCog /> Settings
              </button>
            </li>
            <li>
              <hr className="my-1 border-gray-200" />
            </li>
            <li>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-300 hover:rounded-lg flex items-center gap-2 text-red-600"
                onClick={() => signOut && signOut()}
              >
                <HiLogout /> Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
