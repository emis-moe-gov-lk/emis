import { useNavigate, useLocation } from "react-router-dom";
import { HiUser } from "react-icons/hi";
import DirectoryCard from "../common/DirectoryCard";
import profileMale from "../../assets/images/profile_m.png";
import profileFemale from "../../assets/images/profile_f.png";
import { PermissionGroups } from "@/data/permissionGroups";

export default function DosList({ employees }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isZonalAdmins = location.pathname.includes("/employees/edu-directors") 
    || location.pathname.includes("/employees/division/divisionAdmin")
    || location.pathname.includes("/employees/division/admin")
    || location.pathname.includes("/employees/provincial/admin");
    
  const profileViewPermission = isZonalAdmins
    ? PermissionGroups.ZONAL.ADMIN_PROFILE_VIEW
    : PermissionGroups.ZONAL.DEO_PROFILE_VIEW;

  // Determine the base route for navigation
  const getProfileRoute = (employeeId) => {
    const currentPath = location.pathname;
    if (currentPath.includes("edu-directors")) {
      return `/employees/edu-directors/${employeeId}`;
    } else if (currentPath.includes("zonaldirector")) {
      return `/employees/zonaldirector/${employeeId}`;
    } else if (currentPath.includes("/employees/division/divisionAdmin") || currentPath.includes("/employees/division/admin")) {
      return `/employees/division/admin/${employeeId}`;
    } else if (currentPath.includes("/employees/division/deo")) {
      return `/employees/division/deo/${employeeId}`;
    } else if (currentPath.includes("/employees/provincial/admin")) {
      return `/employees/provincial/admin/${employeeId}`;
    } else if (currentPath.includes("/employees/provincial/deo")) {
      return `/employees/provincial/deo/${employeeId}`;
    }
    return `/employees/development-officers/${employeeId}`;
  };

  if (!employees.length) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
          <HiUser className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {location.pathname.includes("divisionAdmin") || location.pathname.includes("division/admin")
            ? "No Division Administrators found"
            : location.pathname.includes("provincial/admin")
            ? "No Provincial Administrators found"
            : location.pathname.includes("provincial/deo")
            ? "No Provincial DEOs found"
            : location.pathname.includes("edu-directors")
            ? "No Zonal Administrators found"
            : "No Development Officers found"}
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
          status={(emp.appointment?.is_confirmed === 1 || emp.confirmed) ? "Confirmed" : "Pending"}
          statusColor={(emp.appointment?.is_confirmed === 1 || emp.confirmed) ? "success" : "warning"}
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
