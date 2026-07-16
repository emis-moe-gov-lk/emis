import { useEffect, useState, useMemo } from "react";
import ProvincialHeader from "@/components/provincial/ProvincialHeader";
import ProvincialList from "@/components/provincial/ProvincialList";
import { getAllProvincialAdmins } from "@/api/provincialAdminService";
import { Spinner } from "flowbite-react";
import { PermissionGroups } from "@/data/permissionGroups";

export default function ProvincialAdminDirectory() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await getAllProvincialAdmins();
        if (response.status === "success") {
          setEmployees(response.data);
        } else {
          setError(response.message || "Failed to fetch provincial administrators");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching provincial administrators");
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
      <ProvincialHeader
        count={filteredEmployees.length}
        search={search}
        setSearch={setSearch}
        title="Provincial Administrator Directory"
        description="Manage provincial administrator profiles and records."
        searchPlaceholder="Search Provincial Administrators"
        createLabel="Add Provincial Administrator"
        createPath="/employees/provincial/admin/create"
        permission={PermissionGroups.PROVINCIAL.ADMIN_CREATE}
      />

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <ProvincialList employees={filteredEmployees} />
      )}
    </div>
  );
}
