import { Menu } from "@headlessui/react";
import { FiMail, FiPhone } from "react-icons/fi";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router";
import { resolveProfileImage } from "@/utils/profileImage";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

export default function DosCard({ employee }) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.replace(/\/$/, "");

  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center gap-6 hover:shadow-lg transition-all">
      {/* Identity */}
      <div className="flex items-center gap-4 lg:w-1/4 min-w-[250px]">
        <div className="relative shrink-0">
          <img
            className="h-14 w-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md"
            src={resolveProfileImage(
              employee.profile_picture,
              employee.gender_id ?? employee.gender?.gender_id,
            )}
            alt={employee.name}
          />
          <span
            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-900 ${employee.confirmed ? "bg-emerald-500" : "bg-amber-500"}`}
          ></span>
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white truncate">
            {employee.name_with_initials}
          </h3>
          <p className="text-xs text-indigo-600 font-bold">{employee.nic}</p>
        </div>
      </div>

      {/* Position & Workplace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Position & Service
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {employee.current_appointment?.position?.position_name ?? "—"}
          </p>
          <p className="text-xs text-slate-500">
            {employee.current_appointment?.service?.service_name ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Workplace Address
          </p>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 truncate">
            {employee.current_appointment?.workplace?.name ?? "—"}
          </p>
          <p className="text-[11px] text-indigo-400 font-medium">
            {employee.address_line1 || "Address not listed"}
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="lg:w-1/4 flex flex-col gap-1 border-l border-slate-100 dark:border-slate-800 pl-6">
        <a
          href={`mailto:${employee.email}`}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <FiMail className="text-slate-400" />
          <span>{employee.email || "no-email@registry.com"}</span>
        </a>
        <a
          href={`tel:${employee.phone}`}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
        >
          <FiPhone className="text-slate-400" />
          <span>{employee.phone || "Not Provided"}</span>
        </a>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:ml-auto">
        <Can permission={PermissionGroups.ZONAL.ADMIN_PROFILE_VIEW}>
          <button
            onClick={() => navigate(`${basePath}/${employee.people_id}`)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition"
          >
            View
          </button>
        </Can>

        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition">
            <HiOutlineDotsVertical className="w-5 h-5" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-44 origin-top-right bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-700 rounded-md shadow-lg focus:outline-none z-50">
            <Menu.Item>
              {({ active }) => (
                <a
                  href={`/print-id/${employee.people_id}`}
                  className={`${
                    active ? "bg-slate-100 dark:bg-slate-700" : ""
                  } flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200`}
                >
                  Print ID
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href={`/export-pdf/${employee.people_id}`}
                  className={`${
                    active ? "bg-slate-100 dark:bg-slate-700" : ""
                  } flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200`}
                >
                  Export PDF
                </a>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
}
