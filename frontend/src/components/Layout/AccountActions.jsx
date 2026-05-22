import React, { useState } from "react";
import ProfilePop from "./ProfileModal";
import { resolveProfileImage } from "@/utils/profileImage";

const AccountActions = ({ layout = "sidebar" }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = {
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    gender: localStorage.getItem("gender"),
    profilePic: localStorage.getItem("profilePic"),
  };

  const getProfileImage = () => {
    return resolveProfileImage(user.profilePic, user.gender);
  };

  const isMobileLayout = layout === "mobile";
  const buttonStackClass = isMobileLayout
    ? "flex items-center gap-3 mr-4"
    : "flex items-center gap-3 mr-6";
  const profileButtonClass = isMobileLayout
    ? "w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 focus-ring"
    : "w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-blue-500 focus-ring";
  const profilePopoverClassName = isMobileLayout
    ? "right-0 top-14 w-60"
    : "right-0 top-14 w-60";

  return (
    <>
      <div className={buttonStackClass} >
        <button
          type="button"
          aria-label="Open profile panel"
          className={profileButtonClass}
          onClick={() => {
            setIsProfileOpen(true);
          }}
        >
          <img
            src={getProfileImage()}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

      </div>

      <ProfilePop
        isOpen={isProfileOpen}
        user={{ ...user, profileImage: getProfileImage() }}
        onClose={() => setIsProfileOpen(false)}
        className={profilePopoverClassName}
      />
    </>
  );
};

export default AccountActions;