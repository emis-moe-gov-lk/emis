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
        roles: ["super admin", "admin", "teacher", "development officer"],
      },

      {
        id: "alerts",
        label: "Alerts",
        icon: HiShieldCheck,
        to: "/alert",
        roles: ["super admin", "admin", "teacher", "development officer"],
      },
      {
        id: "institution",
        label: "Institution",
        icon: MdHomeWork,
        to: "/institution",
        roles: ["super admin", "admin", "teacher", "development officer"],
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
        roles: ["super admin"],
      },

      {
        id: "maintable",
        label: "Main Table",
        icon: HiBuildingLibrary,
        to: "/maintable",
        roles: ["super admin"],
      },
      {
        id: "Users",
        label: "Users",
        icon: HiUserGroup,
        to: "/users",
        roles: ["super admin", "development officer"],
      },
      {
        id: "DMSApprovedCader",
        label: "DMS Approved Cader",
        icon: HiUserGroup,
        to: "/dmsapprovedcader",
        roles: ["super admin"],
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
        roles: ["super admin", "development officer"],
        children: [
          {
            id: "overview",
            label: "Overview",
            to: "/offices/overview",
            roles: ["super admin", "development officer"],
          },
          {
            id: "ministry",
            label: "Ministry of Education",
            to: "/offices/moe",
            roles: ["super admin", "development officer"],
          },
          {
            id: "provincial",
            label: "Provincial Ministry",
            to: "/offices/pmoe",
            roles: ["super admin", "development officer"],
          },
          {
            id: "provincial_office",
            label: "Provincial Office",
            to: "/offices/peo",
            roles: ["super admin", "development officer"],
          },
          {
            id: "zonal",
            label: "Zonal Office",
            to: "/offices/zeo",
            roles: ["super admin", "development officer"],
          },
          {
            id: "divisional",
            label: "Divisional Office",
            to: "/offices/deo",
            roles: ["super admin", "development officer"],
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
        roles: ["super admin", "development officer"],
        children: [
          {
            id: "teacher",
            label: "Teachers",
            to: "/employees/teacher",
            roles: ["development officer", "super admin"],
          },
          {
            id: "principal",
            label: "Principals",
            to: "/employees/principal",
            roles: ["super admin"],
          },
          {
            id: "eduDirectors",
            label: "EduDirectors",
            to: "/employees/edu-directors",
            roles: ["super admin"],
          },
          {
            id: "eduSecretaries",
            label: "EduSecretaries",
            to: "/employees/edu-secretaries",
            roles: ["super admin"],
          },
          {
            id: "teacherEducators",
            label: "Teacher Educators",
            to: "/employees/teacher-educators",
            roles: ["super admin"],
          },
          {
            id: "teacherAdvisors",
            label: "Teacher Advisors",
            to: "/employees/teacher-advisors",
            roles: ["super admin"],
          },
          {
            id: "accountants",
            label: "Accountants",
            to: "/employees/accountants",
            roles: ["super admin"],
          },
          {
            id: "developmentOfficers",
            label: "Development Officers",
            to: "/employees/development-officers",
            roles: ["super admin"],
          },
          {
            id: "managementAssistants",
            label: "Management Assistants",
            to: "/employees/management-assistants",
            roles: ["super admin"],
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
        roles: ["super admin", "admin", "teacher"],
      },
      {
        id: "admin",
        label: "Admin",
        icon: HiShieldCheck,
        to: "/admin",
        roles: ["super admin"],
      },

      {
        id: "time_table",
        label: "Time Table",
        icon: HiCalendar,
        to: "/timetable/weekly",
        roles: ["super admin", "admin", "teacher"],
      },
    ],
  },
];
