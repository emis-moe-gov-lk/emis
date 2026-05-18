import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiSearch,
  HiUser,
  HiPlus,
} from "react-icons/hi";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import api from "@/api/axios";
import DirectoryCard from "@/components/common/DirectoryCard";

const PrincipalList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const getAppointmentStatus = (appointment) => {
    if (
      String(appointment?.profile_status ?? "")
        .trim()
        .toLowerCase() === "revised" ||
      appointment?.is_verified === 3
    ) {
      return { label: "Revised", color: "purple" };
    }

    if (appointment?.is_confirmed === 1) {
      return { label: "Confirmed", color: "success" };
    }

    if (appointment?.is_verified === 2) {
      return { label: "Rejected", color: "failure" };
    }

    if (appointment?.is_verified === 1) {
      return { label: "Verified", color: "info" };
    }

    return { label: "Pending", color: "warning" };
  };

  const fetchPrincipals = (pageNumber = 1) => {
    setLoading(true);
    api
      .get(`/principals-list?page=${pageNumber}&per_page=10&nic=${search}`)
      .then((res) => {
        if (res.data?.status === "success") {
          setPrincipals(res.data.data.data || []);
          setPage(res.data.data.current_page);
          setLastPage(res.data.data.last_page);
          setTotal(res.data.data.total);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchPrincipals(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    if (page === 1) return;
    fetchPrincipals(page);
  }, [page]);

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Principals
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Review principal profiles and their current workplace details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="blue" size="lg">
            Total: {total}
          </Badge>
          <Can permission={PermissionGroups.PRINCIPAL.CREATE}>
            <button
              onClick={() => navigate("/employees/principal/create")}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <HiPlus className="w-4 h-4" />
              Create Principal
            </button>
          </Can>
        </div>
      </div>

      <div className="w-full sm:max-w-md">
        <TextInput
          id="search"
          type="text"
          icon={HiSearch}
          placeholder="Search by NIC..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading Principals List...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {principals.length > 0 ? (
            <>
              {principals.map((principal) => {
                const appointmentStatus = getAppointmentStatus(
                  principal.appointment,
                );

                return (
                  <DirectoryCard
                    key={principal.people_id}
                    employee={principal}
                    name={principal.full_name}
                    nic={principal.nic}
                    secondaryField={
                      principal.principal?.recruitmentCategory?.category_name ||
                      "-"
                    }
                    secondaryFieldLabel="Recruitment Category"
                    workplace={
                      principal.current_appointment?.workplace?.institution
                        ?.name || "No Workplace"
                    }
                    address={
                      principal.current_appointment?.workplace?.institution
                        ?.address || "-"
                    }
                    phone={principal.phone || "-"}
                    status={appointmentStatus.label}
                    statusColor={appointmentStatus.color}
                    permissions={{
                      view: PermissionGroups.PRINCIPAL.PROFILE_VIEW,
                    }}
                    onView={(employee) => {
                      navigate(`/employees/principal/${employee.people_id}`);
                    }}
                  />
                );
              })}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                  Showing page{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {lastPage}
                  </span>
                </span>

                <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                  <Button
                    color="gray"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm enabled:hover:text-blue-600"
                  >
                    <HiChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    color="gray"
                    disabled={page === lastPage}
                    onClick={() => setPage(page + 1)}
                    className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm enabled:hover:text-blue-600"
                  >
                    Next
                    <HiChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                <HiUser className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No principals found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                No principals match this search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrincipalList;
