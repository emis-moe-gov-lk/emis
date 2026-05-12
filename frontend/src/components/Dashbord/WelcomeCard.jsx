import welcomeImage from "/welcome.png";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { useAuthUser } from "@/context/useAuthUser";

const WelcomeCard = ({ user, people }) => {
  console.log("WelcomeCard received user:", user);
  const { roles: authRoles = [], workplace: authWorkplace = null } = useAuthUser();
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const roles = Array.isArray(user?.roles) && user.roles.length ? user.roles : authRoles;
  const isZonalDeo = roles.some(
    (role) => String(role).trim().toLowerCase() === "zonal deo",
  );

  const zonalEducationOffice =
    authWorkplace?.zonal_education_office ??
    user?.workplace?.zonal_education_office ??
    null;

  const provinceName =
    zonalEducationOffice?.province_name ??
    zonalEducationOffice?.district?.province?.name ??
    zonalEducationOffice?.district?.province?.province_name ??
    "";

  const zoneName =
    zonalEducationOffice?.short_name ?? zonalEducationOffice?.name ?? "";

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

          {isZonalDeo && (provinceName || zoneName) && (
            <div className="grid gap-3 sm:grid-cols-2 max-w-xl">
              {provinceName && (
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-100/90">
                    Province
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {provinceName}
                  </p>
                </div>
              )}
              {zoneName && (
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-indigo-100/90">
                    Zone
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
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
