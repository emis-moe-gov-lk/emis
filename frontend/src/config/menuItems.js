import {
  HiCalendar,
  HiChartPie,
  HiInbox,
  HiMenu,
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
        permission: "menu.dashboard",
      },

      {
        id: "alerts",
        label: "Alerts",
        icon: HiShieldCheck,
        to: "/alert",
        permission: "menu.alerts",
      },
      {
        id: "institution",
        label: "Institution",
        icon: MdHomeWork,
        to: "/institution",
        permission: "menu.institution",
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
        permission: "menu.roles",
      },

      {
        id: "maintable",
        label: "Main Table",
        icon: HiBuildingLibrary,
        to: "/maintable",
        permission: "menu.maintable",
      },
      {
        id: "Users",
        label: "Users",
        icon: HiUserGroup,
        to: "/users",
        permission: "menu.user",
      },
      {
        id: "DMSApprovedCader",
        label: "DMS Approved Cader",
        icon: HiUserGroup,
        to: "/dmsapprovedcader",
        permission: "menu.approved-cader",
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
        permission: "menu.office",
        children: [
          {
            id: "overview",
            label: "Overview",
            to: "/offices/overview",
            Permissions: [
              "menu.office.overview",
              // "menu.office.pmoe.list.view",
              // "menu.office.peo.list.view",
              // "menu.office.zeo.list.view",
              // "menu.office.deo.list.view",
            ],
          },
          {
            id: "ministry",
            label: "Ministry of Education",
            to: "/offices/moe",
            permission: "menu.office.moe",
          },
          {
            id: "provincial",
            label: "Provincial Ministry",
            to: "/offices/pmoe",
            permission: "menu.office.pmoe",
          },
          {
            id: "provincial_office",
            label: "Provincial Office",
            to: "/offices/peo",
            permission: "menu.office.peo",
          },
          {
            id: "zonal",
            label: "Zonal Office",
            to: "/offices/zeo",
            permission: "menu.office.zeo",
          },
          {
            id: "divisional",
            label: "Divisional Office",
            to: "/offices/deo",
            permission: "menu.office.deo",
          },
        ],
      },
    ],
  },
  {
    section: "EMPLOYEES",
    items: [
      {
        id: "schools",
        label: "Schools",
        icon: HiUserGroup,
        permission: "menu.schools",
        children: [
          {
            id: "teacher",
            label: "Teachers",
            to: "/employees/teacher",
            permission: "menu.schools.teachers",
          },
          {
            id: "principal",
            label: "Principals",
              to: "/employees/principal",
              permission: "menu.schools.principals",
          },
          {
            id: "schooldeo",
            label: "School DEO",
            to: "/employees/schooldeo",
            permission: "menu.schools.deo",
          },
          {
            id: "schoolclerks",
            label: "School Clerks",
            to: "/employees/schoolclerks",
            permission: "menu.schools.clerk",
          },

        ],

      },
      {
        id: "division",
        label: "Division",
        icon: HiUserGroup,
        permission: "menu.division",
        children: [
          {
            id: "divisiondirector",
            label: "Division Director",
            to: "/employees/divisiondirector",
            permission: "menu.division.admin",
          },
          // {
          //   id: "divisionhead",
          //   label: "Division Head",
          //   to: "/employees/divisionhead",
          //   permission: "divisionhead.list.view",
          // },
          // {
          //   id: "divisionclerk",
          //   label: "Division Clerk",
          //   to: "/employees/divisionclerk",
          //   permission: "divisionclerk.list.view",
          // },
          
        ],
      },

      {
        id: "zonal",
        label: "Zonal",
        icon: HiUserGroup,
        permission: "menu.zonal",
        children: [
          {
            id: "zonaldirector",
            label: "Zonal Administrators",
            to: "/employees/edu-directors",
            permission: "menu.zonal.admin",
          },

            {
            id: "zonaldeo",
            label: "Zonal Deo",
            to: "/employees/development-officers",
            permission: "menu.zonal.deo",
          },

          // {
          //   id: "zonalclerk",
          //   label: "Zonal Clerk",
          //   to: "/employees/zonalclerk",
          //   permission: "zonalclerk.list.view",
          // },
          
        ],
      },

      {
        id: "provincial",
        label: "Provincial",
        icon: HiUserGroup,
        permission: "menu.provincial",
        children: [
          {
            id: "provincialdirector",
            label: "Provincial Director",
            to: "/employees/provincialdirector",
            permission: "menu.provincial.admin",
          },
          // {
          //   id: "provincialhead",
          //   label: "Provincial Head",
          //   to: "/employees/provincialhead",
          //   permission: "provincialhead.list.view",
          // },
          // {
          //   id: "provincialclerk",
          //   label: "Provincial Clerk",
          //   to: "/employees/provincialclerk",
          //   permission: "provincialclerk.list.view",
          // },
          
        ],
      },

      {
        id: "moe",
        label: "MOE",
        icon: HiUserGroup,
        permission: "menu.moe",
        children: [
          {
            id: "moedirector",
            label: "MOE Director",
            to: "/employees/moedirector",
            permission: "menu.moe.admin",
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
        permission: "menu.inbox",
      },
      {
        id: "admin",
        label: "Admin",
        icon: HiShieldCheck,
        to: "/admin",
        permission: "menu.admin",
      },

      {
        id: "time_table",
        label: "Time Table",
        icon: HiCalendar,
        to: "/timetable/weekly",
        permission: "menu.timetable",
      },
      {
        id: "settings",
        label: "Settings",
        icon: HiMenu,
        children: [
          {
            id: "system-settings",
            label: "System Settings",
            to: "/dashboard/settings",
            permission: "menu.settings.system.settings",
          },
          {
            id: "version",
            label: "Version",
            to: "/dashboard/versionpage",
            permission: "menu.settings.version",
          },
          {
            id: "notifications",
            label: "Notifications",
            to: "/dashboard/settings/notifications",
            permission: "menu.settings.notifications",
          },
          {
            id: "privacy",
            label: "Privacy",
            to: "/dashboard/settings/privacy",
            permission: "menu.settings.privacy",
          },
        ],
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
