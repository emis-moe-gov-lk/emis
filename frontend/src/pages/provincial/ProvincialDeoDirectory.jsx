import { useEffect, useState, useMemo } from "react";
import DosHeader from "@/components/dos/DosHeader";
import DosList from "@/components/dos/DosList";
import { getAllProvincialDeos } from "@/api/provincialDeoService";
import { Spinner } from "flowbite-react";

export default function ProvincialDeoDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await getAllProvincialDeos();
        if (response.status === "success") {
          setEmployees(response.data);
        } else {
          setError(response.message || "Failed to fetch provincial DEOs");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching provincial DEOs");
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
        isZonalAdmins={false}
        title="Provincial DEO Directory"
        description="Manage provincial DEO profiles and records."
        searchPlaceholder="Search Provincial DEOs"
        createLabel="Add Provincial DEO"
        createPath="/employees/provincial/deo/create"
      />

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <DosList employees={filteredEmployees} />
      )}
    </div>
  );
}
