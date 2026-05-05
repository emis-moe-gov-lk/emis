import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import { HiUser, HiLocationMarker, HiSearch, HiEye, HiChevronLeft, HiChevronRight, HiX } from "react-icons/hi";
import { MdComment } from "react-icons/md";
import api from "@/api/axios";

const RejectedList = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/alerts/rejected?per_page=20&page=${currentPage}`)
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

  const handleViewReason = (teacher) => {
    setSelectedItem(teacher);
    setShowReasonModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rejected</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Teacher profiles that have been rejected</p>
        </div>
        <Badge color="failure" size="lg">Rejected</Badge>
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
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">Loading...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.length > 0 ? (
            <>
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.people_id}
                  onClick={() => navigate(`/employees/teacher/${teacher.people_id}`)}
                  className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:border-red-100 dark:hover:border-red-900/30 cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-[60px]">
                    <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                      <HiUser className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-red-600 transition-colors">
                        {teacher.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{teacher.name_with_initials}</p>
                    </div>

                    <div className="md:col-span-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">School</p>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                        <HiLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="truncate">
                          {teacher.current_appointment?.workplace?.institution?.name ?? "—"}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-gray-400 truncate">
                        {teacher.current_appointment?.workplace?.institution?.census_no ?? ""}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Appointment Date</p>
                      <div className="text-sm text-gray-700 dark:text-gray-200">
                        {teacher.appointment?.first_appointment_date?.slice(0, 10) ?? "—"}
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end gap-2">
                      <Badge color="failure" className="px-3 py-1 whitespace-nowrap">Rejected</Badge>
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
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                  Showing page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">{lastPage}</span>
                </span>
                <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                  <Button
                    color="gray"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm enabled:hover:text-blue-600"
                  >
                    <HiChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    color="gray"
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No records found</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">No rejected teacher profiles.</p>
            </div>
          )}
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rejection Details</h3>
              <button onClick={() => setShowReasonModal(false)} className="text-gray-400 hover:text-gray-600">
                <HiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">{selectedItem.full_name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">Name with Initials</label>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedItem.name_with_initials}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">School</label>
                <p className="text-gray-900 dark:text-white mt-1">
                  {selectedItem.current_appointment?.workplace?.institution?.name ?? "—"}
                </p>
              </div>

              <hr className="border-t border-gray-200 dark:border-gray-700" />

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rejection Reason</label>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="flex gap-2">
                    <MdComment className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      No specific reason available at this time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end sticky bottom-0 bg-white dark:bg-gray-800">
              <Button color="gray" onClick={() => setShowReasonModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedList;