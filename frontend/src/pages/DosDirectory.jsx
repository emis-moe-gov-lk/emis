import { useEffect, useState } from "react";
import DosHeader from "../components/dos/DosHeader";
import DosList from "../components/dos/DosList";
import DosSearchModal from "../components/dos/DosSearchModal";
import { getDosAdmins } from "../api/deoOfficerService";

export default function DosDirectory() {
  const [employees, setEmployees] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDosAdmins();
      setEmployees(data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load DOS admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
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
