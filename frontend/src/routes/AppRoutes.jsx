import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "@/App";
import Landing from "@/pages/landing/Landing";
import HelpCenter from "@/HelpCenter";
import { Login } from "@/pages/auth/Login";
import Logout from "@/pages/auth/Logout";
import ForcePasswordChange from "@/pages/auth/ForcePasswordChange";
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
import PrincipalList from "@/pages/principal/PrincipalList";
import PrincipalProfile from "@/pages/principal/PrincipalProfile";
import RegPrincipal from "@/pages/principal/RegPrincipal";

import SchoolDeo from "@/pages/schooldeo/SchoolDeo";
import DeoProfile from "@/pages/schooldeo/DeoProfile";
import RegDeo from "@/pages/schooldeo/RegDeo";


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
import NotificationsSettings from "../components/UserProfile/SettingsPage/NotificationsSettings.jsx";
import PrivacySettings from "../components/UserProfile/SettingsPage/PrivacySettings.jsx";
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
import { TimetableProvider } from "../context/TimeTableContext.jsx";
import { TeacherFormProvider } from "../context/TeacherFormContext.jsx";
import ZonalDirectory from "../pages/zonal/ZonalDirectory.jsx";
import DivisionDeoDirectory from "../pages/division/DivisionDeoDirectory.jsx";
import DivisionAdminDirectory from "../pages/division/DivisionAdminDirectory.jsx";
import DosBulkUpload from "../pages/dos/DosBulkUpload.jsx";
import RegDos from "../pages/dos/RegDos.jsx";
import DosAdminForm from "../pages/dos/DosAdminForm.jsx";
import RegDeoOfficer from "../pages/dos/RegDeoOfficer.jsx";
import RegDivisionDeoOfficer from "../pages/division/RegDivisionDeoOfficer.jsx";
import RegAdmin from "../pages/division/RegDivisionAdmin";
import DivisionDeoProfile from "../pages/division/DivisionDeoProfile.jsx";
import DivisionAdminProfile from "../pages/division/DivisionAdminProfile.jsx";
import DosList from "../components/dos/DosList.jsx";
import DosAdminProfile from "../pages/dos/DosAdminProfile.jsx";

import AlertsOverview from "../components/Alert/AlertsOverview.jsx";

import PendingConfirmationList from "../components/Alert/PendingConfirmationList.jsx";
import PendingVerificationList from "../components/Alert/PendingVerificationList.jsx";
import RejectedList from "../components/Alert/RejectedList.jsx";
import RevisedList from "../components/Alert/RevisedList.jsx";

export default function AppRoutes() {
  return (
    <AbilityProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<App />}>
          <Route index element={<Landing />} />
        </Route>
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/force-password-change"
          element={
            <ProtectedRoute roles={["teacher"]}>
              <ForcePasswordChange />
            </ProtectedRoute>
          }
        />

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

            <Route path="dashboard/versionpage" element={<VersionPage />} />
            <Route path="dashboard/VersionPage" element={<VersionPage />} />
            <Route path="dashboard/profile" element={<MyProfileLayout />} />
            <Route path="dashboard/Settings" element={<Settings />} />
            <Route
              path="dashboard/settings/notifications"
              element={<NotificationsSettings />}
            />
            <Route
              path="dashboard/settings/privacy"
              element={<PrivacySettings />}
            />

            {/* Institution routes */}
            <Route path="institution">
              <Route index element={<InstitutionIndex />} />
              <Route path="create" element={<InstitutionCreate />} />
              <Route path=":id" element={<InstitutionProfile />} />
            </Route>

            <Route path="alert" element={<Alert />} />

            <Route
              path="alert/pending-confirmation"
              element={<PendingConfirmationList />}
            />

            <Route
              path="alert/pending-verification"
              element={<PendingVerificationList />}
            />

            <Route path="alert/revised" element={<RevisedList />} />

            <Route path="alert/rejected" element={<RejectedList />} />

            <Route
              path="roles/create"
              element={
                <ProtectedRoute permissions={["user.create"]}>
                  <CreateRole />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute permissions={["user.create"]}>
                  <RolesList />
                </ProtectedRoute>
              }
            />
            <Route path="maintable" element={<MainTables />} />
            <Route
              path="users"
              element={
                <ProtectedRoute permissions={["user.list.view"]}>
                  <UsersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/create"
              element={
                <ProtectedRoute permissions={["user.create"]}>
                  <UserCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/edit"
              element={
                <ProtectedRoute permissions={["user.update"]}>
                  <UserEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/:id/edit"
              element={
                <ProtectedRoute permissions={["user.update"]}>
                  <UserEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="teacher/:id"
              element={
                <TeacherFormProvider>
                  <TeacherProfile />
                </TeacherFormProvider>
              }
            />

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

            <Route path="employees/schooldeo">
              <Route index element={<SchoolDeo />} />
              <Route path="create" element={<RegDeo />} />
              <Route
                path=":id"
                element={
                  <TeacherFormProvider>
                    <DeoProfile />
                  </TeacherFormProvider>
                }
              />
            </Route>

            <Route path="employees/development-officers">
              <Route index element={<ZonalDirectory />} />
              <Route path="bulk-upload" element={<DosBulkUpload />} />
              <Route path="create" element={<RegDeoOfficer />} />
              <Route path=":id" element={<DosAdminProfile />} />
            </Route>
            <Route path="employees/division/deo">
              <Route index element={<DivisionDeoDirectory />} />
              <Route path="create" element={<RegDivisionDeoOfficer />} />
              <Route path=":id" element={<DivisionDeoProfile />} />
            </Route>
            <Route path="employees/division/admin">
              <Route index element={<DivisionAdminDirectory />} />
              <Route path="create" element={<RegAdmin />} />
              <Route path=":id" element={<DivisionAdminProfile />} />
            </Route>
            <Route path="employees/edu-directors">
              <Route index element={<ZonalDirectory />} />
              <Route path="bulk-upload" element={<DosBulkUpload />} />
              <Route path="create" element={<DosAdminForm />} />
              <Route path=":id" element={<DosAdminProfile />} />
            </Route>

            <Route path="employees/zonaldirector">
              <Route index element={<ZonalDirectory />} />
              <Route path="bulk-upload" element={<DosBulkUpload />} />
              <Route path="create" element={<RegDos />} />
              <Route path=":id" element={<DosAdminProfile />} />
            </Route>
            <Route path="employees/principal" element={<PrincipalList />} />
            <Route
              path="employees/principal/create"
              element={<RegPrincipal />}
            />
            <Route
              path="employees/principal/:id"
              element={<PrincipalProfile />}
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
