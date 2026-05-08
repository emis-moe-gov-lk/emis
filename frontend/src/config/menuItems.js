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
        permission: "dashboard.view",
      },

      {
        id: "alerts",
        label: "Alerts",
        icon: HiShieldCheck,
        to: "/alert",
        permission: "alerts.view",
      },
      {
        id: "institution",
        label: "Institution",
        icon: MdHomeWork,
        to: "/institution",
        permission: "institution.view",
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
        permission: "roles.view",
      },

      {
        id: "maintable",
        label: "Main Table",
        icon: HiBuildingLibrary,
        to: "/maintable",
        permission: "maintable.view",
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
        permission: "office.view",
        children: [
          {
            id: "overview",
            label: "Overview",
            to: "/offices/overview",
            anyPermissions: [
              "office.overview",
              // "office.pmoe.list.view",
              // "office.peo.list.view",
              // "office.zeo.list.view",
              // "office.deo.list.view",
            ],
          },
          {
            id: "ministry",
            label: "Ministry of Education",
            to: "/offices/moe",
            permission: "office.moe",
          },
          {
            id: "provincial",
            label: "Provincial Ministry",
            to: "/offices/pmoe",
            permission: "office.pmoe",
          },
          {
            id: "provincial_office",
            label: "Provincial Office",
            to: "/offices/peo",
            permission: "office.peo",
          },
          {
            id: "zonal",
            label: "Zonal Office",
            to: "/offices/zeo",
            permission: "office.zeo",
          },
          {
            id: "divisional",
            label: "Divisional Office",
            to: "/offices/deo",
            permission: "office.deo",
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
        permission: "school.view",
        children: [
          {
            id: "teacher",
            label: "Teachers",
            to: "/employees/teacher",
            permission: "teacher.view",
          },
          {
            id: "principal",
            label: "Principals",
              to: "/employees/principal",
              permission: "principal.view",
          },
          {
            id: "schooldeo",
            label: "School DEO",
            to: "/schools/schooldeo",
            permission: "schooldeo.view",
          },
          {
            id: "schoolclerks",
            label: "School Clerks",
            to: "/schools/schoolclerks",
            permission: "schoolclerk.view",
          },

        ],

      },
      {
        id: "division",
        label: "Division",
        icon: HiUserGroup,
        permission: "division.view",
        children: [
          {
            id: "divisiondirector",
            label: "Division Director",
            to: "/employees/divisiondirector",
            permission: "divisiondirector.view",
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
        permission: "zonal.view",
        children: [
          {
            id: "zonaldirector",
            label: "Zonal Administrators",
            to: "/employees/zonaldirector",
            permission: "zonaladmin.view",
          },
          {
            id: "zonaldeo",
            label: "Zonal Deo",
            to: "/employees/development-officers",
            permission: "zonaldeo.view",
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
        permission: "provincial.view",
        children: [
          {
            id: "provincialdirector",
            label: "Provincial Director",
            to: "/employees/provincialdirector",
            permission: "provincialdirector.view",
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
        permission: "moe.view",
        children: [
          {
            id: "moedirector",
            label: "MOE Director",
            to: "/employees/moedirector",
            permission: "moedirector.view",
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
        permission: "inbox.overview.view",
      },
      {
        id: "admin",
        label: "Admin",
        icon: HiShieldCheck,
        to: "/admin",
        permission: "admin.overview.view",
      },

      {
        id: "time_table",
        label: "Time Table",
        icon: HiCalendar,
        to: "/timetable/weekly",
        permission: "timetable.overview.view",
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
