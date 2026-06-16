import { Badge, TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import { HiSearch, HiUpload, HiPlus } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

export default function DosHeader({ count, isZonalAdmins, search, setSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isProvincialDirector = location.pathname.includes("/employees/provincialdirector");
  const isProvincialAdmins = location.pathname.includes("/employees/provincial-administrators");
  const isMoeAdmins = location.pathname.includes("/employees/moe-administrators");
  const isProvincialDeo = location.pathname.includes("/employees/provincial-deo");

  const title = isProvincialDirector
    ? "Provincial Director Directory"
    : isProvincialAdmins
    ? "Provincial Administrator Directory"
    : isProvincialDeo
    ? "Provincial DEO Directory"
    : isZonalAdmins
    ? "Zonal Administrator Directory"
    : "Development Officer Directory";
  const description = isProvincialDirector
    ? "Manage provincial director profiles and records."
    : isProvincialAdmins
    ? "Manage provincial administrator profiles and records."
    : isProvincialDeo
    ? "Manage provincial DEO profiles and records."
    : isZonalAdmins
    ? "Manage zonal administrator profiles and records."
    : "Manage development officer profiles and records.";

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge className="px-3 py-1 font-bold text-sm">
            {`Total: ${count || 0}`}
          </StatusBadge>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <TextInput
            id="dos-search"
            type="text"
            icon={HiSearch}
            placeholder={isProvincialDirector
              ? "Search Provincial Directors"
              : isProvincialAdmins
              ? "Search Provincial Administrators"
              : isMoeAdmins
              ? "Search MOE Administrators"
              : isProvincialDeo
              ? "Search Provincial DEO"
              : isZonalAdmins
              ? "Search Zonal Administrators"
              : "Search DOS Officers"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Can permission={PermissionGroups.ZONAL.ADMIN_BULK_UPLOAD}>
            <button
              onClick={() => navigate("bulk-upload")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <HiUpload className="h-4 w-4" />
              Bulk Upload
            </button>
          </Can>

          <Can permission={PermissionGroups.ZONAL.ADMIN_CREATE}>  
            <button
              onClick={() => navigate("create")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <HiPlus />
              {isProvincialDirector
                ? "Add Provincial Director"
                : isProvincialAdmins
                ? "Add Provincial Administrator"
                : isMoeAdmins
                ? "Add MOE Administrator"
                : isProvincialDeo
                ? "Add Provincial DEO"
                : isZonalAdmins
                ? "Add Zonal Administrator"
                : "Add DOS Officer"}
            </button>
          </Can>
        </div>
      </div>
    </div>
  );
}
