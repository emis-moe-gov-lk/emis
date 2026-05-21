import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router";
import { Badge, Spinner, TextInput } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HiUser,
  HiSearch,
  HiPlus,
  HiUpload,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import api from "@/api/axios";
import { printTeacherId } from "@/api/teacherService";
import { NavLink } from "react-router-dom";
import { TeacherFormContext } from "@/context/TeacherFormContext";
import { useAuthUser } from "@/context/useAuthUser";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import DirectoryCard from "@/components/common/DirectoryCard";
import Button from "@/components/UiComponents/Button";

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
          <StatusBadge className="px-3 py-1 font-bold text-sm">
            Total: {total || 0}
          </StatusBadge>
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
            <NavLink to="/employees/teacher/bulk-upload">
              <Button variant="secondary" icon={<HiUpload className="h-4 w-4" />}>
                Bulk Upload
              </Button>
            </NavLink>
          </Can>

          <Can permission={PermissionGroups.SCHOOLS.CREATE}>
            <Button onClick={handleCreateTeacher} icon={<HiPlus />}>
              Create Teacher
            </Button>
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
                  <DirectoryCard
                    key={t.people_id}
                    employee={t}
                    name={t.full_name}
                    nic={t.nic}
                    position={
                      rankMap[t.appointment?.rank_id] ||
                      t.appointment?.rank_id ||
                      "-"
                    }
                    service={
                      serviceMap[t.appointment?.service_id] ||
                      t.appointment?.service_id ||
                      "-"
                    }
                    workplace={
                      t.current_appointment?.workplace?.institution?.name ||
                      "No Workplace"
                    }
                    address={
                      t.current_appointment?.workplace?.institution?.address ||
                      "-"
                    }
                    phone={t.phone || "-"}
                    status={appointmentStatus.label}
                    statusColor={appointmentStatus.color}
                    permissions={{
                      view: PermissionGroups.SCHOOLS.VIEW_PROFILE,
                    }}
                    onView={(employee) => {
                      navigate(`/employees/teacher/${employee.people_id}`);
                    }}
                    onPrintId={async (employee) => {
                      try {
                        const blob = await printTeacherId(employee.id);
                        const url = URL.createObjectURL(blob);
                        window.open(url, "_blank");
                      } catch (err) {
                        console.error("Error printing ID:", err);
                      }
                    }}
                  />
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
                    variant="secondary"
                    disabled={page === 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage(page - 1);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <HiChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={page === lastPage}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage(page + 1);
                    }}
                    className="flex-1 sm:flex-none"
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
