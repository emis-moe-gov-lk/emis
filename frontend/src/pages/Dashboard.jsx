"use client";

import { useEffect, useState, useContext } from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { AbilityContext } from "@/auth/AbilityContext";
import { Can } from "@casl/react";
import { Button, Badge } from "flowbite-react";
import {
  HiAcademicCap,
  HiUserGroup,
  HiOfficeBuilding,
  HiUserAdd,
  HiArrowRight,
  HiLightningBolt,
  HiOutlineBell,
} from "react-icons/hi";
import TimetableWidget from "../components/TimetableWidget.jsx";

export default function Dashboard() {
  const { state, getDecodedIDToken } = useAuthContext();
  const [userName, setUserName] = useState("User");
  const [userRoles, setUserRoles] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const ability = useContext(AbilityContext);

  useEffect(() => {
    // Format: "Wednesday, February 18, 2026"
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));

    if (state.isAuthenticated) {
      getDecodedIDToken().then((token) => {
        // Use name, family_name, or username
        setUserName(
          token?.name || token?.family_name || token?.email || "User",
        );
        console.log(token);

        // Robust role extraction matching AbilityProvider.jsx
        const roles = token?.roles || token?.groups || token?.role || [];
        const rolesArray = Array.isArray(roles) ? roles : [roles];

        // Filter out system roles if needed, like 'everyone'
        setUserRoles(rolesArray.filter((r) => r !== "everyone"));
      });
    }
  }, [state.isAuthenticated, getDecodedIDToken]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">

        <div className="grid grid-cols-3">
      {/* Welcome Banner (Figma) */}
      <section className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-900 text-white px-6 py-8 lg:px-10 lg:py-10 shadow-xl shadow-blue-500/20 col-span-2">
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="min-w-0">
            <Badge
              color="info"
              size="sm"
              className="w-fit bg-white/20 text-white border-0 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold"
            >
              {currentDate || "Education HRMS v1.0"}
            </Badge>
            <h1 className="mt-4 text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome Back,
            </h1>
            <p className="mt-1 text-lg lg:text-xl text-white/95 font-medium truncate">
              {userName}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {userRoles.map((role, idx) => (
                <Badge
                  key={idx}
                  color="warning"
                  size="xs"
                  className="bg-yellow-400/20 text-yellow-300 border-yellow-400/30 font-bold uppercase tracking-tighter"
                >
                  {role}
                </Badge>
              ))}
            </div>

            <Can I="create" a="teacher.manage" ability={ability}>
              <div className="mt-4 flex items-center gap-2 text-indigo-300 font-bold text-sm bg-indigo-400/10 w-fit px-3 py-1 rounded-lg border border-indigo-400/20 shadow-sm shadow-indigo-500/10">
                <span className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" />
                Teacher View Active
              </div>
            </Can>

            <p className="mt-4 text-sm lg:text-base text-white/90 max-w-2xl leading-relaxed font-light">
              Here's what's happening with your institutions and staff today.
              You have{" "}
              <span className="font-bold text-white underline underline-offset-4 decoration-white/30">
                3 new tasks
              </span>{" "}
              pending review.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-blue-400/20 blur-3xl font-bold" />
      </section>


        <TimetableWidget />

        </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Institutions"
          value="10130"
          icon={<HiOfficeBuilding className="w-6 h-6" />}
          chipClass="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
        />
        <StatCard
          title="Active Teachers"
          value="24500"
          icon={<HiAcademicCap className="w-6 h-6" />}
          chipClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Total Students"
          value="42K"
          icon={<HiUserGroup className="w-6 h-6" />}
          chipClass="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          title="New Registrations"
          value="10130"
          icon={<HiUserAdd className="w-6 h-6" />}
          chipClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl grid place-items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-800/50">
              <HiLightningBolt className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <ActionCard
              title="Add Institution"
              desc="Register a new school or office"
              tone="blue"
            />
            <ActionCard
              title="Add Staff"
              desc="Create a new teacher profile"
              tone="red"
            />
            <ActionCard
              title="View Reports"
              desc="Analyze performance stats"
              tone="green"
            />
          </div>
        </div>

        {/* System Updates */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl grid place-items-center bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100/50 dark:border-amber-800/50">
              <HiOutlineBell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              System Updates
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800/50 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="w-3 h-3 mt-1.5 bg-blue-600 dark:bg-blue-500 rounded-full shrink-0 shadow-lg shadow-blue-500/40" />
              <div className="space-y-3">
                <p className="font-bold text-gray-900 dark:text-white">
                  Annual Transfers Open
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  The module for annual teacher transfers will be open starting{" "}
                  <strong className="text-blue-600 dark:text-blue-400">
                    July 15th
                  </strong>
                  . Please ensure all profiles are updated before this date.
                </p>
                <Button
                  size="xs"
                  className="mt-3 border-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl px-4"
                >
                  Read Guidelines
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, chipClass }) {
  return (
    <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm px-6 py-5 backdrop-blur-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl grid place-items-center shadow-sm ${chipClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, tone }) {
  const toneMap = {
    blue: {
      border: "border-blue-100 dark:border-blue-900/50",
      bg: "bg-blue-50/50 dark:bg-blue-900/20",
      shadow: "shadow-blue-500/5",
      icon: "text-blue-600 dark:text-blue-400",
    },
    red: {
      border: "border-red-100 dark:border-red-900/50",
      bg: "bg-red-50/50 dark:bg-red-900/20",
      shadow: "shadow-red-500/5",
      icon: "text-red-600 dark:text-red-400",
    },
    green: {
      border: "border-emerald-100 dark:border-emerald-900/50",
      bg: "bg-emerald-50/50 dark:bg-emerald-900/20",
      shadow: "shadow-emerald-500/5",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
  };

  const t = toneMap[tone] || toneMap.blue;

  return (
    <button
      type="button"
      className={`group w-full text-left rounded-3xl border ${t.border} ${t.bg} p-6 shadow-sm ${t.shadow} hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 dark:text-white">
            {title}
          </span>
          <div
            className={`p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${t.icon}`}
          >
            <HiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
          {desc}
        </span>
      </div>
    </button>
  );
}
