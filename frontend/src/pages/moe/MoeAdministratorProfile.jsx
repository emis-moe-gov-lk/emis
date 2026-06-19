import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiDocumentText, HiPlus } from "react-icons/hi";
import { Badge, Spinner } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";
import {
  addMoeAdministratorPastService,
  addMoeAdministratorServiceHistoryEntry,
  getMoeAdministratorById,
} from "@/api/moeAdministratorService";
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
import MoeAdministratorUpdateModal from "@/components/moe/MoeAdministratorUpdateModal";
import {
  saveEducationQualification,
  getEducationQualifications,
  getEducationQualificationGrades,
} from "@/api/teacherService";
import QualificationAchievementModal from "@/components/common/QualificationAchievementModal";

const DEFAULT_QUALIFICATION_FORM = {
  qualification: "Honours Bachelors",
  institution: "",
  effectiveDate: "",
  grade: "",
  additionalDetails: "",
};

const formatDate = (value) => {
  if (!value) return null;
  return String(value).slice(0, 10);
};

const tablePrimaryCellClass =
  "px-5 py-4 font-semibold text-gray-900 dark:text-gray-100";
const tableCellClass = "px-5 py-4 text-gray-700 dark:text-gray-300";
const tableActionButtonClass =
  "rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-xs font-extrabold hover:bg-gray-50 dark:hover:bg-gray-800";

export default function MoeAdministratorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profileType = "moe";
  const profileTypeLabel = "MOE Administrator";
  const profileTypeDescription = "Ministry administration profile";

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [modalSection, setModalSection] = useState(null);

  const [serviceHistory, setServiceHistory] = useState({ appointments: [], historyEntries: [], currentAppointment: null });
  const [isServiceHistoryModalOpen, setIsServiceHistoryModalOpen] = useState(false);
  const [serviceHistoryForm, setServiceHistoryForm] = useState(DEFAULT_SERVICE_HISTORY_FORM);
  const [isSavingServiceHistory, setIsSavingServiceHistory] = useState(false);
  const [isPastServiceModalOpen, setIsPastServiceModalOpen] = useState(false);
  const [pastServiceForm, setPastServiceForm] = useState(DEFAULT_PAST_SERVICE_FORM);
  const [isSavingPastService, setIsSavingPastService] = useState(false);

  const [qualifications, setQualifications] = useState([]);
  const [rawQualifications, setRawQualifications] = useState([]);
  const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
  const [qualificationForm, setQualificationForm] = useState(DEFAULT_QUALIFICATION_FORM);
  const [qualificationOptions, setQualificationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [isLoadingQualificationOptions, setIsLoadingQualificationOptions] = useState(false);
  const [isSavingQualification, setIsSavingQualification] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await getMoeAdministratorById(id);
      if (res.status === "success") {
        const d = res.data;
        setAdmin(d);
        setServiceHistory({
          appointments: d.my_appointments ?? [],
          historyEntries: d.appointment_history ?? [],
          currentAppointment: d.current_appointment ?? null,
        });
        const quals = d.educationQualifications || d.education_qualifications || [];
        setRawQualifications(quals);
      }
    } catch {
      // handled by null check below
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const loadQualificationOptions = async () => {
      setIsLoadingQualificationOptions(true);
      try {
        const [qualResponse, gradeResponse] = await Promise.all([
          getEducationQualifications(),
          getEducationQualificationGrades(),
        ]);

        if (qualResponse?.status === "success" && qualResponse?.data) {
          setQualificationOptions(qualResponse.data);
        }

        if (gradeResponse?.status === "success" && gradeResponse?.data) {
          setGradeOptions(gradeResponse.data);
        }
      } catch (error) {
        console.error("Failed to load qualification options:", error);
      } finally {
        setIsLoadingQualificationOptions(false);
      }
    };

    loadQualificationOptions();
  }, []);

  useEffect(() => {
    if (!rawQualifications.length) {
      setQualifications([]);
      return;
    }

    const mapped = rawQualifications.map((qual) => {
      const qualName =
        qualificationOptions.find(
          (q) => q.qualifications_id === qual.qualifications_id
        )?.qualification ||
        qual.qualification?.qualification ||
        qual.qualifications_id ||
        qual.degree ||
        "";

      const gradeName =
        gradeOptions.find((g) => g.grade_id === qual.grade)?.grade ||
        qual.qualification_grade?.grade ||
        qual.qualificationGrade?.grade ||
        qual.grade ||
        "";

      return {
        id: qual.id,
        degree: qualName,
        institution: qual.institution || qual.institution_university || "",
        completionDate: formatDate(qual.effective_date) || "",
        grade: gradeName,
      };
    });
    setQualifications(mapped);
  }, [rawQualifications, qualificationOptions, gradeOptions]);

  const openQualificationModal = useCallback(() => {
    setQualificationForm(DEFAULT_QUALIFICATION_FORM);
    setIsQualificationModalOpen(true);
  }, []);

  const closeQualificationModal = useCallback(() => {
    setIsQualificationModalOpen(false);
    setQualificationForm(DEFAULT_QUALIFICATION_FORM);
  }, []);

  const handleEditQualification = useCallback((qualificationDisplay) => {
    const qualification = rawQualifications.find(q => q.id === qualificationDisplay.id);
    if (!qualification) {
      toast.error("Unable to load qualification data");
      return;
    }

    const qualName = qualificationOptions.find(
      (q) => q.qualifications_id === qualification.qualifications_id
    )?.qualification || qualification.degree || "";

    const gradeName = gradeOptions.find(
      (g) => g.grade_id === qualification.grade
    )?.grade || qualification.grade || "";

    setQualificationForm({
      id: qualification.id,
      qualification: qualName,
      institution: qualification.institution || qualification.institution_university || "",
      effectiveDate: formatDate(qualification.effective_date) || "",
      grade: gradeName,
      additionalDetails: qualification.description || qualification.additionalDetails || "",
    });
    setIsQualificationModalOpen(true);
  }, [rawQualifications, qualificationOptions, gradeOptions]);

  const handleQualificationFieldChange = useCallback((key, value) => {
    setQualificationForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleQualificationSave = useCallback(async () => {
    const qualification = String(qualificationForm.qualification || "").trim();
    const institution = String(qualificationForm.institution || "").trim();
    const effectiveDate = String(qualificationForm.effectiveDate || "").trim();
    const grade = String(qualificationForm.grade || "").trim();
    const additionalDetails = String(qualificationForm.additionalDetails || "").trim();

    if (!qualification || !institution || !effectiveDate || !grade) {
      toast.error("Please complete all required qualification fields.");
      return;
    }

    if (!admin?.people_id) {
      toast.error("Administrator ID not found.");
      return;
    }

    const selectedQualification = qualificationOptions.find(
      (q) => q.qualification === qualification
    );
    const qualificationId = selectedQualification?.qualifications_id;

    const selectedGrade = gradeOptions.find((g) => g.grade === grade);
    const gradeId = selectedGrade?.grade_id;

    if (!qualificationId) {
      toast.error("Invalid qualification selected.");
      return;
    }

    if (!gradeId) {
      toast.error("Invalid grade selected.");
      return;
    }

    setIsSavingQualification(true);
    try {
      const response = await saveEducationQualification(admin.people_id, {
        id: qualificationForm.id || undefined,
        qualification: qualificationId,
        institution_university: institution,
        effective_date: effectiveDate,
        grade_result: gradeId,
        additional_details: additionalDetails,
      });

      if (response?.status === "success") {
        const isUpdate = qualificationForm.id;
        toast.success(
          response?.message || (isUpdate ? "Qualification updated successfully." : "Qualification added successfully.")
        );
        closeQualificationModal();
        await loadProfile();
      } else {
        toast.error(response?.message || "Failed to save qualification.");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        "Failed to save qualification.";
      console.error("Save qualification error:", error);
      toast.error(errorMessage);
    } finally {
      setIsSavingQualification(false);
    }
  }, [qualificationForm, admin?.people_id, qualificationOptions, gradeOptions, closeQualificationModal, loadProfile]);

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
      const officeLevelId = isSchoolBasedService(serviceName)
        ? "OLID006"
        : profileType === "moe"
          ? "OLID001"
          : "OLID004";
      const res = await addMoeAdministratorPastService(id, { ...pastServiceForm, office_level_id: officeLevelId });
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
      const officeLevelId = profileType === "moe" ? "OLID001" : "OLID004";

      const payload = {
        ...serviceHistoryForm,
        service_id: selectedAppt?.service_id ?? serviceHistoryForm.service_id,
        office_level_id: isOfficeBased ? officeLevelId : "OLID006",
      };

      const res = await addMoeAdministratorServiceHistoryEntry(id, payload);
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
    wopNo: fa?.w_op_no,
    paySheetNo: fa?.pay_sheet_no,
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
                {profileTypeLabel}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {profileTypeDescription}
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
          {activeTab === "general" && (
            <GeneralTab profile={profile} onEdit={setModalSection} />
          )}
          {activeTab === "qualification" && (
            <QualificationTab
              qualifications={qualifications}
              onAddQualification={openQualificationModal}
              onEditQualification={handleEditQualification}
            />
          )}
          {activeTab === "employment" && (
            <EmploymentTab profile={profile} onEdit={setModalSection} />
          )}
          {activeTab === "service_history" && (
            <ServiceHistoryTab
              serviceHistory={serviceHistory}
              onAddPosting={openServiceHistoryModal}
              onAddPastService={openPastServiceModal}
            />
          )}
          {activeTab === "service" && <ServiceTab />}
          {activeTab === "wop" && (
            <WopTab profile={profile} onEdit={setModalSection} />
          )}
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

      <MoeAdministratorUpdateModal
        isOpen={modalSection !== null}
        section={modalSection}
        adminId={admin?.people_id}
        onClose={() => setModalSection(null)}
        onSaved={loadProfile}
      />

      <QualificationAchievementModal
        isOpen={isQualificationModalOpen}
        form={qualificationForm}
        qualificationOptions={qualificationOptions}
        gradeOptions={gradeOptions}
        onChange={handleQualificationFieldChange}
        onClose={closeQualificationModal}
        onSubmit={handleQualificationSave}
        isSubmitting={isSavingQualification}
        isLoadingOptions={isLoadingQualificationOptions}
      />
    </div>
  );
}

/* =========================================================
   Header Strip
========================================================= */

function HeaderStrip({ profile }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-blue-100 dark:border-blue-900/30 shadow-sm bg-white dark:bg-gray-800">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/5">
        <div className="p-6 flex flex-col xl:flex-row xl:items-center gap-6">
          {/* LEFT: Name + meta */}
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

          {/* MIDDLE: Key values */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={profile.employeeId} />
            <MiniKey label="Initials" value={profile.initialsName} />
          </div>

          {/* RIGHT: Actions */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
            <Can permission={PermissionGroups.MOE.ADMIN_BULK_UPLOAD}>
              <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none">
                <HiDocumentText className="h-4 w-4" />
                Get Document
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

function ColorSection({ title, color = "blue", right, children }) {
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
        className={`px-6 py-4 text-white ${headerClass} bg-linear-to-r from-[rgba(255,255,255,0.05)] to-transparent flex items-center justify-between`}
      >
        <h3 className="text-base font-black tracking-tight">{title}</h3>
        {right && <div>{right}</div>}
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

function RoundedActionButton({ icon: Icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
    >
      {Icon && <Icon className="h-4 w-4 text-blue-500" />}
      {children}
    </button>
  );
}

/* =========================================================
   TAB: General
========================================================= */

function GeneralTab({ profile, onEdit }) {
  return (
    <div className="space-y-5">
      <ColorSection
        title="Personal & Cultural"
        color="slate"
        right={
          <Can permission={PermissionGroups.MOE.ADMIN_CREATE}>
            <RoundedActionButton onClick={() => onEdit("personal")}>
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Full Name" value={profile.fullName} />
          <FieldCell label="Initials" value={profile.initialsName} />
          <FieldCell label="Date of Birth" value={profile.dob} />
          <FieldCell label="Gender" value={profile.gender} />
          <FieldCell label="Religion" value={profile.religion} />
          <FieldCell label="Ethnicity" value={profile.ethnicity} />
          <FieldCell label="Civil Status" value={profile.civilStatus} />
        </div>
      </ColorSection>

      <ColorSection
        title="Health Information"
        color="teal"
        right={
          <Can permission={PermissionGroups.MOE.ADMIN_CREATE}>
            <RoundedActionButton onClick={() => onEdit("health")}>
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FieldCell label="Blood Group" value={profile.bloodGroup} />
          <FieldCell label="Health Condition" value={profile.healthCondition} />
          <FieldCell label="Known Problems" value={profile.healthProblem} />
        </div>
      </ColorSection>

      <ColorSection
        title="Contact & Location"
        color="indigo"
        right={
          <Can permission={PermissionGroups.MOE.ADMIN_CREATE}>
            <RoundedActionButton onClick={() => onEdit("contact")}>
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Email" value={profile.email} />
          <FieldCell label="Phone" value={profile.phone} />
          <FieldCell label="District" value={profile.district} />
          <FieldCell label="GN Division" value={profile.gnDivision} />
          <FieldCell label="DS Office" value={profile.dsOffice} />
          <FieldCell label="Postal Code" value={profile.postalCode} />
          <div className="md:col-span-2">
            <FieldCell label="Permanent Address" value={profile.address} />
          </div>
        </div>
      </ColorSection>
    </div>
  );
}

/* =========================================================
   TAB: Qualification
========================================================= */

function QualificationTab({ qualifications, onAddQualification, onEditQualification }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Educational Qualification
        </h2>
        <Can permission={PermissionGroups.MOE.ADMIN_QUALIFICATIONS}>
          <RoundedActionButton icon={HiPlus} onClick={onAddQualification}>
            Add qualification
          </RoundedActionButton>
        </Can>
      </div>

      <ProfileDataTable
        columns={[
          { key: "degree", label: "Degree / Certificate" },
          { key: "institution", label: "Institution" },
          { key: "completionDate", label: "Date of Completion" },
          { key: "grade", label: "Grade" },
          { key: "action", label: "Action" },
        ]}
        rows={qualifications}
        emptyMessage="No qualification records found."
        renderRow={(q) => (
          <tr key={q.id}>
            <td className={tablePrimaryCellClass}>{q.degree}</td>
            <td className={tableCellClass}>{q.institution}</td>
            <td className={tableCellClass}>{q.completionDate}</td>
            <td className={tableCellClass}>{q.grade}</td>
            <td className="px-5 py-4">
              <button className={tableActionButtonClass} onClick={() => onEditQualification(q)}>Edit</button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* =========================================================
   TAB: Employment
========================================================= */

function EmploymentTab({ profile, onEdit }) {
  return (
    <div className="space-y-5">
      <ColorSection
        title="Current Appointment"
        color="slate"
        right={
          <Can permission={PermissionGroups.MOE.ADMIN_SERVICES}>
            <RoundedActionButton onClick={() => onEdit("current_appointment")}>
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Service" value={profile.caService} />
          <FieldCell label="Rank" value={profile.caRank} />
          <FieldCell label="Appointment Date" value={profile.caDate} />
          <FieldCell label="Appointment Letter No." value={profile.caLetter} />
          <FieldCell
            label="Position / Designation"
            value={profile.caPosition}
          />
          <FieldCell label="Workplace" value={profile.caWorkplace} />
        </div>
      </ColorSection>

      <ColorSection
        title="First Appointment"
        color="indigo"
        right={
          <Can permission={PermissionGroups.MOE.ADMIN_SERVICES}>
            <RoundedActionButton onClick={() => onEdit("my_appointment")}>
              Edit
            </RoundedActionButton>
          </Can>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Appointment Date" value={profile.faDate} />
          <FieldCell label="Appointment Letter No." value={profile.faLetter} />
          <FieldCell label="Retirement Date" value={profile.faRetirement} />
        </div>
      </ColorSection>

      <ColorSection title="Recruitment Details" color="teal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell
            label="Recruitment Category"
            value={profile.recruitmentCategory}
          />
          <FieldCell
            label="Recruitment Subject"
            value={profile.recruitmentSubject}
          />
        </div>
      </ColorSection>

      {/* Previous Service */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Previous Service
        </h2>
        <RoundedActionButton icon={HiPlus} onClick={() => {}}>
          Add previous service
        </RoundedActionButton>
      </div>

      <ProfileDataTable
        columns={[
          { key: "service", label: "Service" },
          { key: "gradeRank", label: "Grade / Rank" },
          { key: "appointmentDate", label: "Appointment Date" },
          { key: "retainmentDate", label: "Retainment Date" },
          { key: "status", label: "Status" },
          { key: "action", label: "Action" },
        ]}
        rows={[]}
        emptyMessage="No previous service records found."
        renderRow={(row) => (
          <tr key={row.id}>
            <td className={tablePrimaryCellClass}>{row.service}</td>
            <td className={tableCellClass}>{row.gradeRank}</td>
            <td className={tableCellClass}>{row.appointmentDate}</td>
            <td className={tableCellClass}>{row.retainmentDate}</td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                {row.status}
              </span>
            </td>
            <td className="px-5 py-4">
              <button className={tableActionButtonClass}>Edit</button>
            </td>
          </tr>
        )}
      />

      {/* Previous Working Place */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Previous Working Place
        </h2>
      </div>

      <ProfileDataTable
        columns={[
          { key: "workingPlaceAddress", label: "Working Place & Address" },
          { key: "appointedDate", label: "Appointed Date" },
          { key: "releaseDate", label: "Release Date" },
          { key: "servicePeriod", label: "Service Period" },
          { key: "action", label: "Action" },
        ]}
        rows={[]}
        emptyMessage="No previous working place records found."
        renderRow={(row) => (
          <tr key={row.id}>
            <td className={`${tablePrimaryCellClass} whitespace-pre-line`}>
              {row.workingPlaceAddress}
            </td>
            <td className={tableCellClass}>{row.appointedDate}</td>
            <td className={tableCellClass}>{row.releaseDate}</td>
            <td className={tableCellClass}>{row.servicePeriod}</td>
            <td className="px-5 py-4">
              <button className={tableActionButtonClass}>Edit</button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* =========================================================
   TAB: Service
========================================================= */

function ServiceTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Service Records
        </h2>
        <Can permission={PermissionGroups.MOE.ADMIN_SERVICES}>
          <RoundedActionButton icon={HiPlus} onClick={() => {}}>
            Add record
          </RoundedActionButton>
        </Can>
      </div>

      <ProfileDataTable
        columns={[
          { key: "service", label: "Service" },
          { key: "grade", label: "Grade / Rank" },
          { key: "effectiveDate", label: "Effective Date" },
          { key: "letterNo", label: "Letter No." },
          { key: "action", label: "Action" },
        ]}
        rows={[]}
        emptyMessage="No service records found."
        renderRow={(row) => (
          <tr key={row.id}>
            <td className={tablePrimaryCellClass}>{row.service}</td>
            <td className={tableCellClass}>{row.grade}</td>
            <td className={tableCellClass}>{row.effectiveDate}</td>
            <td className={tableCellClass}>{row.letterNo}</td>
            <td className="px-5 py-4">
              <button className={tableActionButtonClass}>Edit</button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* =========================================================
   TAB: W&OP and Payment
========================================================= */

function WopTab({ profile, onEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          W&OP & Payment Details
        </h2>
        <Can permission={PermissionGroups.MOE.ADMIN_WOP}>
          <RoundedActionButton onClick={() => onEdit("wop")} variant="outline">
            Edit
          </RoundedActionButton>
        </Can>
      </div>

      <div className="rounded-2xl overflow-hidden border surface">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="W&OP No" value={profile.wopNo} />
          <FieldCell label="Pay Sheet No" value={profile.paySheetNo} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB: Family
========================================================= */

function FamilyTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Spouse List
        </h2>
        <Can permission={PermissionGroups.MOE.ADMIN_FAMILY}>
          <RoundedActionButton icon={HiPlus} onClick={() => {}}>
            Add spouse
          </RoundedActionButton>
        </Can>
      </div>

      <ProfileDataTable
        columns={[
          { key: "spouseName", label: "Spouse Name" },
          { key: "dob", label: "Date of Birth" },
          { key: "marriedDate", label: "Married Date" },
          { key: "marriedCfNo", label: "Married CF No." },
          { key: "status", label: "Status" },
          { key: "action", label: "Action" },
        ]}
        rows={[]}
        emptyMessage="No spouses have been added yet."
        emptyCellClassName="px-5 py-10 text-center text-gray-600 dark:text-gray-400"
        renderRow={(s) => (
          <tr key={s.id}>
            <td className={tablePrimaryCellClass}>{s.spouseName}</td>
            <td className={tableCellClass}>{s.dob}</td>
            <td className={tableCellClass}>{s.marriedDate}</td>
            <td className={tableCellClass}>{s.marriedCfNo}</td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                {s.status || "—"}
              </span>
            </td>
            <td className="px-5 py-4">
              <button className={tableActionButtonClass}>Edit</button>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

/* =========================================================
   TAB: Edit Request
========================================================= */

function EditRequestTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Edit Requests
        </h2>
      </div>

      <div className="rounded-2xl overflow-hidden border surface">
        <div className="p-6 text-sm text-gray-600 dark:text-gray-400">
          No edit requests found.
        </div>
      </div>
    </div>
  );
}
