import { Badge, TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import { HiSearch, HiUpload, HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

export default function DosHeader({
  count,
  isZonalAdmins,
  search,
  setSearch,
  title,
  description,
  searchPlaceholder,
  createLabel,
  loadingLabel,
}) {
  const navigate = useNavigate();

  const resolvedTitle =
    title ||
    (isZonalAdmins
      ? "Zonal Administrator Directory"
      : "Development Officer Directory");
  const resolvedDescription =
    description ||
    (isZonalAdmins
      ? "Manage zonal administrator profiles and records."
      : "Manage development officer profiles and records.");
  const resolvedSearchPlaceholder =
    searchPlaceholder ||
    (isZonalAdmins
      ? "Search Zonal Administrators"
      : "Search Development Officers");
  const resolvedCreateLabel =
    createLabel ||
    (isZonalAdmins ? "Add Zonal Administrator" : "Add Development Officer");

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {resolvedTitle}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {resolvedDescription}
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
            placeholder={resolvedSearchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("bulk-upload")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <HiUpload className="h-4 w-4" />
            Bulk Upload
          </button>

          <button
            onClick={() => navigate("create")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiPlus />
            {resolvedCreateLabel}
          </button>
        </div>
      </div>

      {loadingLabel ? (
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {loadingLabel}
        </p>
      ) : null}
    </div>
  );
}
