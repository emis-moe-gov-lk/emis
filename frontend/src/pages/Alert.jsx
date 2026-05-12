import React, { useState, useEffect } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BsFillTagFill } from "react-icons/bs";
import { HiShieldCheck, HiRefresh } from "react-icons/hi";
import { MdCancel, MdOutlineCancel } from "react-icons/md";
import Header from "../components/Alert/Header";
import AlertsOverview from "../components/Alert/AlertsOverview";
import PendingConfirmationList from "../components/Alert/PendingConfirmationList";
import PendingVerificationList from "../components/Alert/PendingVerificationList";
import RevisedList from "../components/Alert/RevisedList";
import RejectedList from "../components/Alert/RejectedList";
import api from "@/api/axios";

const Alert = () => {
  const [activeTab, setActiveTab] = useState("primary");
  const [counts, setCounts] = useState({
    pending_verification: 0,
    revised: 0,
    pending_confirmation: 0,
    rejected: 0,
  });

  useEffect(() => {
    api.get("/alerts/counts")
      .then((res) => {
        if (res.data?.status === "success") {
          setCounts(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const tabs = [
    {
      key: "primary",
      title: "Primary",
      subtitle: "General metrics",
      icon: <AiOutlineHome size={20} />,
      badge: null,
    },
    {
      key: "verification",
      title: "Verification",
      subtitle: "Profiles awaiting approval",
      icon: <BsFillTagFill size={20} />,
      badge: "PENDING",
      badgeColor: "bg-yellow-100 text-yellow-700",
    },
    {
      key: "revised",
      title: "Revised",
      subtitle: "Profiles revised after rejection",
      icon: <HiRefresh size={20} />,
      badge: "REVISED",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      key: "confirmation",
      title: "Confirmation",
      subtitle: "Identity & security checks",
      icon: <HiShieldCheck size={20} />,
      badge: "NEW",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      key: "rejection",
      title: "Rejection",
      subtitle: "Rejected profiles & requests",
      icon: <MdOutlineCancel size={20} />,
      badge: "REJECTED",
      badgeColor: "bg-red-100 text-red-700",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "primary":
        return (
          <AlertsOverview
            pendingVerificationCount={counts.pending_verification}
            revisedCount={counts.revised}
            pendingConfirmationCount={counts.pending_confirmation}
            rejectedCount={counts.rejected}
          />
        );
      case "confirmation":
        return <PendingConfirmationList />;
      case "verification":
        return <PendingVerificationList />;
      case "revised":
        return <RevisedList />;
      case "rejection":
        return <RejectedList />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <Header />

      {/* Professional Tabs */}
      <div className="flex border-b border-gray-200 mb-6 justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center justify-center px-6 py-3 -mb-px border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              <span className="font-semibold">{tab.title}</span>
              {tab.badge && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 mt-1">{tab.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default Alert;