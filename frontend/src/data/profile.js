export const personalData = [
  { label: "Full Name", value: "Mr. Widana Pathiranage Somadasa" },
  { label: "Initials With Name", value: "Mr. W.P. Somadasa" },
  { label: "Date Of Birth", value: "1985-09-03" },
  { label: "Gender", value: "Male" },
  { label: "Ethnicity", value: "Sinhalese" },
  { label: "Civil Status", value: "Married" },
];

export const healthData = [
  { label: "Blood Group", value: "O+" },
  { label: "Overall Condition", value: "Good" },
  { label: "Known Problems", value: "None" },
];

export const contactData = [
  { label: "Email", value: "samanbandarawela@gmail.com" },
  { label: "Phone", value: "0718928319" },
];

export const locationData = [
  { label: "District", value: "Badulla" },
  { label: "GN Division", value: "78C : Badulla West" },
  {
    label: "Permanent Address",
    value: "No. 11, Pelakoswatta, Aluthwela Gama, Badulla. 90000",
  },
  { label: "Residential Address", value: "No. 11" },
  { label: "Latitude", value: "No. 11" },
  { label: "Longitude", value: "No. 11" },
];

export const profileData = {
  id: 1,
  nic: "200012345678",
  full_name: "Mohammed Shadhir",
  name_with_initials: "M. Shadhir",
  date_of_birth: "2000-05-14",
  bloodGroup: "O+",
  health_status: "Good",
  health_problem: "None",
  email: "mohammed.shadhir@example.com",
  phone: "0771234567",
  address_line1: "No. 123, Main Street",
  address_line2: "Colombo 07",
  address_line3: "",
  postal_code: "00700",
  district: {
    district_id: 1,
    district_name: "Colombo",
  },
  gnDivision: {
    gn_division_id: 1,
    gn_division_code: "GN001",
    gn_division_name: "Colombo 07",
  },

  title: {
    title_id: 1,
    title_name: "Mr.",
  },

  gender: {
    gender_id: "G01",
    gender_name: "Male",
  },

  ethnicity: {
    ethnicity_id: 1,
    ethnicity_name: "Sri Lankan Moor",
  },

  religion: {
    religion_id: 1,
    religion_name: "Islam",
  },

  civilStatus: {
    civil_status_id: 1,
    civil_status_name: "Single",
  },
};

export const roles = [
  {
    id: 1,
    name: "Super Admin",
    permissions: Array.from({ length: 416 }, (_, i) => ({
      name: `system.permission${i + 1}`,
    })),
  },
  {
    id: 2,
    name: "Teacher",
    permissions: [
      { name: "teacher.profile.view" },
      { name: "teacher.profile.update" },
      { name: "student.attendance.view" },
      { name: "student.attendance.mark" },
      { name: "student.result.view" },
      { name: "student.result.update" },
      { name: "student.profile.view" },
      { name: "student.profile.update" },
      { name: "report.view" },
      { name: "dashboard.view" },
    ],
  },
  {
    id: 3,
    name: "Principal",
    permissions: [
      { name: "school.dashboard.view" },
      { name: "teacher.manage" },
      { name: "student.manage" },
      { name: "report.generate" },
      { name: "attendance.overview" },
      { name: "school.settings.update" },
      { name: "announcement.create" },
      { name: "announcement.update" },
      { name: "profile.view" },
      { name: "profile.update" },
    ],
  },
  {
    id: 4,
    name: "Development Officer",
    permissions: [
      { name: "project.create" },
      { name: "project.update" },
      { name: "project.view" },
      { name: "fund.manage" },
      { name: "report.view" },
      { name: "report.export" },
      { name: "staff.view" },
      { name: "staff.manage" },
      { name: "profile.view" },
      { name: "dashboard.view" },
    ],
  },
  {
    id: 5,
    name: "Management Assistant",
    permissions: [
      { name: "document.create" },
      { name: "document.update" },
      { name: "document.view" },
      { name: "staff.profile.view" },
      { name: "staff.profile.update" },
      { name: "leave.manage" },
      { name: "report.view" },
      { name: "report.export" },
      { name: "dashboard.view" },
      { name: "profile.update" },
    ],
  },
  {
    id: 6,
    name: "SLEAS Officer",
    permissions: [
      { name: "education.policy.view" },
      { name: "education.policy.update" },
      { name: "school.monitor.view" },
      { name: "school.monitor.update" },
      { name: "teacher.manage" },
      { name: "student.manage" },
      { name: "report.generate" },
      { name: "report.export" },
      { name: "dashboard.view" },
      { name: "profile.update" },
    ],
  },
  {
    id: 7,
    name: "Teacher Advisor",
    permissions: [
      { name: "teacher.support.view" },
      { name: "teacher.support.update" },
      { name: "training.create" },
      { name: "training.update" },
      { name: "training.view" },
      { name: "school.visit.view" },
      { name: "school.visit.update" },
      { name: "report.view" },
      { name: "dashboard.view" },
      { name: "profile.update" },
    ],
  },
  {
    id: 8,
    name: "Administrative Service",
    permissions: [
      { name: "admin.dashboard.view" },
      { name: "file.manage" },
      { name: "document.approve" },
      { name: "document.reject" },
      { name: "staff.manage" },
      { name: "attendance.view" },
      { name: "report.view" },
      { name: "report.export" },
      { name: "profile.view" },
      { name: "profile.update" },
    ],
  },
  {
    id: 9,
    name: "Accountancy Service",
    permissions: [
      { name: "finance.dashboard.view" },
      { name: "budget.create" },
      { name: "budget.update" },
      { name: "expense.manage" },
      { name: "payment.approve" },
      { name: "invoice.manage" },
      { name: "report.finance.view" },
      { name: "report.finance.export" },
      { name: "profile.view" },
      { name: "profile.update" },
    ],
  },
];
