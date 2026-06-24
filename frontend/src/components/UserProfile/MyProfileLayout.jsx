import React, { useEffect, useState } from "react";
import MyProfileHeader from "./ProfileSections/MyProfileHeader";
import PersonalProfile from "./ProfileSections/PersonalProfile";
import EducationalQualifications from "./ProfileSections/EducationalQualifications";
import HealthInformation from "./ProfileSections/HealthInformation";
import ContactDetails from "./ProfileSections/ContactDetails";
import LocationDetails from "./ProfileSections/LocationDetails";
import TemporaryLocation from "./ProfileSections/TemporaryLocation";
import IntroCard from "./ProfileSections/IntroCard";
import EmploymentStatus from "./ProfileSections/EmploymentStatus";
import FirstAppointment from "./ProfileSections/FirstAppointment";
import PreviousService from "./ProfileSections/PreviousService";
import ServiceHistory from "./ProfileSections/ServiceHistory";
import PensionPaymentDetails from "./ProfileSections/PensionPaymentDetails";
import FamilyManagement from "./ProfileSections/FamilyManagement";
import EditRequestTimeline from "./ProfileSections/EditRequestTimeline";
import EditRequestModal from "./ProfileSections/EditRequestModal";
import axios from "axios";
import Spinner from "../UiComponents/Spinner";
import { useAuthContext } from "@asgardeo/auth-react";
import { useParams } from "react-router-dom";
import { getEditRequests } from "@/api/userService";
import { getEnv } from "../../utils/env";

const MyProfileLayout = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [profileData, setProfileData] = useState(null);
  const [editRequests, setEditRequests] = useState([]);
  const [editRequestsLoaded, setEditRequestsLoaded] = useState(false);
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const { getAccessToken } = useAuthContext();
  const { id: peopleId } = useParams();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const peopleId = localStorage.getItem("peopleId"); // Get the ID from local storage
        if (!peopleId) return;

        const token = await getAccessToken();

        const response = await axios.get(
          `${getEnv("VITE_API_BASE_URL")}/user/${peopleId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setProfileData(response.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [peopleId, getAccessToken]);

  const fetchEditRequests = async () => {
    const storedPeopleId = localStorage.getItem("peopleId");
    if (!storedPeopleId) return;
    try {
      const res = await getEditRequests(storedPeopleId);
      setEditRequests(res.data?.data ?? []);
      setEditRequestsLoaded(true);
    } catch (err) {
      console.error("Error fetching edit requests:", err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "Edit Request" && !editRequestsLoaded) {
      fetchEditRequests();
    }
  };

  if (!profileData) {
    <Spinner />;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto px-4">
      {/* HEADER */}
      <MyProfileHeader
        myprofile={profileData}
        permissions={{
          canEdit: true,
          canVerify: true,
          canConfirm: false,
          canDownload: true,
        }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSendEditRequest={() => setShowEditRequestModal(true)}
      />

      {/* MAIN CONTENT */}
      <div className="mt-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Show components based on active tab */}
          {activeTab === "General" && (
            <>
              <PersonalProfile employee={profileData} canEdit={true} />
              <HealthInformation employee={profileData} canEdit={true} />
              <ContactDetails employee={profileData} canEdit={true} />
              <LocationDetails employee={profileData} canEdit={true} />
              <TemporaryLocation />
            </>
          )}

          {activeTab === "Qualification" && (
            <EducationalQualifications canCreate={true} />
          )}

          {activeTab === "Employment" && (
            <div className="flex-1 space-y-6">
              <EmploymentStatus employee={profileData} canEdit={true} />
              <FirstAppointment employee={profileData} canEdit={true} />
              <PreviousService employee={profileData} canEdit={true} />
              <ServiceHistory
                employee={profileData}
                canEdit={true}
                userServicesOptions={[]}
                ranksOptions={[]}
                positionOption={[]}
              />
            </div>
          )}

          {activeTab === "W&OP" && (
            <div>
              <PensionPaymentDetails employee={profileData} canEdit={true} />
            </div>
          )}
          {activeTab === "Family" && (
            <div>
              <FamilyManagement
                employee={profileData}
                familyList={profileData?.family_list || []}
                childrenList={profileData?.children_list || []}
                canCreate={true}
                canDelete={true}
              />
            </div>
          )}
          {activeTab === "Edit Request" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowEditRequestModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  + New Request
                </button>
              </div>
              <EditRequestTimeline editRequests={editRequests} />
            </div>
          )}
        </div>

        {/* Right Side Card */}
        <div className="w-full lg:w-80">
          <div className="sticky top-6">
            <IntroCard
              myprofile={profileData}
              permissions={profileData?.permissions || {}}
            />
          </div>
        </div>
      </div>

      {showEditRequestModal && (
        <EditRequestModal
          onClose={() => setShowEditRequestModal(false)}
          onSuccess={() => {
            setEditRequestsLoaded(false);
            fetchEditRequests();
          }}
        />
      )}
    </div>
  );
};

export default MyProfileLayout;
