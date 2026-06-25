import { useEffect, useState, useMemo } from "react";
import DosHeader from "@/components/dos/DosHeader";
import MoeAdminList from "@/components/moe/MoeAdminList";
import { getAllMoeAdmins } from "@/api/moeAdminService";
import { Spinner } from "flowbite-react";

export default function MoeAdminDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await getAllMoeAdmins();
        if (response.status === "success") {
          setEmployees(response.data);
        } else {
          setError(response.message || "Failed to fetch MOE administrators");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching MOE administrators");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;

    return employees.filter((employee) => {
      const haystack = [
        employee.name_with_initials,
        employee.nic,
        employee.email,
        employee.phone,
        employee.current_appointment?.position?.position_name,
        employee.current_appointment?.workplace?.office_name,
        employee.current_appointment?.workplace?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, employees]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 mx-auto space-y-6 bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <DosHeader
        count={filteredEmployees.length}
        search={search}
        setSearch={setSearch}
        isZonalAdmins={true}
        title="MOE Administrator Directory"
        description="Manage Ministry of Education (MOE) administrator and director profiles and records."
        searchPlaceholder="Search MOE Administrators"
        createLabel="Add MOE Administrator"
        createPath="/employees/moe/admin/create"
      />

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <MoeAdminList employees={filteredEmployees} />
      )}
    </div>
  );
}
