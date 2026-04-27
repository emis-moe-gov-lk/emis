import { IoSearchOutline, IoArrowUpOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function DosHeader({ count, onSearch }) {
  const navigate = useNavigate();
  const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

  return (
    <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
          Development Officer Directory
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          <span className="text-indigo-600 font-bold">
            {count} Profiles Registered
          </span>
        </p>
      </div>

      <div className="flex gap-3 flex-wrap h-2.5">
        {/* Search */}
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-white shadow rounded-md text-sm hover:bg-gray-100"
        >
          <IoSearchOutline className="text-lg" />
          <span>Search DOS Officers</span>
        </button>

        {/* Bulk Upload */}
        {permissions.includes("teacher.bulk.upload") && (
          <button
            onClick={() => navigate("bulk-upload")}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 shadow-sm text-sm rounded-md hover:bg-gray-100"
          >
            <IoArrowUpOutline className="text-lg" />
            <span>Bulk Upload</span>
          </button>
        )}

        {/* Add */}
        <button
          onClick={() => navigate("create")}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
        >
          <span className="text-lg">+</span>
          <span>Add DOS Officer</span>
        </button>
      </div>
    </div>
  );
}
