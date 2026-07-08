import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiDocumentText, HiPlus } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import { getProvincialAdminById, addProvincialAdminServiceHistoryEntry, addProvincialAdminPastService, downloadProvincialAdminProfileDocument } from "@/api/provincialAdminService";
import ProfileDataTable from "@/components/common/ProfileDataTable";
import BackToListButton from "@/components/UiComponents/BackToListButton";
import toast from "react-hot-toast";
import {
  DEFAULT_SERVICE_HISTORY_FORM,
  DEFAULT_PAST_SERVICE_FORM,
  ServiceHistoryTab,
  ServiceHistoryModal,
  PastServiceModal,
  isSchoolBasedService,
} from "@/components/common/ServiceHistory";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

const formatDate = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const tablePrimaryCellClass =
  "px-5 py-4 font-semibold text-gray-900 dark:text-gray-100";
const tableCellClass = "px-5 py-4 text-gray-700 dark:text-gray-300";
const tableActionButtonClass =
  "rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-extrabold hover:bg-gray-50 dark:hover:bg-gray-800";

export default function ProvincialAdminProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  const [serviceHistory, setServiceHistory] = useState({ appointments: [], historyEntries: [], currentAppointment: null });
  const [isServiceHistoryModalOpen, setIsServiceHistoryModalOpen] = useState(false);
  const [serviceHistoryForm, setServiceHistoryForm] = useState(DEFAULT_SERVICE_HISTORY_FORM);
  const [isSavingServiceHistory, setIsSavingServiceHistory] = useState(false);
  const [isPastServiceModalOpen, setIsPastServiceModalOpen] = useState(false);
  const [pastServiceForm, setPastServiceForm] = useState(DEFAULT_PAST_SERVICE_FORM);
  const [isSavingPastService, setIsSavingPastService] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProvincialAdminById(id);
        if (res.status === "success") {
          const d = res.data;
          setAdmin(d);
          setServiceHistory({
            appointments: d.my_appointments ?? [],
            historyEntries: d.appointment_history ?? [],
            currentAppointment: d.current_appointment ?? null,
          });
        }
      } catch (err) {
        console.error("Failed to load admin profile", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const openServiceHistoryModal = () => {
    const firstApptId = serviceHistory.appointments[0]?.appointment_id ?? "";
    setServiceHistoryForm({ ...DEFAULT_SERVICE_HISTORY_FORM, appointment_id: firstApptId });
    setIsServiceHistoryModalOpen(true);
  };

  const closeServiceHistoryModal = () => {
    setIsServiceHistoryModalOpen(false);
    setServiceHistoryForm(DEFAULT_SERVICE_HISTORY_FORM);
  };

  const openPastServiceModal = () => {
    setPastServiceForm(DEFAULT_PAST_SERVICE_FORM);
    setIsPastServiceModalOpen(true);
  };

  const closePastServiceModal = () => {
    setIsPastServiceModalOpen(false);
    setPastServiceForm(DEFAULT_PAST_SERVICE_FORM);
  };

  const handlePastServiceFieldChange = (key, value) => {
    setPastServiceForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePastServiceSave = async () => {
    const { service_id, rank_id, position_id, workplace_id, first_appointment_date } = pastServiceForm;
    if (!service_id || !rank_id || !position_id || !workplace_id || !first_appointment_date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSavingPastService(true);
    try {
      const serviceName = pastServiceForm._service_name ?? "";
      const officeLevelId = isSchoolBasedService(serviceName) ? "OLID006" : "OLID003";
      const res = await addProvincialAdminPastService(id, { ...pastServiceForm, office_level_id: officeLevelId });
      if (res?.status === "success") {
        toast.success("Past service block added.");
        closePastServiceModal();
        setServiceHistory((prev) => ({
          ...prev,
          appointments: [res.data, ...prev.appointments],
        }));
      } else {
        toast.error(res?.message ?? "Failed to save.");
      }
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err?.response?.data?.message ?? "Failed to save.");
      }
    } finally {
      setIsSavingPastService(false);
    }
  };

  const handleServiceHistoryFieldChange = (field, value) => {
    setServiceHistoryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceHistorySave = async () => {
    setIsSavingServiceHistory(true);
    try {
      const selectedAppt = serviceHistory.appointments.find(
        (a) => a.appointment_id === serviceHistoryForm.appointment_id,
      ) ?? serviceHistory.appointments[0];

      const serviceName = selectedAppt?.service?.service_name ?? "";
      const isOfficeBased = !/teachers\s+service|principals\s+service|slts|slps/i.test(serviceName);

      const payload = {
        ...serviceHistoryForm,
        service_id: selectedAppt?.service_id ?? serviceHistoryForm.service_id,
        office_level_id: isOfficeBased ? "OLID003" : "OLID006",
      };

      const res = await addProvincialAdminServiceHistoryEntry(id, payload);
      if (res.status === "success") {
        toast.success("Service history entry added");
        setServiceHistory((prev) => ({
          ...prev,
          historyEntries: [res.data, ...prev.historyEntries],
        }));
        closeServiceHistoryModal();
      } else {
        toast.error(res.message ?? "Failed to save entry");
      }
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error(err?.response?.data?.message ?? "Failed to save entry");
      }
    } finally {
      setIsSavingServiceHistory(false);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "qualification", label: "Qualification" },
    { id: "employment", label: "Employment" },
    { id: "service_history", label: "Service History" },
    { id: "service", label: "Service" },
    { id: "wop", label: "W&OP and Payment" },
    { id: "family", label: "Family" },
    { id: "edit", label: "Edit Request" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <Spinner size="xl" color="info" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="p-8 text-center text-red-500">Profile not found.</div>
    );
  }

  const ca = admin.current_appointment;
  const fa = admin.appointment;

  const profile = {
    fullName: admin.full_name,
    initialsName: admin.name_with_initials,
    nic: admin.nic,
    employeeId: admin.people_id,
    position: ca?.position?.position_name ?? "—",
    service: ca?.service?.service_name ?? fa?.service?.service_name ?? "—",
    dob: formatDate(admin.date_of_birth),
    gender: admin.gender?.gender_name,
    religion: admin.religion?.religion_name,
    ethnicity: admin.ethnicity?.ethnicity_name,
    civilStatus: admin.civil_status?.civil_status_name,
    bloodGroup: admin.blood_group?.blood_group,
    healthCondition: admin.health_condition ? "Yes" : "No",
    healthProblem: admin.health_problem,
    email: admin.email,
    phone: admin.phone,
    district: admin.district?.district_name,
    gnDivision: admin.gn_division?.gn_division_name,
    dsOffice: admin.ds_office?.dso_name,
    address: [admin.address_line1, admin.address_line2, admin.address_line3]
      .filter(Boolean)
      .join("\n"),
    postalCode: admin.postal_code,
    caDate: formatDate(ca?.appoint_date),
    caLetter: ca?.appointment_letter_no,
    caService: ca?.service?.service_name,
    caRank: ca?.rank?.rank_name,
    caPosition: ca?.position?.position_name,
    caWorkplace: ca?.workplace?.name,
    faDate: formatDate(fa?.first_appointment_date),
    faLetter: fa?.appointment_letter_no,
    faRetirement: formatDate(fa?.retirement_date),
    recruitmentCategory: fa?.recruitment_category?.category_name,
    recruitmentSubject: fa?.recruitment_subject?.a_subject_name,
  };

  return (
    <div className="space-y-5">
      {/* Back link */}
      <div className="pt-1">
        <BackToListButton onClick={() => navigate(-1)} label="Back to List" />
      </div>

      {/* Header strip */}
      <HeaderStrip profile={profile} />

      {/* Layout: Left menu + Right content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left menu */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl surface overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Provincial Admin
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Provincial Administration profile
              </div>
            </div>

            <div className="p-2">
              {tabs.map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={[
                      "w-full text-left px-4 py-3 rounded-xl text-sm transition flex items-center justify-between group",
                      active
                        ? "bg-blue-600 dark:bg-blue-700 text-white shadow-md shadow-blue-200 dark:shadow-none"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    ].join(" ")}
                  >
                    <span className={active ? "font-semibold" : "font-medium"}>
                      {t.label}
                    </span>
                    <span
                      className={[
                        "h-2 w-2 rounded-full",
                        active ? "bg-white/90" : "bg-transparent",
                      ].join(" ")}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right content */}
        <section className="lg:col-span-9 space-y-5">
          {activeTab === "general" && <GeneralTab profile={profile} />}
          {activeTab === "qualification" && <QualificationTab />}
          {activeTab === "employment" && <EmploymentTab profile={profile} />}
          {activeTab === "service_history" && (
            <ServiceHistoryTab
              serviceHistory={serviceHistory}
              onAddPosting={openServiceHistoryModal}
              onAddPastService={openPastServiceModal}
            />
          )}
          {activeTab === "service" && <ServiceTab />}
          {activeTab === "wop" && <WopTab />}
          {activeTab === "family" && <FamilyTab />}
          {activeTab === "edit" && <EditRequestTab />}
        </section>
      </div>

      <ServiceHistoryModal
        isOpen={isServiceHistoryModalOpen}
        form={serviceHistoryForm}
        appointments={serviceHistory.appointments}
        onChange={handleServiceHistoryFieldChange}
        onClose={closeServiceHistoryModal}
        onSubmit={handleServiceHistorySave}
        isSubmitting={isSavingServiceHistory}
      />

      <PastServiceModal
        isOpen={isPastServiceModalOpen}
        form={pastServiceForm}
        onChange={handlePastServiceFieldChange}
        onClose={closePastServiceModal}
        onSubmit={handlePastServiceSave}
        isSubmitting={isSavingPastService}
      />
    </div>
  );
}

/* =========================================================
   Header Strip
========================================================= */

function HeaderStrip({ profile }) {
  const [isDownloadingDocument, setIsDownloadingDocument] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-gray-800">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
        <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-6">
          <div className="flex items-start gap-4 min-w-0 max-w-2xl">
            <div className="w-1.5 rounded-full bg-blue-600 self-stretch shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
            <div className="min-w-0">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                  {profile.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge className="px-4 py-1 font-bold rounded-full text-xs">
                    {profile.position}
                  </StatusBadge>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                      {profile.service}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>NIC</span>
                    <span className="font-mono font-black text-gray-900 dark:text-white">
                      {profile.nic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={profile.employeeId} />
            <MiniKey label="Initials" value={profile.initialsName} />
          </div>

          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
            <Can permission={PermissionGroups.ZONAL.ADMIN_PROFILE_VIEW}>
              <button 
                onClick={async () => {
                  try {
                    setIsDownloadingDocument(true);
                    const data = await downloadProvincialAdminProfileDocument(profile.employeeId);
                    const blob = new Blob([data], { type: "application/pdf" });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `provincial-admin-profile-${profile.nic || profile.employeeId}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                  } catch (error) {
                    console.error("Failed to download provincial admin document:", error);
                    toast.error("Failed to download profile document.");
                  } finally {
                    setIsDownloadingDocument(false);
                  }
                }}
                disabled={isDownloadingDocument}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-75 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200 dark:shadow-none"
              >
                {isDownloadingDocument ? (
                  <>
                    <Spinner size="sm" light={true} />
                    <span>Preparing PDF...</span>
                  </>
                ) : (
                  <>
                    <HiDocumentText className="h-4 w-4" />
                    <span>Get Document</span>
                  </>
                )}
              </button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniKey({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-4 py-3 shadow-sm hover:border-blue-200 dark:hover:border-blue-900/40 transition-colors group/key">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/key:text-blue-500 dark:text-gray-500 transition-colors">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">
        {value || "—"}
      </div>
    </div>
  );
}

/* =========================================================
   Shared: ColorSection + FieldCell + RoundedActionButton
========================================================= */

function ColorSection({ title, color = "blue", children }) {
  const headerClass =
    {
      slate: "bg-slate-700",
      teal: "bg-teal-700",
      indigo: "bg-indigo-700",
      emerald: "bg-emerald-700",
      rose: "bg-rose-700",
      amber: "bg-amber-700",
      blue: "bg-blue-700",
    }[color] || "bg-blue-700";

  return (
    <div className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div
        className={`px-6 py-4 text-white ${headerClass} bg-linear-to-r from-[rgba(255,255,255,0.05)] to-transparent`}
      >
        <h3 className="text-base font-black tracking-tight">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldCell({ label, value, span = 1 }) {
  return (
    <div className={span > 1 ? `md:col-span-${span}` : ""}>
      <div className="rounded-2xl border border-gray-50 dark:border-gray-700 px-4 py-3 bg-gray-50/30 dark:bg-gray-900/20 hover:border-blue-100 dark:hover:border-blue-900 transition-colors group/field">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/field:text-blue-500 transition-colors">
          {label}
        </div>
        <div className="mt-1 text-sm font-bold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Tabs
========================================================= */

function GeneralTab({ profile }) {
  return (
    <div className="space-y-6">
      <ColorSection title="Personal Information" color="indigo">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldCell label="Full Name" value={profile.fullName} span={3} />
          <FieldCell label="Name with Initials" value={profile.initialsName} span={2} />
          <FieldCell label="NIC Number" value={profile.nic} />
          <FieldCell label="Date of Birth" value={profile.dob} />
          <FieldCell label="Gender" value={profile.gender} />
          <FieldCell label="Civil Status" value={profile.civilStatus} />
          <FieldCell label="Religion" value={profile.religion} />
          <FieldCell label="Ethnicity" value={profile.ethnicity} />
          <FieldCell label="Blood Group" value={profile.bloodGroup} />
          <FieldCell label="Special Health Condition" value={profile.healthCondition} />
          {profile.healthProblem && (
            <FieldCell label="Health Problem Details" value={profile.healthProblem} span={2} />
          )}
        </div>
      </ColorSection>

      <ColorSection title="Contact Information" color="teal">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldCell label="Primary Email" value={profile.email} span={2} />
          <FieldCell label="Mobile Number" value={profile.phone} />
          <FieldCell label="District" value={profile.district} />
          <FieldCell label="Divisional Secretariat" value={profile.dsOffice} />
          <FieldCell label="GN Division" value={profile.gnDivision} />
          <FieldCell label="Residential Address" value={profile.address} span={2} />
          <FieldCell label="Postal Code" value={profile.postalCode} />
        </div>
      </ColorSection>
    </div>
  );
}

function QualificationTab() {
  return (
    <div className="space-y-6">
      <ColorSection title="Academic Qualifications" color="emerald">
        <ProfileDataTable
          headers={["Degree / Exam", "Subject / Specialization", "Institute / School", "Year", "Class / Grade"]}
          rows={[]}
          placeholder="No academic qualifications recorded."
        />
      </ColorSection>

      <ColorSection title="Professional Qualifications" color="teal">
        <ProfileDataTable
          headers={["Qualification Name", "Institute / Body", "Status / Level", "Effective Date", "Certificate No"]}
          rows={[]}
          placeholder="No professional qualifications recorded."
        />
      </ColorSection>
    </div>
  );
}

function EmploymentTab({ profile }) {
  return (
    <div className="space-y-6">
      <ColorSection title="First Appointment Details" color="slate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldCell label="Date of First Appointment" value={profile.faDate} />
          <FieldCell label="Appointment Letter No" value={profile.faLetter} />
          <FieldCell label="Retirement Date" value={profile.faRetirement} />
          <FieldCell label="Recruitment Category" value={profile.recruitmentCategory} />
          <FieldCell label="Recruitment Subject" value={profile.recruitmentSubject} />
        </div>
      </ColorSection>

      <ColorSection title="Current Appointment Details" color="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldCell label="Date of Current Appointment" value={profile.caDate} />
          <FieldCell label="Current Letter No" value={profile.caLetter} />
          <FieldCell label="Current Service" value={profile.caService} />
          <FieldCell label="Current Rank" value={profile.caRank} />
          <FieldCell label="Current Position" value={profile.caPosition} />
          <FieldCell label="Current Workplace" value={profile.caWorkplace} span={2} />
        </div>
      </ColorSection>
    </div>
  );
}

function ServiceTab() {
  return (
    <ColorSection title="Service Details" color="indigo">
      <div className="text-center py-8 text-gray-500">
        No active service parameters configured.
      </div>
    </ColorSection>
  );
}

function WopTab() {
  return (
    <ColorSection title="Pension and Payment (W&OP)" color="rose">
      <div className="text-center py-8 text-gray-500">
        Pension schema and payments details are not registered yet.
      </div>
    </ColorSection>
  );
}

function FamilyTab() {
  return (
    <ColorSection title="Family Dependencies" color="slate">
      <ProfileDataTable
        headers={["Name", "Relationship", "Date of Birth", "NIC No", "W&OP No"]}
        rows={[]}
        placeholder="No family dependents registered."
      />
    </ColorSection>
  );
}

function EditRequestTab() {
  return (
    <ColorSection title="Profile Edit Requests" color="amber">
      <ProfileDataTable
        headers={["Request ID", "Field Changed", "New Value", "Date Requested", "Status"]}
        rows={[]}
        placeholder="No edit requests pending."
      />
    </ColorSection>
  );
}
