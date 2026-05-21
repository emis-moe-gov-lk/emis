import { Badge, Button } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import {
  HiUser,
  HiLocationMarker,
  HiPhone,
  HiEye,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Can from "./Can";

/**
 * Reusable Directory Card Component
 * Works for Teachers, DOS Officers, Principals, and other directory types
 * 
 * Props:
 * - employee: Full employee/person object
 * - name, nic, phone, email: Basic info
 * - position, service, workplace, address: Employment details
 * - secondaryField: Extra field (e.g., recruitment category for principals)
 * - secondaryFieldLabel: Label for secondary field
 * - status: Status text
 * - statusColor: Badge color
 * - permissions: { view: "permission.name" }
 * - onView, onPrintId, onExportPdf: Callbacks
 * - showProfilePicture, maleProfileImage, femaleProfileImage, genderId: Profile picture
 */
export default function DirectoryCard({
  employee,
  profilePicture,
  name,
  nic,
  position,
  service,
  workplace,
  address,
  phone,
  email,
  status,
  statusColor = "warning",
  secondaryField = null,
  secondaryFieldLabel = null,
  permissions = {},
  onView,
  onPrintId,
  onExportPdf,
  showProfilePicture = false,
  profilePictureUrl = null,
  maleProfileImage,
  femaleProfileImage,
  genderId,
}) {
  const navigate = useNavigate();

  // Determine which profile image to use
  const getProfileImage = () => {
    if (profilePictureUrl) return profilePictureUrl;
    if (showProfilePicture && genderId === "G02" && femaleProfileImage) {
      return femaleProfileImage;
    }
    if (showProfilePicture && maleProfileImage) {
      return maleProfileImage;
    }
    return null;
  };

  const profileImage = getProfileImage();

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600/40">
      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5">
        {/* Profile Picture & Name Section */}
        <div className="flex items-center gap-4 md:w-1/4 shrink-0">
          {/* Avatar */}
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="h-12 w-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center border border-gray-200 dark:border-gray-700 shrink-0">
              <HiUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}

          {/* Name & NIC */}
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {name}
            </h3>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">
              {nic}
            </p>
          </div>
        </div>

        {/* Position & Service */}
        {(position || secondaryField) && (
          <div className="min-w-0 md:flex-1 md:px-2">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              {secondaryFieldLabel || "Position & Service"}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {position || secondaryField}
            </p>
            {service && !secondaryField && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {service}
              </p>
            )}
          </div>
        )}

        {/* Workplace Address */}
        {workplace && (
          <div className="min-w-0 md:flex-1 hidden md:block md:px-2">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Workplace
            </p>
            <div className="flex items-center gap-1.5 min-w-0">
              <HiLocationMarker className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {workplace}
              </span>
            </div>
            {address && (
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {address}
              </p>
            )}
          </div>
        )}

        {/* Contact */}
        {phone && (
          <div className="min-w-0 md:flex-1 hidden md:block md:px-2">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
              Contact
            </p>
            <a
            //   href={`tel:${phone}`}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
            >
              <HiPhone className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
              <span className="truncate">{phone}</span>
            </a>
          </div>
        )}

        {/* Status & Actions */}
        <div className="flex items-center gap-2 justify-between md:justify-end md:ml-auto shrink-0">
          {status && (
            <StatusBadge className="px-2.5 py-1 text-xs whitespace-nowrap font-medium">
              {status}
            </StatusBadge>
          )}

          {/* View Button */}
          {permissions.view ? (
            <Can permission={permissions.view}>
              <Button
                size="xs"
                color="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(employee);
                }}
                className="flex items-center gap-1.5 px-3"
              >
                <HiEye className="w-4 h-4" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </Can>
          ) : onView ? (
            <Button
              size="xs"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onView(employee);
              }}
              className="flex items-center gap-1.5 px-3"
            >
              <HiEye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
