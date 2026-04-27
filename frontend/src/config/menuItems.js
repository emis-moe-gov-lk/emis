import {
  HiCalendar,
  HiChartPie,
  HiInbox,
  HiShieldCheck,
  HiUser,
  HiUserGroup,
} from "react-icons/hi";
import { HiBuildingLibrary, HiBuildingOffice } from "react-icons/hi2";
import { MdHomeWork } from "react-icons/md";
import { FaUserGraduate } from "react-icons/fa";

export const menuItems = [
  {
    section: "GENERAL",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: HiChartPie,
        to: "/dashboard",
        permission: "dashboard.main.view",
      },

      {
        id: "alerts",
        label: "Alerts",
        icon: HiShieldCheck,
        to: "/alert",
        permission: "alerts.overview.view",
      },
      {
        id: "institution",
        label: "Institution",
        icon: MdHomeWork,
        to: "/institution",
        permission: "institution.list.view",
      },
    ],
  },
  {
    section: "MANAGEMENT",
    items: [
      {
        id: "Roles",
        label: "Roles",
        icon: HiUser,
        to: "/roles",
        permission: "user.create",
      },

      {
        id: "maintable",
        label: "Main Table",
        icon: HiBuildingLibrary,
        to: "/maintable",
        permission: "user.create",
      },
      {
        id: "Users",
        label: "Users",
        icon: HiUserGroup,
        to: "/users",
        permission: "user.list.view",
      },
      {
        id: "DMSApprovedCader",
        label: "DMS Approved Cader",
        icon: HiUserGroup,
        to: "/dmsapprovedcader",
        permission: "cadre-dms-approved.index.view",
      },
    ],
  },
  {
    section: "OFFICES",
    items: [
      {
        id: "offices",
        label: "Offices",
        icon: HiBuildingOffice,
        children: [
          {
            id: "overview",
            label: "Overview",
            to: "/offices/overview",
            anyPermissions: [
              "office.moe.list.view",
              "office.pmoe.list.view",
              "office.peo.list.view",
              "office.zeo.list.view",
              "office.deo.list.view",
            ],
          },
          {
            id: "ministry",
            label: "Ministry of Education",
            to: "/offices/moe",
            permission: "office.moe.list.view",
          },
          {
            id: "provincial",
            label: "Provincial Ministry",
            to: "/offices/pmoe",
            permission: "office.pmoe.list.view",
          },
          {
            id: "provincial_office",
            label: "Provincial Office",
            to: "/offices/peo",
            permission: "office.peo.list.view",
          },
          {
            id: "zonal",
            label: "Zonal Office",
            to: "/offices/zeo",
            permission: "office.zeo.list.view",
          },
          {
            id: "divisional",
            label: "Divisional Office",
            to: "/offices/deo",
            permission: "office.deo.list.view",
          },
        ],
      },
    ],
  },
  {
    section: "EMPLOYEES",
    items: [
      {
        id: "employees",
        label: "Employees",
        icon: HiUserGroup,
        children: [
          {
            id: "teacher",
            label: "Teachers",
            to: "/employees/teacher",
            permission: "teacher.list.view",
          },
          {
            id: "principal",
            label: "Principals",
            to: "/employees/principal",
            permission: "principal.list.view",
          },
          {
            id: "eduDirectors",
            label: "EduDirectors",
            to: "/employees/edu-directors",
            permission: "dos.list.view",
          },
          {
            id: "eduSecretaries",
            label: "EduSecretaries",
            to: "/employees/edu-secretaries",
            permission: "mso.list.view",
          },
          {
            id: "teacherEducators",
            label: "Teacher Educators",
            to: "/employees/teacher-educators",
            permission: "sltes.list.view",
          },
          {
            id: "teacherAdvisors",
            label: "Teacher Advisors",
            to: "/employees/teacher-advisors",
            permission: "sltas.list.view",
          },
          {
            id: "accountants",
            label: "Accountants",
            to: "/employees/accountants",
            permission: "slacs.list.view",
          },
          {
            id: "developmentOfficers",
            label: "Development Officers",
            to: "/employees/development-officers",
            permission: "dos.list.view",
          },
          {
            id: "managementAssistants",
            label: "Management Assistants",
            to: "/employees/management-assistants",
            permission: "mso.list.view",
          },
        ],
      },
    ],
  },

  {
    section: "OTHER",
    items: [
      {
        id: "inbox",
        label: "Inbox",
        icon: HiInbox,
        to: "/message",
      },
      {
        id: "admin",
        label: "Admin",
        icon: HiShieldCheck,
        to: "/admin",
        permission: "user.create",
      },

      {
        id: "time_table",
        label: "Time Table",
        icon: HiCalendar,
        to: "/timetable/weekly",
      },
    ],
  },
];

const hasAccess = (item, canAccess) => {
  if (Array.isArray(item?.anyPermissions) && item.anyPermissions.length > 0) {
    return item.anyPermissions.some((permission) => canAccess(permission));
  }

  if (Array.isArray(item?.permissions) && item.permissions.length > 0) {
    return item.permissions.every((permission) => canAccess(permission));
  }

  if (item?.permission) {
    return canAccess(item.permission);
  }

  return true;
};

export const filterMenuItemsByPermissions = (sections, canAccess) =>
  sections
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          const filteredChildren = item.children
            ? item.children.filter((child) => hasAccess(child, canAccess))
            : null;

          if (filteredChildren && filteredChildren.length > 0) {
            return {
              ...item,
              children: filteredChildren,
            };
          }

          if (item.children) {
            return hasAccess(item, canAccess) ? { ...item, children: [] } : null;
          }

          return hasAccess(item, canAccess) ? item : null;
        })
        .filter(Boolean),
    }))
    .filter((section) => section.items.length > 0);
