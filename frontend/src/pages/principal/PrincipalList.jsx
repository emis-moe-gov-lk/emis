import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiEye,
  HiLocationMarker,
  HiPhone,
  HiSearch,
  HiUser,
} from "react-icons/hi";
import api from "@/api/axios";

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
      String(appointment?.profile_status ?? "").trim().toLowerCase() ===
        "revised" ||
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
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
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
                const appointmentStatus = getAppointmentStatus(principal.appointment);

                return (
                  <div
                    key={principal.people_id}
                    className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:border-blue-100 dark:hover:border-blue-900/30"
                  >
                    <div className="flex items-center gap-4 min-w-[60px]">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <HiUser className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {principal.full_name}
                        </h3>
                        <p className="text-xs font-bold text-blue-600 mt-0.5 truncate">
                          NIC: {principal.nic || "-"}
                        </p>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Recruitment Category
                        </p>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                          {principal.principal?.recruitmentCategory?.category_name || "-"}
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Workplace Address
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <HiLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {principal.current_appointment?.workplace?.institution?.name ||
                              "No Workplace"}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-gray-400 truncate">
                          {principal.current_appointment?.workplace?.institution?.address || "-"}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Contact
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          <HiPhone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{principal.phone || "-"}</span>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex items-center justify-end gap-2 flex-nowrap">
                        <Badge color={appointmentStatus.color} className="px-3 py-1 whitespace-nowrap">
                          {appointmentStatus.label}
                        </Badge>
                        <Button
                          size="xs"
                          color="light"
                          onClick={() => navigate(`/employees/principal/${principal.people_id}`)}
                          className="border-gray-200"
                        >
                          <HiEye className="mr-1 h-4 w-4" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                  Showing page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{lastPage}</span>
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