import { FaChalkboardTeacher, FaSchool, FaUserGraduate } from "react-icons/fa";

export const weekDays = [
  "2026-03-09",
  "2026-03-10",
  "2026-03-11",
  "2026-03-12",
  "2026-03-13",
  "2026-03-14",
  "2026-03-15",
];

export const getWeekDays = (date = new Date()) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  startOfWeek.setDate(diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
};

export const todayEvents = [
  {
    time: "10:00 AM",
    title: "Staff Meeting",
    location: "Conference Room",
  },
  {
    time: "02:00 PM",
    title: "Teacher Training",
    location: "Hall A",
  },
];

export const getStats = (summary) => [
  {
    title: "Total Institutions",
    value: summary?.institution_count || 0,
    badge: "Active",
    color: "indigo",
    icon: FaSchool,
  },
  {
    title: "Total Teachers",
    value: summary?.teacher_count || 0,
    badge: "Staff",
    color: "emerald",
    icon: FaChalkboardTeacher,
  },
  {
    title: "Total Students",
    value: 0,
    badge: "Students",
    color: "blue",
    icon: FaUserGraduate,
  },
];

export const officeLists = [
  {
    id: 1,
    short_name: "Colombo",
    name: "Colombo Region",
    total_zeo: 5,
    total_deo: 10,
    total_institutions: 200,
    total_staff: 50,
  },
  {
    id: 2,
    short_name: "Kandy",
    name: "Kandy Region",
    total_zeo: 3,
    total_deo: 8,
    total_institutions: 150,
    total_staff: 40,
  },
  {
    id: 3,
    short_name: "Galle",
    name: "Galle Region",
    total_zeo: 2,
    total_deo: 6,
    total_institutions: 100,
    total_staff: 30,
  },
];
