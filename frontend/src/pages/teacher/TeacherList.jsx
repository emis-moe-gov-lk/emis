import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router";
import { Badge, Button, Spinner, TextInput } from "flowbite-react";
import {
  HiUser,
  HiLocationMarker,
  HiSearch,
  HiPlus,
  HiUpload,
  HiEye,
  HiChevronLeft,
  HiChevronRight,
  HiDotsVertical,
  HiMail,
  HiPhone,
  HiIdentification,
  HiDocumentText,
} from "react-icons/hi";
import api from "@/api/axios";
import { printTeacherId } from "@/api/teacherService";
import { NavLink } from "react-router-dom";
import { TeacherFormContext } from "@/context/TeacherFormContext";
import { useAuthUser } from "@/context/useAuthUser";
// ✅ NEW IMPORTS
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

/**
 * Teacher List Page
 * - Styled to match InstitutionIndex
 * - Card-based layout
 * - Server-side search and pagination
 */
const TeacherList = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(TeacherFormContext);
  const { identity, roles, hasRole } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);

  const normalizeValue = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();

  const getRelevantValues = (sources = []) => [
    ...new Set(sources.map(normalizeValue).filter(Boolean)),
  ];

  const getOfficerZoneValues = (identity) =>
    getRelevantValues([
      identity?.zeo_id,
      identity?.zone_id,
      identity?.zonal_education_office_id,
      identity?.office_id,
      identity?.workplace?.zeo_id,
      identity?.workplace?.zone_id,
      identity?.zonal_education_office?.zeo_id,
      identity?.zonal_education_office?.zone_id,
      identity?.zonal_education_office?.office_id,
      identity?.zonal_education_office?.name,
      identity?.zonal_education_office?.short_name,
      identity?.office?.zeo_id,
      identity?.office?.zone_id,
      identity?.office?.office_id,
      identity?.office?.name,
      identity?.office?.short_name,
      identity?.user?.zeo_id,
      identity?.user?.zone_id,
      identity?.user?.zonal_education_office_id,
      identity?.user?.zonal_education_office?.zeo_id,
      identity?.user?.zonal_education_office?.name,
      identity?.user?.office?.zeo_id,
      identity?.user?.office?.name,
    ]);

  const getTeacherZoneValues = (teacher) =>
    getRelevantValues([
      teacher?.zone_id,
      teacher?.zeo_id,
      teacher?.zonal_education_office_id,
      teacher?.current_appointment?.zone_id,
      teacher?.current_appointment?.zeo_id,
      teacher?.current_appointment?.workplace?.zone_id,
      teacher?.current_appointment?.workplace?.zeo_id,
      teacher?.current_appointment?.workplace?.institution?.zone_id,
      teacher?.current_appointment?.workplace?.institution?.zeo_id,
      teacher?.current_appointment?.workplace?.institution
        ?.zonal_education_office_id,
      teacher?.current_appointment?.workplace?.institution
        ?.zonal_education_office?.zeo_id,
      teacher?.current_appointment?.workplace?.institution
        ?.zonal_education_office?.zone_id,
      teacher?.current_appointment?.workplace?.institution
        ?.zonal_education_office?.office_id,
      teacher?.current_appointment?.workplace?.institution
        ?.zonal_education_office?.name,
      teacher?.current_appointment?.workplace?.institution
        ?.zonal_education_office?.short_name,
    ]);

  const canViewTeacherByZone = (teacher, officerZoneValues) => {
    if (!officerZoneValues.length) return true;

    const teacherZoneValues = getTeacherZoneValues(teacher);
    if (!teacherZoneValues.length) return false;

    return teacherZoneValues.some((value) => officerZoneValues.includes(value));
  };

  const handleCreateTeacher = () => {
    // Clear any saved draft for a fresh registration
    dispatch({ type: "CLEAR" });
    navigate("/employees/teacher/create");
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /* -------------------------------------------------
       Load MASTER DATA
    -------------------------------------------------- */
  useEffect(() => {
    api
      .get("/teacher-settings")
      .then((res) => {
        if (res.data?.status === "success") {
          setSettings(res.data);
        }
      })
      .catch(console.error);
  }, []);

  /* -------------------------------------------------
       Load TEACHER LIST
    -------------------------------------------------- */
  const fetchTeachers = (pageNumber = 1) => {
    setLoading(true);
    api
      .get(`/teachers-list?page=${pageNumber}&per_page=10&nic=${search}`)
      .then((res) => {
        if (res.data?.status === "success") {
          setTeachers(res.data.data.data || []);
          setPage(res.data.data.current_page);
          setLastPage(res.data.data.last_page);
          setPerPage(res.data.data.per_page);
          setTotal(res.data.data.total);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTeachers(1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchTeachers(page);
  }, [page]);

  /* -------------------------------------------------
       Lookup maps
    -------------------------------------------------- */
  const serviceMap = useMemo(() => {
    if (!settings?.services) return {};
    return Object.fromEntries(
      settings.services.map((s) => [s.service_id, s.service_name]),
    );
  }, [settings]);

  const rankMap = useMemo(() => {
    if (!settings?.service_ranks) return {};
    return Object.fromEntries(
      settings.service_ranks.map((r) => [r.rank_id, r.rank_name]),
    );
  }, [settings]);

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

  const filteredTeachers = useMemo(() => {
    const normalizedRoles = Array.isArray(roles)
      ? roles.map((role) => String(role).trim().toLowerCase())
      : [];
    const needsZoneFilter =
      normalizedRoles.includes("development officer") ||
      normalizedRoles.includes("development officer head") ||
      normalizedRoles.includes("zonal deo") ||
      normalizedRoles.includes("zonal deo head") ||
      normalizedRoles.includes("zonal director");

    if (!needsZoneFilter) return teachers;

    const officerZoneValues = getOfficerZoneValues(identity?.raw ?? identity);
    return teachers.filter((teacher) =>
      canViewTeacherByZone(teacher, officerZoneValues),
    );
  }, [identity, roles, teachers]);

  const hasPermission = (permission) => {
    const userPermissions = identity?.permissions || [];
    return userPermissions.includes(permission);
  };

  const canCreateTeacher = hasRole("super admin") || hasRole("zonal deo");

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teachers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage teacher profiles and deployment records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="blue" size="lg">
            Total: {total || 0}
          </Badge>
        </div>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

        <div className="flex items-center gap-3">
          <Can permission={PermissionGroups.SCHOOLS.BULK_UPLOAD}>
            <NavLink
              to="/employees/teacher/bulk-upload"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <HiUpload className="h-4 w-4" />
              Bulk Upload
            </NavLink>
          </Can>

          <Can permission={PermissionGroups.SCHOOLS.CREATE}>
            <button
              onClick={handleCreateTeacher}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <HiPlus />
              Create Teacher
            </button>
          </Can>
        </div>
      </div>

      {/* ================= LIST / LOADING ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading Teachers List...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTeachers.length > 0 ? (
            <>
              {filteredTeachers.map((t) => {
                const appointmentStatus = getAppointmentStatus(t.appointment);

                return (
                  <div
                    // key={t.people_id}
                    // onClick={() =>
                    //   navigate(`/employees/teacher/${t.people_id}`)
                    // }
                    className="group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:border-blue-100 dark:hover:border-blue-900/30 cursor-pointer"
                  >
                    {/* Icon & Index */}
                    <div className="flex items-center gap-4 min-w-[60px]">
                      {/* <span className="text-xs font-mono text-gray-400 w-6">
                      #
                      {((page - 1) * perPage + index + 1)
                        .toString()
                        .padStart(2, "0")}
                    </span> */}
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                        <HiUser className="w-6 h-6" />
                      </div>
                      {/* after impliment image remove above code section and uncoment this code section */}
                      {/* <img
                      src={t.profile_picture || "/default-profile.png"}
                      alt="profile"
                      className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md"
                    /> */}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Name */}
                      <div className="md:col-span-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {t.full_name}
                        </h3>
                        <p className="text-xs font-bold text-blue-600 cursor-pointer mt-0.5">
                          {/* NIC:  */}
                          {t.nic}
                        </p>
                      </div>

                      {/* Designation */}
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Position & Service
                        </p>
                        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                          {rankMap[t.appointment?.rank_id] ||
                            t.appointment?.rank_id ||
                            "-"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {serviceMap[t.appointment?.service_id] ||
                            t.appointment?.service_id ||
                            "-"}
                        </div>
                      </div>

                      {/* Workplace */}
                      <div className="md:col-span-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Workplace Address
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <HiLocationMarker className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {t.current_appointment?.workplace?.institution
                              ?.name || "No Workplace"}
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-gray-400 truncate">
                          {t.current_appointment?.workplace?.institution
                            ?.address || "-"}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Contact
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          <HiPhone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{t.phone || "-"}</span>
                        </div>
                      </div>

                      {/* Status */}
                      {/* <div className="md:col-span-2 flex md:justify-end gap-2">
                      <Badge
                        color={
                          t.appointment?.is_confirmed ? "success" : "warning"
                        }
                        className="px-3 py-1 whitespace-nowrap"
                      >
                        {t.appointment?.is_confirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </div> */}
                      {/* Status + Actions */}
                      <div className="md:col-span-2 flex items-center justify-end gap-2 flex-nowrap">
                        <Badge
                          color={appointmentStatus.color}
                          className="px-3 py-1 whitespace-nowrap"
                        >
                          {appointmentStatus.label}
                        </Badge>

                        {/* View Button */}
                        <Can permission={PermissionGroups.SCHOOLS.VIEW_PROFILE}>
                          <Button
                            size="xs"
                            color="dark"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/employees/teacher/${t.people_id}`);
                            }}
                            className="flex items-center gap-1"
                          >
                            <HiEye className="w-4 h-4" />
                            View
                          </Button>
                        </Can>

                        {/* 3 Dot Menu */}
                        <div className="relative">
                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === t.people_id ? null : t.people_id,
                              );
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <HiDotsVertical className="w-5 h-5 text-gray-500" />
                          </button> */}

                          {openMenuId === t.people_id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 z-50 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1"
                            >
                              <Can
                                permission={PermissionGroups.SCHOOLS.PRINT_ID}
                              >
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    const blob = await printTeacherId(t.id);
                                    const url = URL.createObjectURL(blob);
                                    window.open(url, "_blank");
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <HiIdentification className="w-4 h-4 text-gray-400" />
                                  Print ID
                                </button>
                              </Can>

                              <Can
                                permission={PermissionGroups.SCHOOLS.EXPORT_PDF}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                  <HiDocumentText className="w-4 h-4 text-gray-400" />
                                  Export PDF
                                </button>
                              </Can>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions (Standalone PDF for example) */}
                    <div className="md:hidden flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                      <div className="text-blue-600 text-sm flex items-center gap-1">
                        <HiEye /> View Profile
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls */}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage(page - 1);
                    }}
                    className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 shadow-sm enabled:hover:text-blue-600"
                  >
                    <HiChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    color="gray"
                    disabled={page === lastPage}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage(page + 1);
                    }}
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
                No teachers found
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                No teachers match this search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherList;
