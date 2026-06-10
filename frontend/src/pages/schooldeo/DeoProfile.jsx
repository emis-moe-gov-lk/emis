// src/pages/employees/deo/DeoProfile.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthUser } from "@/context/useAuthUser";
import { Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import StatusBadge from "@/components/common/StatusBadge";
import { resolveProfileImage } from "@/utils/profileImage";
import { HiDocumentText, HiPencilAlt } from "react-icons/hi";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import UIButton from "@/components/UiComponents/Button";
import TeacherUpdateModal from "@/components/teacher/TeacherUpdateModal"; // reuse if needed
import profile_m from "@/assets/images/profile_m.png";
import profile_f from "@/assets/images/profile_f.png";

/**
 * DEO Profile Page
 * - Shows the logged‑in DEO's personal, contact, and employment details.
 * - Same UI style as TeacherProfile.
 * - For School DEO role, the profile is read‑only (no edit buttons).
 * - API endpoint placeholder: replace "/deo/profile" with your actual endpoint.
 */
const DeoProfile = () => {
  const { id } = useParams();
  const { identity, user, roles } = useAuthUser();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [modalSection, setModalSection] = useState(null);

  // Detect if user is School DEO (read‑only)
  const isSchoolDeo = roles?.some(
    (r) => String(r).trim().toLowerCase() === "school deo"
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      // 🔁 REPLACE THIS ENDPOINT WITH YOUR ACTUAL DEO PROFILE API
      // If an ID is provided in the URL, use it; otherwise, use the current user's profile endpoint.
      const endpoint = id ? `/employees/schooldeo/${id}` : "/deo/profile";
      const res = await api.get(endpoint);
      if (res.data?.status === "success") {
        const data = res.data.data;
        setProfile({
          id: data.id,
          profileImage: resolveProfileImage(
            data.profile_image || data.avatar,
            data.gender_id
          ),
          fullName: data.full_name,
          nic: data.nic,
          employeeId: data.employee_id,
          email: data.email,
          phone: data.phone,
          gender: data.gender_name,
          dob: data.date_of_birth,
          // Personal
          title: data.title,
          initials: data.name_with_initials,
          religion: data.religion_name,
          ethnicity: data.ethnicity_name,
          civilStatus: data.civil_status_name,
          // Address
          permanentAddress: data.permanent_address,
          tempAddress: data.temporary_address,
          district: data.district_name,
          dsOffice: data.ds_office_name,
          gnDivision: data.gn_division_name,
          postalCode: data.postal_code,
          // Employment / Assignment
          service: data.service_name,
          rank: data.rank_name,
          position: data.position_name,
          appointmentDate: data.appointment_date,
          workplace: data.workplace_name,        // school or zone office
          workplaceAddress: data.workplace_address,
          assignedZone: data.zone_name,
          assignedSchool: data.school_name,
          // Status
          status: data.status || "Active",
        });
      } else {
        toast.error("Failed to load profile data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleDownloadDocument = async () => {
    // optional: implement DEO document download if needed
    toast("Document download not implemented yet");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <Spinner size="xl" color="info" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading DEO profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back link */}
      <div className="pt-1">
        <BackToListButton 
          to={id ? "/employees/schooldeo" : "/dashboard"} 
          label={id ? "Back to DEO List" : "Back to Dashboard"} 
        />
      </div>

      {/* Header strip */}
      <HeaderStrip
        profile={profile}
        onDownloadDocument={handleDownloadDocument}
        isSchoolDeo={isSchoolDeo}
      />

      {/* Main content - two column layout (no tabs, just sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar (optional) - can show role badge or quick actions */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl surface overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                DEO Profile
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Your details & assignment
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="font-semibold">
                    {roles?.join(", ") || "DEO"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <StatusBadge className="px-2 py-0.5 text-xs">
                    {profile.status}
                  </StatusBadge>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned Zone</span>
                  <span className="font-mono text-xs">
                    {profile.assignedZone || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Assigned School</span>
                  <span className="font-mono text-xs">
                    {profile.assignedSchool || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right content – sections like TeacherProfile */}
        <section className="lg:col-span-9 space-y-5">
          {/* Personal & Cultural */}
          <ColorSection
            title="Personal Information"
            color="slate"
            right={
              !isSchoolDeo && (
                <RoundedActionButton
                  onClick={() => setModalSection("personal")}
                  variant="outline"
                >
                  Edit
                </RoundedActionButton>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldCell label="Full Name" value={profile.fullName} />
              <FieldCell label="Name with Initials" value={profile.initials} />
              <FieldCell label="NIC" value={profile.nic} />
              <FieldCell label="Employee ID" value={profile.employeeId} />
              <FieldCell label="Date of Birth" value={profile.dob} />
              <FieldCell label="Gender" value={profile.gender} />
              <FieldCell label="Religion" value={profile.religion} />
              <FieldCell label="Ethnicity" value={profile.ethnicity} />
              <FieldCell label="Civil Status" value={profile.civilStatus} />
            </div>
          </ColorSection>

          {/* Contact & Location */}
          <ColorSection
            title="Contact Details"
            color="indigo"
            right={
              !isSchoolDeo && (
                <RoundedActionButton
                  onClick={() => setModalSection("contact")}
                  variant="outline"
                >
                  Edit
                </RoundedActionButton>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldCell label="Email" value={profile.email} />
              <FieldCell label="Phone" value={profile.phone} />
              <FieldCell label="District" value={profile.district} />
              <FieldCell label="DS Office" value={profile.dsOffice} />
              <FieldCell label="GN Division" value={profile.gnDivision} />
              <FieldCell label="Postal Code" value={profile.postalCode} />
              <div className="md:col-span-2">
                <FieldCell label="Permanent Address" value={profile.permanentAddress} />
              </div>
              <div className="md:col-span-2">
                <FieldCell label="Temporary Address" value={profile.tempAddress || "—"} />
              </div>
            </div>
          </ColorSection>

          {/* Employment / Assignment Details */}
          <ColorSection
            title="Employment & Assignment"
            color="teal"
            right={
              !isSchoolDeo && (
                <RoundedActionButton
                  onClick={() => setModalSection("employment")}
                  variant="outline"
                >
                  Edit
                </RoundedActionButton>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FieldCell label="Service" value={profile.service} />
              <FieldCell label="Rank" value={profile.rank} />
              <FieldCell label="Position" value={profile.position} />
              <FieldCell label="Appointment Date" value={profile.appointmentDate} />
              <FieldCell label="Workplace" value={profile.workplace} />
              <div className="md:col-span-2">
                <FieldCell label="Workplace Address" value={profile.workplaceAddress} />
              </div>
              <FieldCell label="Assigned Zone" value={profile.assignedZone} />
              <FieldCell label="Assigned School" value={profile.assignedSchool} />
            </div>
          </ColorSection>
        </section>
      </div>

      {/* Edit modal – reuse TeacherUpdateModal if needed */}
      {!isSchoolDeo && (
        <TeacherUpdateModal
          isOpen={modalSection !== null}
          section={modalSection}
          teacherId={profile.id}   // might be DEO id
          onClose={() => setModalSection(null)}
          onSaved={async () => {
            await loadProfile();
            setModalSection(null);
            toast.success("Profile updated");
          }}
        />
      )}
    </div>
  );
};

export default DeoProfile;

/* =========================================================
   Reusable UI components (copied from TeacherProfile)
========================================================= */

function HeaderStrip({ profile, onDownloadDocument, isSchoolDeo }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-gray-800">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
        <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-6">
          <div className="flex items-start gap-4 min-w-0 max-w-2xl">
            <div className="w-1.5 rounded-full bg-blue-600 self-stretch" />
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100 dark:bg-gray-700">
                <img
                  src={profile.profileImage || profile_m}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                  {profile.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <StatusBadge className="px-4 py-1 font-bold rounded-full text-xs">
                    {profile.status}
                  </StatusBadge>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold">NIC:</span> {profile.nic}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={profile.employeeId} />
            <MiniKey label="Service" value={profile.service} />
            <MiniKey label="Rank" value={profile.rank} />
          </div>
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
            {!isSchoolDeo && (
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
                <HiPencilAlt className="h-4 w-4 text-blue-600" />
                Edit Profile
              </button>
            )}
            <button
              onClick={onDownloadDocument}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md"
            >
              <HiDocumentText className="h-4 w-4" />
              Download Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKey({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-4 py-3 shadow-sm hover:border-blue-200 transition-colors">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-black text-gray-900 dark:text-white">
        {value || "—"}
      </div>
    </div>
  );
}

function ColorSection({ title, color = "blue", right, children }) {
  const colorMap = {
    slate: "bg-slate-700",
    teal: "bg-teal-700",
    indigo: "bg-indigo-700",
    blue: "bg-blue-700",
  };
  const headerClass = colorMap[color] || "bg-blue-700";

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className={`px-6 py-4 text-white ${headerClass} bg-linear-to-r from-[rgba(255,255,255,0.05)] to-transparent`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-black tracking-tight">{title}</h3>
          {right}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldCell({ label, value, span = 1 }) {
  return (
    <div className={span > 1 ? `md:col-span-${span}` : ""}>
      <div className="rounded-2xl border border-gray-50 dark:border-gray-700 px-4 py-3 bg-gray-50/30 dark:bg-gray-900/20 hover:border-blue-100 transition-colors group/field">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/field:text-blue-500">
          {label}
        </div>
        <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white whitespace-pre-line">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function RoundedActionButton({ icon, children, onClick, variant = "outline" }) {
  const Icon = icon;
  return (
    <UIButton
      onClick={onClick}
      variant={variant === "primary" ? "primary" : "secondary"}
      className="rounded-xl text-sm font-black"
      icon={Icon ? <Icon className="h-4 w-4" /> : null}
    >
      {children}
    </UIButton>
  );
}