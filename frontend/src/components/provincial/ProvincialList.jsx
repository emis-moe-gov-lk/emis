import { useNavigate, useLocation } from "react-router-dom";
import { HiUser } from "react-icons/hi";
import toast from "react-hot-toast";
import { downloadProvincialAdminProfileDocument } from "@/api/provincialAdminService";
import { downloadProvincialDeoProfileDocument } from "@/api/deoOfficerService";
import DirectoryCard from "../common/DirectoryCard";
import profileMale from "../../assets/images/profile_m.png";
import profileFemale from "../../assets/images/profile_f.png";
import { PermissionGroups } from "@/data/permissionGroups";

export default function ProvincialList({ employees }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isProvincialAdmins = location.pathname.includes("/employees/provincial/admin");
    
  const profileViewPermission = isProvincialAdmins
    ? PermissionGroups.PROVINCIAL.ADMIN
    : PermissionGroups.PROVINCIAL.DEO;

  // Determine the base route for navigation
  const getProfileRoute = (employeeId) => {
    if (isProvincialAdmins) {
      return `/employees/provincial/admin/${employeeId}`;
    }
    return `/employees/provincial/deo/${employeeId}`;
  };

  if (!employees.length) {
    return (
      <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-full w-fit mx-auto mb-4">
          <HiUser className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {isProvincialAdmins
            ? "No Provincial Administrators found"
            : "No Provincial DEOs found"}
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
          status={emp.confirmed ? "Confirmed" : "Pending"}
          statusColor={emp.confirmed ? "success" : "warning"}
          showProfilePicture={true}
          maleProfileImage={profileMale}
          femaleProfileImage={profileFemale}
          genderId={emp.gender_id}
          permissions={{ view: profileViewPermission }}
          onView={(employee) => navigate(getProfileRoute(employee.people_id))}
          onPrintId={(employee) => {
            window.open(`/print-id/${employee.id}`, "_blank");
          }}
          onExportPdf={async (employee) => {
            try {
              toast.loading("Preparing PDF download...", { id: "provincial-pdf-download" });
              let responseData;
              let filePrefix;
              if (isProvincialAdmins) {
                responseData = await downloadProvincialAdminProfileDocument(employee.people_id);
                filePrefix = "provincial-admin";
              } else {
                const response = await downloadProvincialDeoProfileDocument(employee.people_id);
                responseData = response.data;
                filePrefix = "provincial-deo";
              }
              const blob = new Blob([responseData], { type: "application/pdf" });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${filePrefix}-profile-${employee.people_id}.pdf`;
              document.body.appendChild(link);
              link.click();
              link.remove();
              window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
              toast.success("PDF downloaded successfully!", { id: "provincial-pdf-download" });
            } catch (error) {
              console.error("Failed to download PDF:", error);
              toast.error("Unable to download the PDF.", { id: "provincial-pdf-download" });
            }
          }}
        />
      ))}
    </div>
  );
}
