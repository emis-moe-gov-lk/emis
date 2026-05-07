import React, { useState } from "react";
import { IoMdHelp, IoMdSettings } from "react-icons/io";
import ProfilePop from "./ProfileModal";
import SettingsPop from "./SettingsPop";
import profile_m from "../../assets/images/profile_m.png";
import profile_f from "../../assets/images/profile_f.png";

const AccountActions = ({ layout = "sidebar" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const user = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    gender: localStorage.getItem("gender"),
    profilePic: localStorage.getItem("profilePic"),
  };

  const getProfileImage = () => {
    if (user.profilePic) return user.profilePic;
    if (user.gender === "male") return profile_m;
    if (user.gender === "female") return profile_f;
    return profile_m;
  };

  const isMobileLayout = layout === "mobile";
  const buttonStackClass = isMobileLayout
    ? "flex items-center gap-3 mr-4"
    : "flex items-center gap-3 mr-6";
  const profileButtonClass = isMobileLayout
    ? "w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 focus-ring"
    : "w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 focus-ring";
  const utilityButtonClass = isMobileLayout
    ? "w-9 h-9 rounded-full surface text-gray-500 dark:text-gray-300 flex items-center justify-center text-sm font-semibold cursor-pointer focus-ring"
    : "w-10 h-10 rounded-full surface text-gray-500 dark:text-gray-300 flex items-center justify-center text-sm font-semibold cursor-pointer focus-ring";
  const profilePopoverClassName = isMobileLayout
    ? "right-0 top-14 w-60"
    : "right-0 top-14 w-60";
  const settingsPopoverClassName = isMobileLayout
    ? "right-0 top-14 w-56"
    : "right-0 top-14 w-56";

  return (
    <>
      <div className={buttonStackClass} >
        <button
          type="button"
          aria-label="Open profile panel"
          className={profileButtonClass}
          onClick={() => {
            setIsSettingsOpen(false);
            setIsProfileOpen(true);
          }}
        >
          <img
            src={getProfileImage()}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

        {/* <button
          type="button"
          aria-label="Help"
          className={utilityButtonClass}
        >
          <IoMdHelp
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white cursor-pointer"
            size={18}
          />
        </button> */}

        <button
          type="button"
          aria-label="Open settings popover"
          aria-expanded={isSettingsOpen}
          aria-controls="settings-popover"
          className={utilityButtonClass}
          onClick={() => {
            setIsProfileOpen(false);
            setIsSettingsOpen(true);
          }}
        >
          <IoMdSettings
            className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white cursor-pointer"
            size={18}
          />
        </button>
      </div>

      <ProfilePop
        isOpen={isProfileOpen}
        user={{ ...user, profileImage: getProfileImage() }}
        onClose={() => setIsProfileOpen(false)}
        className={profilePopoverClassName}
      />

      <SettingsPop
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        className={settingsPopoverClassName}
      />
    </>
  );
};

export default AccountActions;