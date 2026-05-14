import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { HiUser } from "react-icons/hi";
import DosHeader from "../components/dos/DosHeader";
import DosList from "../components/dos/DosList";
import DosSearchModal from "../components/dos/DosSearchModal";
import { useDosService } from "../services/dosService";
import { getAllDosAdmins } from "../api/dosAdminService";

export default function DosDirectory() {
  const [employees, setEmployees] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getAllDos } = useDosService();
  const location = useLocation();
  const isZonalAdmins = location.pathname.includes("/employees/edu-directors");

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      if (isZonalAdmins) {
        data = await getAllDosAdmins();
        setEmployees(data.data || data);
      } else {
        data = await getAllDos();
        setEmployees(data.data || data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6 min-h-screen">
      <DosHeader
        count={employees.length}
        onSearch={() => setShowSearch(true)}
        isZonalAdmins={isZonalAdmins}
      />

      {/* ================= LIST / LOADING ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            {isZonalAdmins ? "Loading Zonal Administrators List..." : "Loading Development Officers List..."}
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-red-100 dark:border-red-900">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
            <HiUser className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Error loading officers
          </h3>
          <p className="text-red-500 max-w-sm mx-auto mt-2">{error}</p>
        </div>
      ) : (
        <DosList employees={employees} />
      )}

      <DosSearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        employees={employees}
      />
    </div>
  );
}
