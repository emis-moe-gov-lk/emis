import React, { useState } from "react";
import { IoMdHelp, IoMdSettings } from "react-icons/io";
import ProfilePop from "./ProfileModal";
import SettingsPop from "./SettingsPop";
import profile_m from "../../assets/images/profile_m.png";
import profile_f from "../../assets/images/profile_f.png";

const RightSidebar = () => {
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

  return (
    <div className="relative hidden lg:block">
      <div className="top-0 right-0 h-screen my-4 w-14 surface-shell flex flex-col justify-end items-center py-4 border-l">
        <div className="flex flex-col gap-4 my-4">
          {/* Profile Circle */}
          <button
            type="button"
            aria-label="Open profile panel"
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 focus-ring"
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

          {/* Help Icon */}
          <button
            type="button"
            aria-label="Help"
            className="w-10 h-10 rounded-full surface text-gray-500 dark:text-gray-300 flex items-center justify-center text-sm font-semibold cursor-pointer focus-ring"
          >
            <IoMdHelp
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              size={18}
            />
          </button>

          {/* Settings Icon */}
          <button
            type="button"
            aria-label="Open settings popover"
            aria-expanded={isSettingsOpen}
            aria-controls="settings-popover"
            className="w-10 h-10 rounded-full surface text-gray-500 dark:text-gray-300 flex items-center justify-center text-sm font-semibold cursor-pointer relative focus-ring"
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
      </div>

      {/* Profile Pop */}
      <div>
        <ProfilePop
          isOpen={isProfileOpen}
          user={{ ...user, profileImage: getProfileImage() }}
          onClose={() => setIsProfileOpen(false)}
        />
      </div>

      {/* Settings Pop */}
      <SettingsPop
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default RightSidebar;
