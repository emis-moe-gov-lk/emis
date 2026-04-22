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
      <div className="top-0 right-0 h-screen my-4 w-14 bg-gray-100 flex flex-col justify-end items-center py-4">
        <div className="flex flex-col gap-4 my-4">
          {/* Profile Circle */}
          <div
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500"
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
          </div>

          {/* Help Icon */}
          <div className="w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center text-sm font-semibold cursor-pointer">
            <IoMdHelp
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              size={18}
            />
          </div>

          {/* Settings Icon */}
          <div
            className="w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center text-sm font-semibold cursor-pointer relative"
            onClick={() => {
              setIsProfileOpen(false);
              setIsSettingsOpen(true);
            }}
          >
            <IoMdSettings
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
              size={18}
            />
          </div>
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
