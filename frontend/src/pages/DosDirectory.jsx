import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DosHeader from "../components/dos/DosHeader";
import DosList from "../components/dos/DosList";
import DosSearchModal from "../components/dos/DosSearchModal";
import { getDosAdmins, getDeoOfficers } from "../api/deoOfficerService";

export default function DosDirectory() {
  const [employees, setEmployees] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  const isDeoRoute = location.pathname.includes("development-officers");

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = isDeoRoute ? await getDeoOfficers() : await getDosAdmins();
      setEmployees(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full px-4 sm:px-6 lg:px-8 mx-auto min-h-screen">
      <DosHeader
        count={employees.length}
        onSearch={() => setShowSearch(true)}
      />

      {loading && <p className="text-center text-gray-500 mt-10">Loading...</p>}

      {error && <p className="text-center text-red-500 mt-10">{error}</p>}

      {!loading && !error && <DosList employees={employees} />}

      <DosSearchModal
        open={showSearch}
        onClose={() => setShowSearch(false)}
        employees={employees}
      />
    </div>
  );
}
