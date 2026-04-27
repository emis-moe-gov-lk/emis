import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "@/App";
import HelpCenter from "@/HelpCenter";
import { Login } from "@/pages/auth/Login";
import Logout from "@/pages/auth/Logout";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";
import { NotFound } from "@/pages/error/NotFound";
import { NotAuthorizedPage } from "@/pages/error/NotAuthorizedPage";
// import Dashboard from "@/pages/Dashboard";
import OidcCallback from "@/pages/auth/OidcCallback";

import InstitutionIndex from "@/pages/institution/InstitutionIndex";
import InstitutionProfile from "@/pages/institution/InstitutionProfile";
import InstitutionCreate from "@/pages/institution/InstitutionCreate";

import RegTeacher from "@/pages/teacher/RegTeacher";
import TeacherBulkUpload from "@/pages/teacher/TeacherBulkUpload";
import TeacherList from "@/pages/teacher/TeacherList";
import TeacherProfile from "@/pages/teacher/TeacherProfile";

import OfficesOverview from "@/pages/offices/OfficesOverview";
import MoeOfficeList from "@/pages/offices/MoeOfficeList";
import PmoeOfficeList from "@/pages/offices/PmoeOfficeList";
import PeoOfficeList from "@/pages/offices/PeoOfficeList";
import ZeoOfficeList from "@/pages/offices/ZeoOfficeList";
import DeoOfficeList from "@/pages/offices/DeoOfficeList";

import { AbilityProvider } from "@/auth/AbilityProvider";
import Profile from "../components/UserProfile/Profile";
import MyProfileLayout from "../components/UserProfile/MyProfileLayout";

import VersionPage from "../components/UserProfile/SettingsPage/VersionPage/VersionPage";
import Settings from "../components/UserProfile/SettingsPage/Settings.jsx";
import TeacherReport from "../pages/timetable/TeacherReport.jsx";
import RecordBook from "../pages/timetable/RecordBook.jsx";
import DayTable from "../pages/timetable/DayTable.jsx";
import MonthlyTimeTable from "../pages/timetable/MonthlyTimeTable.jsx";
import WeeklyTimeTable from "../pages/timetable/WeeklyTimeTable.jsx";
import TeacherConfigSetup from "../pages/timetable/TeacherConfigSetup.jsx";
import { Outlet } from "react-router";
import UpdateDashbord from "../pages/UpdateDashbord.jsx";
import Alert from "../pages/Alert.jsx";
import CreateRole from "../pages/RoleCreate.jsx";
import RolesList from "../pages/RoleList.jsx";
import MainTables from "../pages/MainTables.jsx";
import UsersList from "@/pages/users/UsersList";
import UserCreate from "@/pages/users/UserCreate";
import UserEdit from "@/pages/users/UserEdit";
import { TimetableProvider } from "../context/TimetableContext.jsx";
import { TeacherFormProvider } from "../context/TeacherFormContext.jsx";
import DosDirectory from "../pages/DosDirectory.jsx";
import DosBulkUpload from "../pages/dos/DosBulkUpload.jsx";
import RegDos from "../pages/dos/RegDos.jsx";
import DosList from "../components/dos/DosList.jsx";

export default function AppRoutes() {
  return (
    <AbilityProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* OIDC Callback Route */}
        <Route path="/authentication/callback" element={<OidcCallback />} />

        {/* Admin Route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected section */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Timetable routes */}
            <Route path="timetable">
              <Route path="setup" element={<TeacherConfigSetup />} />
              <Route
                element={
                  <TimetableProvider>
                    <Outlet />
                  </TimetableProvider>
                }
              >
                <Route path="weekly" element={<WeeklyTimeTable />} />
                <Route path="monthly" element={<MonthlyTimeTable />} />
                <Route path="day" element={<DayTable />} />
                <Route path="record-book" element={<RecordBook />} />
                <Route path="report" element={<TeacherReport />} />
              </Route>
            </Route>

            <Route path="/dashboard" element={<UpdateDashbord />} />

            <Route path="dashboard/VersionPage" element={<VersionPage />} />
            <Route path="dashboard/profile/:id" element={<MyProfileLayout />} />
            <Route path="dashboard/Settings" element={<Settings />} />

            {/* Institution routes */}
            <Route path="institution">
              <Route index element={<InstitutionIndex />} />
              <Route path="create" element={<InstitutionCreate />} />
              <Route path=":id" element={<InstitutionProfile />} />
            </Route>

            <Route path="alert" element={<Alert />} />
            <Route path="roles/create" element={<CreateRole />} />
            <Route path="roles" element={<RolesList />} />
            <Route path="maintable" element={<MainTables />} />
            <Route path="users" element={<UsersList />} />
            <Route path="users/create" element={<UserCreate />} />
            <Route path="users/edit" element={<UserEdit />} />
            <Route path="users/:id/edit" element={<UserEdit />} />

            {/* Other protected routes */}
            <Route
              path="employees/teacher"
              element={
                <TeacherFormProvider>
                  <Outlet />
                </TeacherFormProvider>
              }
            >
              {/* redirect /teacher → /teacher/create */}
              <Route index element={<TeacherList />} />
              <Route path="bulk-upload" element={<TeacherBulkUpload />} />
              <Route path="create" element={<RegTeacher />} />
              <Route path=":id" element={<TeacherProfile />} />
            </Route>

            <Route path="employees/development-officers">
              <Route index element={<DosDirectory />} />
              <Route path="bulk-upload" element={<DosBulkUpload />} />
              <Route path="create" element={<RegDos />} />
            </Route>
            <Route
              path="employees/development-officers"
              element={<DosDirectory />}
            />

            <Route path="offices/moe" element={<MoeOfficeList />} />
            <Route path="offices/pmoe" element={<PmoeOfficeList />} />
            <Route path="offices/peo" element={<PeoOfficeList />} />
            <Route path="offices/zeo" element={<ZeoOfficeList />} />
            <Route path="offices/deo" element={<DeoOfficeList />} />
            <Route path="offices/overview" element={<OfficesOverview />} />
          </Route>
        </Route>

        {/* Errors */}
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1f2937",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "500",
            padding: "16px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(229, 231, 235, 1)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              borderLeft: "4px solid #10b981",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              borderLeft: "4px solid #ef4444",
            },
          },
        }}
      />
    </AbilityProvider>
  );
}
