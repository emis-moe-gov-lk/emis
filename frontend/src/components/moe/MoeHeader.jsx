import { TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import { HiSearch, HiUpload, HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import Button from "@/components/UiComponents/Button";

export default function MoeHeader({
  count,
  search,
  setSearch,
  loadingLabel,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MOE Administrator Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage Ministry of Education (MOE) administrator and director profiles and records.
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
            id="moe-search"
            type="text"
            icon={HiSearch}
            placeholder="Search MOE Administrators"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Can permission={PermissionGroups.MOE.ADMIN_BULK_UPLOAD}>
            <Button
              variant="secondary"
              icon={<HiUpload className="h-4 w-4" />}
              onClick={() => navigate("bulk-upload")}
            >
              Bulk Upload
            </Button>
          </Can>

          <Can permission={PermissionGroups.MOE.ADMIN_CREATE}>
            <Button
              icon={<HiPlus />}
              onClick={() => navigate("create")}
            >
              Add MOE Administrator
            </Button>
          </Can>
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
