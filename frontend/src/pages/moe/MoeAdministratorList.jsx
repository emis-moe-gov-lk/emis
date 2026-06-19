import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, TextInput } from "flowbite-react";
import { HiPlus, HiSearch, HiUser } from "react-icons/hi";
import DirectoryCard from "@/components/common/DirectoryCard";
import StatusBadge from "@/components/common/StatusBadge";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { getAllMoeAdministrators } from "@/api/moeAdministratorService";

export default function MoeAdministratorList() {
  const navigate = useNavigate();
  const [administrators, setAdministrators] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdministrators = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllMoeAdministrators({ search });
      setAdministrators(result.data || result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch MOE administrators");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdministrators();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => fetchAdministrators(), 400);
    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6 min-h-screen">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MOE Administrator Directory
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Manage ministry administrator profiles and records.
            </p>
          </div>

          <StatusBadge className="px-3 py-1 font-bold text-sm">
            {`Total: ${administrators.length || 0}`}
          </StatusBadge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="w-full sm:max-w-md">
            <TextInput
              id="moe-administrator-search"
              type="text"
              icon={HiSearch}
              placeholder="Search MOE Administrators"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Can permission={PermissionGroups.MOE.MOE_VIEW}>
            <button
              onClick={() => navigate("create")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <HiPlus />
              Add MOE Administrator
            </button>
          </Can>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading MOE Administrators List...
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-red-100 dark:border-red-900">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
            <HiUser className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Error loading MOE administrators
          </h3>
          <p className="text-red-500 max-w-sm mx-auto mt-2">{error}</p>
        </div>
      ) : administrators.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
            <HiUser className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No MOE Administrators found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            No administrators match this search.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {administrators.map((administrator) => (
            <DirectoryCard
              key={administrator.id}
              employee={administrator}
              name={administrator.name_with_initials || administrator.name}
              nic={administrator.nic}
              position={administrator.current_appointment?.position?.position_name}
              service={administrator.current_appointment?.service?.service_name}
              workplace={administrator.current_appointment?.workplace?.name}
              address={administrator.address_line1}
              phone={administrator.phone}
              email={administrator.email}
              status={administrator.confirmed ? "Confirmed" : "Pending"}
              statusColor={administrator.confirmed ? "success" : "warning"}
              showProfilePicture
              genderId={administrator.gender_id}
              permissions={{ view: PermissionGroups.MOE.MOE_VIEW }}
              onView={(employee) => navigate(`/employees/moe-administrators/${employee.people_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
