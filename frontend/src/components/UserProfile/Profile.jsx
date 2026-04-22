import React from "react";
import AvatarUploader from "./SettingsPage/AvatarUploader";
import { FiEdit2 } from "react-icons/fi";
import Button from "../UiComponents/Button";
import { HiArrowLeft } from "react-icons/hi";
import ProfileHeader from "./ProfileSections/ProfileHeader";
import SectionsUi from "./ProfileSections/SectionsUi";
import {
  contactData,
  healthData,
  locationData,
  personalData,
} from "../../data/profile";

const Profile = () => {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <Button text="Back To List" icon={<HiArrowLeft />} />
        <div className="flex items-center justify-between my-5">
          <ProfileHeader />
        </div>

        <SectionsUi
          title="Personal & Cultural"
          data={personalData}
          onEdit={() => console.log("Edit Personal")}
        />

        <SectionsUi
          title="Health"
          data={healthData}
          onEdit={() => console.log("Edit Health")}
        />

        <SectionsUi
          title="Contact"
          data={contactData}
          onEdit={() => console.log("Edit Contact")}
        />

        <SectionsUi
          title="Location"
          data={locationData}
          onEdit={() => console.log("Edit Location")}
        />

        <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
              {/* <div className="">
              
              </div> */}
              <div className="order-3 xl:order-2">
                <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
                  Mohammed Shadhir
                </h4>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Teacher
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Zahira College Mawanella
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    First Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Mohammed
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Last Name
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    shadhir
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Email address
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    shadhir@pimjo.com
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    +09 363 398 46
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Bio
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    teacher at Zahira College Mawanella
                  </p>
                </div>
              </div>
            </div>

            <button className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              <FiEdit2 className="text-gray-500 dark:text-gray-300" size={16} />
              Edit
            </button>
          </div>
        </div>
        <div class="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
                Address
              </h4>

              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Country
                  </p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                    United States
                  </p>
                </div>

                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    City/State
                  </p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                    Arizona, United States.
                  </p>
                </div>

                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    Postal Code
                  </p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                    ERT 2489
                  </p>
                </div>

                <div>
                  <p class="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    TAX ID
                  </p>
                  <p class="text-sm font-medium text-gray-800 dark:text-white/90">
                    AS4568384
                  </p>
                </div>
              </div>
            </div>

            <button className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              <FiEdit2 className="text-gray-500 dark:text-gray-300" size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
