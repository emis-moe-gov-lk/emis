import { useMemo, useState, useEffect } from "react";
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
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import DirectoryCard from "@/components/common/DirectoryCard";
import Button from "@/components/UiComponents/Button";
import profile_m from "@/assets/images/profile_m.png";
import profile_f from "@/assets/images/profile_f.png";
import { getSchoolDeoList } from "@/api/schoolDeoService";

/**
 * SchoolDeo Page Component
 * - Real Backend Implementation
 */
const SchoolDeo = () => {
  const navigate = useNavigate();
  // UI States
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 12;

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getSchoolDeoList({
        page: currentPage,
        per_page: perPage,
        search: searchTerm,
      });
      if (response.status === "success") {
        setEmployees(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch School DEOs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeo = () => {
    navigate("/employees/schooldeo/create");
  };

  const handlePrintId = (employee) => {
    alert(`Generating mock print preview for ID: ${employee.nic}`);
  };

  const handleViewProfile = (employee) => {
    navigate(`/employees/schooldeo/${employee.people_id || employee.id}`);
  };

  return (
    <div className="p-6 lg:p-10 w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School DEO Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage School DEO profiles and assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge className="px-3 py-1 font-bold text-sm">
            {`Total: ${totalCount}`}
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
            placeholder="Search by name or NIC..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Can permission={PermissionGroups.SCHOOLS.DEO_BULK_UPLOAD}>
            <Button 
              variant="secondary" 
              onClick={() => alert("Bulk Upload Placeholder")}
              icon={<HiUpload className="h-4 w-4" />}
            >
              Bulk Upload
            </Button>
          </Can>

          <Can permission={PermissionGroups.SCHOOLS.DEO_CREATE}>
            <Button onClick={handleCreateDeo} icon={<HiPlus />}>
              Create DEO
            </Button>
          </Can>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
          <Spinner size="xl" color="info" />
          <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse font-medium">
            Loading School DEO List...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {employees.length > 0 ? (
            <>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <DirectoryCard
                    key={employee.people_id}
                    employee={employee}
                    name={employee.full_name || employee.name_with_initials}
                    nic={employee.nic}
                    position={employee.current_appointment?.position?.position_name || "Development Officer"}
                    service={employee.current_appointment?.service?.service_name || "Service"}
                    workplace={employee.current_appointment?.workplace?.institution?.name_en || "School"}
                    address={employee.current_appointment?.workplace?.institution?.address_en || "-"}
                    phone={employee.phone || "-"}
                    status={
                      employee.appointment?.is_confirmed === 1 ? "Confirmed" :
                      employee.appointment?.is_verified === 1 ? "Verified" :
                      employee.appointment?.is_verified === 2 ? "Rejected" :
                      "Pending"
                    }
                    statusColor={
                      employee.appointment?.is_confirmed === 1 ? "success" :
                      employee.appointment?.is_verified === 1 ? "info" :
                      employee.appointment?.is_verified === 2 ? "failure" :
                      "warning"
                    }
                    showProfilePicture={true}
                    maleProfileImage={profile_m}
                    femaleProfileImage={profile_f}
                    genderId={employee.gender_id}
                    onView={() => handleViewProfile(employee)}
                    onPrintId={handlePrintId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                    Showing page{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalPages}
                    </span>
                  </span>

                  <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="flex-1 sm:flex-none"
                    >
                      <HiChevronLeft className="w-5 h-5 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="flex-1 sm:flex-none"
                    >
                      Next
                      <HiChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
                <HiUser className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
                No Results Found
              </p>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">
                No school DEOs match this search.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolDeo;
