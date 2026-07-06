import { TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import { HiSearch, HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

export default function ProvincialHeader({
  count,
  search,
  setSearch,
  title,
  description,
  searchPlaceholder,
  createLabel,
  createPath,
  loadingLabel,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title || "Provincial Directory"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {description || "Manage provincial profiles and records."}
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
            id="provincial-search"
            type="text"
            icon={HiSearch}
            placeholder={searchPlaceholder || "Search..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(createPath || "create")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiPlus />
            {createLabel || "Add New"}
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
