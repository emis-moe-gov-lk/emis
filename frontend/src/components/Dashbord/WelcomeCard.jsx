import welcomeImage from "/welcome.png";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { useAuthUser } from "@/context/useAuthUser";

const WelcomeCard = ({ user }) => {
  console.log("WelcomeCard received user:", user);
  const { roles: authRoles = [], workplace: authWorkplace = null } = useAuthUser();
  const capitalizeFirstLetter = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const today = capitalizeFirstLetter(new Date().toDateString());

  const roles = Array.isArray(user?.roles) && user.roles.length ? user.roles : authRoles;
  const lowercaseRoles = roles.map((r) => String(r).trim().toLowerCase().replace(/\s+/g, " "));

  // 1. Zonal roles
  const hasZonalRole = lowercaseRoles.some((r) =>
    ["zonal deo", "zonal deo head", "zonal director", "zonal deputy director"].includes(r)
  );

  // 2. Provincial roles
  const hasProvincialRole = lowercaseRoles.some((r) =>
    ["provincial director", "provincial deputy director", "provincial subject head", "provincial clerk (deo)", "provincial admin", "provincial deo"].includes(r)
  );

  // 3. Divisional roles
  const hasDivisionalRole = lowercaseRoles.some((r) =>
    ["divisional head", "divisional deo", "divisional deputy director"].includes(r)
  );

  // 4. School level roles (Teachers/Principals/School DEOs)
  const hasSchoolRole = lowercaseRoles.some((r) =>
    ["teacher", "principal", "vice principal / dep principal", "school deo"].includes(r)
  );

  // Resolve names from user profile data
  const provinceName = user?.province?.province_name ?? "";
  const zoneName = user?.zone?.short_name ?? user?.zone?.name ?? "";
  const divisionName = user?.division?.short_name ?? user?.division?.name ?? "";
  const schoolName = user?.school?.name ?? "";

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#635BFF] via-[#564df0] to-[#4338ca] p-10 shadow-2xl shadow-indigo-200 text-white">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
        <div className="w-full md:w-3/5 space-y-6">
          {/* Date */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wider uppercase">
            {today}
          </div>

          {/* Welcome Title */}
          <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.1]">
            Welcome Back,
            <br /> {user?.name}!
          </h3>

          {/* Geographical / Placement Details */}
          {(hasZonalRole || hasProvincialRole || hasDivisionalRole || hasSchoolRole) && (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-2xl">
              {hasSchoolRole && schoolName && (
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md md:col-span-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-100/90">
                    School / Institution
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white truncate" title={schoolName}>
                    {schoolName}
                  </p>
                </div>
              )}
              {(hasProvincialRole || hasZonalRole || hasDivisionalRole || hasSchoolRole) && provinceName && (
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-100/90">
                    Province
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white truncate" title={provinceName}>
                    {provinceName}
                  </p>
                </div>
              )}
              {(hasDivisionalRole || hasSchoolRole) && divisionName && (
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-100/90">
                    Division
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white truncate" title={divisionName}>
                    {divisionName}
                  </p>
                </div>
              )}
              {(hasZonalRole || hasDivisionalRole || hasSchoolRole) && zoneName && (
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-100/90">
                    Zone
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white truncate" title={zoneName}>
                    {zoneName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Profile Status */}
          {/* <p className="text-indigo-100 text-lg font-medium max-w-md opacity-90">
            Your profile{" "}
            <span className="text-white underline decoration-teal-400 underline-offset-4">
              {people?.appointment?.is_verified ? "Verified" : "Not Verified"}
            </span>
            . Please check your profile and update your information if needed.
          </p> */}

          {/* Button */}
          {/* <Can permission={PermissionGroups.DASHBOARD.VIEW_MYPROFILE}>
            <a
              href="/dashboard/profile"
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
            >
              👤 My Profile
            </a>
          </Can> */}
        </div>

        {/* Image */}
        <div className="hidden md:block relative w-full md:w-2/5 h-64">
          <img
            src={welcomeImage}
            alt="Dashboard Illustration"
            className="absolute bottom-0 right-0 h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      {/* Background Glow Effects */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute left-1/4 top-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default WelcomeCard;
