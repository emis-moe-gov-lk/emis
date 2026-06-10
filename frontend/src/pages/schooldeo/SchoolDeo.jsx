import { useMemo, useState } from "react";
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
import { NavLink, useNavigate } from "react-router-dom";
import DirectoryCard from "@/components/common/DirectoryCard";
import Button from "@/components/UiComponents/Button";
import profile_m from "@/assets/images/profile_m.png";
import profile_f from "@/assets/images/profile_f.png";

// ==========================================
// STATIC MOCK DATA (For UI Presentation Only)
// ==========================================
const MOCK_TEACHERS = [
  {
    people_id: "1",
    id: "T-1001",
    full_name: "John Doe",
    nic: "198512345V",
    gender_id: 1, // Male
    phone: "+1 234 567 890",
    appointment: {
      rank_id: "grade_1",
      service_id: "class_1",
      is_confirmed: 1,
    },
    current_appointment: {
      workplace: {
        institution: {
          name: "Zonal Science Academy",
          address: "123 Education Lane, Zone A",
        },
      },
    },
  },
  {
    people_id: "2",
    id: "T-1002",
    full_name: "Jane Smith",
    nic: "199056789V",
    gender_id: 2, // Female
    phone: "+1 987 654 321",
    appointment: {
      rank_id: "grade_2",
      service_id: "class_2",
      profile_status: "revised",
    },
    current_appointment: {
      workplace: {
        institution: {
          name: "West District Primary School",
          address: "456 Scholar Road, Zone B",
        },
      },
    },
  },
];

const MOCK_RANK_MAP = {
  grade_1: "Grade 1 Teacher",
  grade_2: "Grade 2 Teacher",
};

const MOCK_SERVICE_MAP = {
  class_1: "Sri Lanka Teacher Service",
  class_2: "Graduate Teacher Service",
};

/**
 * SchoolDeo Page Component
 * - Pure Frontend/UI Implementation
 * - Simulates local filtering & pagination for demonstration purposes
 */
const SchoolDeo = () => {
  const navigate = useNavigate();
  // UI States
  const [loading, setLoading] = useState(false); // Toggle true to see the spinner state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage] = useState(1);
  const [total] = useState(MOCK_TEACHERS.length);

  // UI Only Action Handlers
  const handleCreateDEO = () => {
    navigate("/employees/schooldeo/create");
  };

  const handlePrintId = (employee) => {
    alert(`Generating mock print preview for ID: ${employee.id}`);
  };

  // UI Local Appointment Status Logic
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

  // UI-driven Local Client Filtering
  const filteredTeachers = useMemo(() => {
    if (!search.trim()) return MOCK_TEACHERS;
    return MOCK_TEACHERS.filter((t) =>
      t.nic.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [search]);

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School DEO Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage School DEO profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge className="px-3 py-1 font-bold text-sm">
            {`Total: ${total || 0}`}
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
          <NavLink to="#" onClick={(e) => e.preventDefault()}>
            <Button variant="secondary" icon={<HiUpload className="h-4 w-4" />}>
              Bulk Upload
            </Button>
          </NavLink>

          <Button onClick={handleCreateDEO} icon={<HiPlus />}>
            Create DEO
          </Button>
        </div>
      </div>

      {/* ================= LIST / LOADING ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading School DEO List...
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
                      MOCK_RANK_MAP[t.appointment?.rank_id] ||
                      t.appointment?.rank_id ||
                      "-"
                    }
                    service={
                      MOCK_SERVICE_MAP[t.appointment?.service_id] ||
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
                    // permissions={{
                    //   view: true, // Bypass check for static UI
                    // }}
                    showProfilePicture={true}
                    maleProfileImage={profile_m}
                    femaleProfileImage={profile_f}
                    genderId={t.gender_id}
                    onView={(employee) => {
                      navigate(`/employees/schooldeo/${employee.people_id}`);
                    }}
                    onPrintId={handlePrintId}
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

export default SchoolDeo;