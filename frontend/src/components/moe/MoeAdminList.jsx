import { useNavigate, useLocation } from "react-router-dom";
import { HiUser } from "react-icons/hi";
import DirectoryCard from "../common/DirectoryCard";
import profileMale from "../../assets/images/profile_m.png";
import profileFemale from "../../assets/images/profile_f.png";
import { PermissionGroups } from "@/data/permissionGroups";

export default function MoeAdminList({ employees }) {
  const navigate = useNavigate();
  const location = useLocation();
  const profileViewPermission = PermissionGroups.ZONAL.ADMIN_PROFILE_VIEW;

  const getProfileRoute = (employeeId) => {
    return `/employees/moe/admin/${employeeId}`;
  };

  if (!employees.length) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
          <HiUser className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No MOE Administrators found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto mt-2">
          No officers match this search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {employees.map((emp) => (
        <DirectoryCard
          key={emp.id}
          employee={emp}
          name={emp.name_with_initials || emp.name}
          nic={emp.nic}
          position={emp.current_appointment?.position?.position_name}
          service={emp.service}
          workplace={emp.office}
          address={emp.address_line1}
          phone={emp.phone}
          email={emp.email}
          status={emp.appointment?.is_confirmed === 1 ? "Confirmed" : "Pending"}
          statusColor={emp.appointment?.is_confirmed === 1 ? "success" : "warning"}
          showProfilePicture={true}
          maleProfileImage={profileMale}
          femaleProfileImage={profileFemale}
          genderId={emp.gender_id}
          permissions={{ view: profileViewPermission }}
          onView={(employee) => navigate(getProfileRoute(employee.people_id))}
          onPrintId={(employee) => {
            window.open(`/print-id/${employee.id}`, "_blank");
          }}
          onExportPdf={(employee) => {
            window.open(`/export-pdf/${employee.id}`, "_blank");
          }}
        />
      ))}
    </div>
  );
}
