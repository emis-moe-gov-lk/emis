import { HiSearch, HiPlus, HiUpload } from "react-icons/hi";
import { Badge, TextInput } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function DosHeader({ 
  count = 0,  // Changed from 'total' to 'count' to match parent component
  search, 
  onSearchChange
}) {
  const navigate = useNavigate();
  const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Zonal Administrators
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            <span className="font-semibold">
             Manage Zonal Administrator profiles and deployment records.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="blue" size="lg">
            Total: {count || 0}
          </Badge>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <TextInput
            id="search"
            type="text"
            icon={HiSearch}
            placeholder="Search by NIC..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Upload */}
          {permissions.includes("teacher.bulk.upload") && (
            <button
              onClick={() => navigate("bulk-upload")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <HiUpload className="h-4 w-4" />
              Bulk Upload
            </button>
          )}

          {/* Add Edu Director */}
          <button
            onClick={() => navigate("create")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <HiPlus className="h-4 w-4" />
            Add Zonal Administrators
          </button>
        </div>
      </div>
    </div>
  );
}