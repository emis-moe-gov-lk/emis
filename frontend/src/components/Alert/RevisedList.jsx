import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import {
  HiUser,
  HiLocationMarker,
  HiSearch,
  HiEye,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import api from "@/api/axios";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

const RevisedList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/alerts/revised?per_page=20&page=${currentPage}`)
      .then((res) => {
        if (res.data?.status === "success") {
          setTeachers(res.data.data.data ?? []);
          setLastPage(res.data.data.last_page ?? 1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentPage]);

  const filteredTeachers = teachers.filter((t) =>
    [t.full_name, t.name_with_initials].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revised
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Teacher profiles that have been revised after rejection
          </p>
        </div>
        <Badge color="purple" size="lg">
          Revised
        </Badge>
      </div>

      <div className="w-full sm:max-w-md">
        <TextInput
          type="text"
          icon={HiSearch}
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="purple" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.length > 0 ? (
            <>
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.people_id}
                  onClick={() =>
                    navigate(`/employees/teacher/${teacher.people_id}`)
                  }
                  className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:border-purple-100 dark:hover:border-purple-900/30 cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-[60px]">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                      <HiUser className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-purple-600 transition-colors">
                        {teacher.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {teacher.name_with_initials}
                      </p>
                    </div>

                    <div className="md:col-span-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        School
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        <HiLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {teacher.current_appointment?.workplace?.institution
                            ?.name ?? "—"}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-gray-400 truncate">
                        {teacher.current_appointment?.workplace?.institution
                          ?.census_no ?? ""}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Appointment Date
                      </p>
                      <div className="text-sm text-gray-700 dark:text-gray-200">
                        {teacher.appointment?.first_appointment_date?.slice(
                          0,
                          10,
                        ) ?? "—"}
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                      <Badge
                        color="purple"
                        className="px-3 py-1 whitespace-nowrap"
                      >
                        Revised
                      </Badge>

                      <Can permission={PermissionGroups.ALERTS.PROFILE_REVISE}>
                        <Button
                          size="xs"
                          color="dark"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employees/teacher/${teacher.people_id}`);
                          }}
                          className="flex items-center gap-1"
                        >
                          <HiEye className="w-4 h-4" />
                          View
                        </Button>
                      </Can>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                  Showing page{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {lastPage}
                  </span>
                </span>
                <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                  <Button
                    color="gray"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm enabled:hover:text-purple-600"
                  >
                    <HiChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    color="gray"
                    disabled={currentPage === lastPage}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(lastPage, p + 1))
                    }
                    className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm enabled:hover:text-purple-600"
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
                No records found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                No revised teacher profiles.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RevisedList;
