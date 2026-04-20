import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiDocumentText,
  HiPencilAlt,
  HiCheckCircle,
  HiExclamation,
  HiPlus,
} from "react-icons/hi";
import api from "@/api/axios";
import { Badge, Spinner } from "flowbite-react";
import TeacherUpdateModal from "@/components/teacher/TeacherUpdateModal";
/**
 * Teacher Profile (Finalized Style)
 * - Professional, colorful, compact (less “cardy”), rounded corners everywhere
 * - Keeps ALL information sections (General / Qualification / Employment / W&OP / Family / Edit Request)
 * - Ready for API integration later (just replace the dummy state + uncomment fetch section)
 */
const TeacherProfile = () => {
  const { id } = useParams();

  // Tabs (left menu)
  const tabs = [
    { id: "general", label: "General" },
    { id: "qualification", label: "Qualification" },
    { id: "employment", label: "Employment" },
    { id: "wop", label: "W&OP and Payment" },
    { id: "family", label: "Family" },
    { id: "edit", label: "Edit Request" },
  ];

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);

  /**
   * Dummy data (replace with API later)
   * Keep the shape (objects/arrays) so API mapping is easy.
   */
  // const dummy = useMemo(() => {
  //   return {};
  // }, [id]);

  // State objects (easy to replace with API response later)
  const [teacher, setTeacher] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [employment, setEmployment] = useState({});
  const [wopAndPayment, setWopAndPayment] = useState({});
  const [family, setFamily] = useState({ spouses: [] });
  const [editRequests, setEditRequests] = useState([]);
  const [modalSection, setModalSection] = useState(null);

  /**
   * API Integration Hook (later)
   * - When you get API for teacher profile, replace state with response.
   * - Keep this structure for easy mapping.
   */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/teacher/${id}`)
      .then((res) => {
        if (res.data?.status !== "success") return;
        const d = res.data.data;

        /* ---------------------------
                   GENERAL
                --------------------------- */
        setTeacher({
          id: d.people_id,
          fullName: d.full_name,
          initialsName: d.name_with_initials,
          nic: d.nic,
          employeeId: d.people_id,
          wopNo: d.appointment?.w_op_no,
          paySheetNo: d.appointment?.pay_sheet_no,
          service: d.appointment?.service_id,
          status: d.appointment?.is_confirmed ? "Confirmed" : "Not Confirmed",
          verified: !!d.appointment?.is_verified,

          dob: d.date_of_birth,
          gender: d.gender?.gender_name,
          religion: d.religion?.religion_name,
          ethnicity: d.ethnicity?.ethnicity_name,
          civilStatus: d.civil_status?.civil_status_name,

          bloodGroup: d.blood_group?.blood_group,
          overallCondition: d.health_condition ? "Good" : "Issue",
          knownProblems: d.health_problem,

          email: d.email,
          phone: d.phone,

          district: d.district?.district_name,
          gnDivision: d.gn_division?.gn_division_name,
          permanentAddress: [d.address_line1, d.address_line2, d.address_line3]
            .filter(Boolean)
            .join("\n"),

          latitude: d.latitude,
          longitude: d.longitude,
          tempAddress: [d.t_address_line1, d.t_address_line2, d.t_address_line3]
            .filter(Boolean)
            .join("\n"),
        });

        /* ---------------------------
                   EMPLOYMENT
                --------------------------- */
        setEmployment({
          appointmentCurrentStatus: {
            service: d.current_appointment?.service_id,
            currentServiceRank: d.current_appointment?.rank_id,
            appointmentDate: d.current_appointment?.appoint_date,
            positionDesignation: d.current_appointment?.position_id,
            workplaceNameAddress: d.current_appointment?.workplace?.institution
              ? `[${d.current_appointment.workplace.institution.census_no}] ${d.current_appointment.workplace.institution.name}\n${d.current_appointment.workplace.institution.address}`
              : "",
          },
          myAppointment: {
            service: d.appointment?.service_id,
            serviceRank: d.appointment?.rank_id,
            appointmentDate: d.appointment?.first_appointment_date,
            appointmentNumber: d.appointment?.appointment_letter_no,
            positionDesignation: d.appointment?.position_id,
          },
          teachingInfo: {
            teacherCategory: d.teacher?.teacher_category,
            teacherAppointmentType: d.teacher?.teacher_type,
            medium: d.teacher?.appointment_medium,
            appointmentSubject: d.teacher?.appointment_subject?.name_en,
            mainTeachingSubject: d.teacher?.main_subject?.name_en,
            secondarySubjectOptional: d.teacher?.secondary_subject?.name_en,
            currentTeachingSubjectAssignedBySchool:
              d.teacher?.current_teaching_subject?.name_en,
          },
          previousService: [],
          previousServiceRelatedInfo: [],
          previousWorkingPlace: [],
        });

        /* ---------------------------
                   W&OP
                --------------------------- */
        setWopAndPayment({
          wopNo: d.appointment?.w_op_no,
          paySheetNo: d.appointment?.pay_sheet_no,
        });

        setQualifications([]);
        setFamily({ spouses: [] });
        setEditRequests([]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 m-6">
        <Spinner size="xl" color="info" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 animate-pulse">
          Loading teacher profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back link (top) */}
      <div className="pt-1">
        <NavLink
          to="/employees/teacher"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to Teacher List
        </NavLink>
      </div>

      {/* Header strip (finalized style) */}
      <HeaderStrip teacher={teacher} />

      {/* Verify alert strip */}
      {!teacher.verified && <VerifyStrip onVerify={() => {}} />}

      {/* Layout: Left menu + Right content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left menu */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="text-sm font-semibold text-gray-800">
                Teacher Profile
              </div>
              <div className="text-xs text-gray-500">
                Manage teacher profile and settings
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
                        : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50",
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
            <GeneralTab teacher={teacher} onEdit={setModalSection} />
          )}
          {activeTab === "qualification" && (
            <QualificationTab qualifications={qualifications} />
          )}
          {activeTab === "employment" && (
            <EmploymentTab employment={employment} />
          )}
          {activeTab === "wop" && <WopTab wopAndPayment={wopAndPayment} />}
          {activeTab === "family" && <FamilyTab family={family} />}
          {activeTab === "edit" && (
            <EditRequestTab editRequests={editRequests} />
          )}
        </section>
      </div>

      <TeacherUpdateModal
        isOpen={modalSection !== null}
        section={modalSection}
        teacherId={teacher?.id}
        onClose={() => setModalSection(null)}
        onSaved={() => window.location.reload()}
      />
    </div>
  );
};

export default TeacherProfile;

/* =========================================================
   Header strip (premium blue style)
========================================================= */

function HeaderStrip({ teacher }) {
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
                  {teacher.fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    color={
                      teacher.status === "Confirmed" ? "success" : "warning"
                    }
                    className="px-4 py-1 font-bold rounded-full text-xs"
                  >
                    {teacher.status}
                  </Badge>

                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                      {teacher.service}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span>NIC</span>
                    <span className="font-mono font-black text-gray-900 dark:text-white">
                      {teacher.nic}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE: Key values (Grid) */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniKey label="Employee ID" value={teacher.employeeId} />
            <MiniKey label="W&OP No" value={teacher.wopNo} />
            <MiniKey label="Pay Sheet No" value={teacher.paySheetNo} />
          </div>

          {/* RIGHT: Actions */}
          <div className="flex flex-col sm:flex-row xl:flex-col gap-3 min-w-[200px]">
            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
              <HiPencilAlt className="h-4 w-4 text-blue-600" />
              Send Edit Request
            </button>

            <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none">
              <HiDocumentText className="h-4 w-4" />
              Get Document
            </button>
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
   Verify strip (premium styling)
========================================================= */

function VerifyStrip({ onVerify }) {
  return (
    <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 shadow-sm overflow-hidden">
      <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Icon + text */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40 shrink-0 shadow-inner">
            <HiExclamation className="h-5 w-5 text-amber-600" />
          </div>

          <div className="min-w-0 italic">
            <div className="text-sm font-black text-amber-900 dark:text-amber-200">
              Profile Verification Required
            </div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400/80">
              Ensure all details are accurate before proceeding with
              administration.
            </div>
          </div>
        </div>

        {/* Right: Action */}
        <button
          onClick={onVerify}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-orange-500 to-amber-600 px-6 py-2 text-sm font-black text-white hover:from-orange-600 hover:to-amber-700 transition-all shadow-md shadow-orange-100 dark:shadow-none"
        >
          <HiCheckCircle className="h-4 w-4" />
          Verify Now
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   Reusable blocks: Color Section + Field grid
   (Blue Theme defaults)
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
        className={`px-6 py-4 text-white ${headerClass} bg-linear-to-r from-[rgba(255,255,255,0.05)] to-transparent`}
      >
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

function RoundedActionButton({ icon, children, onClick, variant = "outline" }) {
  const base =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition-all duration-200 shadow-sm";
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
      : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-800";

  const Icon = icon;
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {Icon ? <Icon className="h-4 w-4 text-blue-500" /> : null}
      {children}
    </button>
  );
}

/* =========================================================
   TAB: General (ALL details kept)
========================================================= */

function GeneralTab({ teacher, onEdit }) {
  return (
    <div className="space-y-5">
      <ColorSection
        title="Personal & Cultural"
        color="slate"
        right={
          <RoundedActionButton
            onClick={() => onEdit("personal")}
            variant="outline"
          >
            Edit
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Full Name" value={teacher.fullName} />
          <FieldCell label="Initials" value={teacher.initialsName} />
          <FieldCell label="Date of Birth" value={teacher.dob} />
          <FieldCell label="Gender" value={teacher.gender} />
          <FieldCell label="Religion" value={teacher.religion} />
          <FieldCell label="Ethnicity" value={teacher.ethnicity} />
          <FieldCell label="Civil Status" value={teacher.civilStatus} />
        </div>
      </ColorSection>

      <ColorSection
        title="Health Information"
        color="teal"
        right={
          <RoundedActionButton
            onClick={() => onEdit("health")}
            variant="outline"
          >
            Edit
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border px-4 py-3 bg-rose-50">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
              Blood Group
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-rose-700">
              {teacher.bloodGroup || "—"}
            </div>
          </div>
          <FieldCell
            label="Overall Condition"
            value={teacher.overallCondition}
          />
          <FieldCell label="Known Problems" value={teacher.knownProblems} />
        </div>
      </ColorSection>

      <ColorSection
        title="Contact & Location"
        color="indigo"
        right={
          <RoundedActionButton
            onClick={() => onEdit("contact")}
            variant="outline"
          >
            Edit
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Email" value={teacher.email} />
          <FieldCell label="Phone" value={teacher.phone} />

          <FieldCell label="District" value={teacher.district} />
          <FieldCell label="GN Division" value={teacher.gnDivision} />

          <div className="md:col-span-2">
            <FieldCell
              label="Permanent Address"
              value={teacher.permanentAddress}
            />
          </div>

          <FieldCell label="Latitude" value={teacher.latitude} />
          <FieldCell label="Longitude" value={teacher.longitude} />
        </div>
      </ColorSection>

      <ColorSection
        title="Temporary Location"
        color="blue"
        right={
          <RoundedActionButton
            onClick={() => onEdit("temporary")}
            variant="outline"
          >
            Edit
          </RoundedActionButton>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl border px-4 py-3 bg-white">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Residential Address
            </div>
            <div className="mt-0.5 text-sm font-extrabold text-gray-900 whitespace-pre-line">
              {teacher.tempAddress || "—"}
            </div>
          </div>
        </div>
      </ColorSection>
    </div>
  );
}

/* =========================================================
   TAB: Qualification (table kept, ready for API)
========================================================= */

function QualificationTab({ qualifications }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">
          Educational qualification
        </h2>
        <RoundedActionButton icon={HiPlus} onClick={() => {}} variant="outline">
          Add qualification
        </RoundedActionButton>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Degree / Certificate</th>
                <th className="px-5 py-4">Institution</th>
                <th className="px-5 py-4">Date of Completion</th>
                <th className="px-5 py-4">Grade</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {qualifications?.length ? (
                qualifications.map((q) => (
                  <tr key={q.id}>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {q.degree}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{q.institution}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {q.completionDate}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{q.grade}</td>
                    <td className="px-5 py-4">
                      <button className="rounded-full border px-4 py-2 text-xs font-extrabold hover:bg-gray-50">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-6 text-gray-600" colSpan={5}>
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB: Employment (ALL sections kept)
========================================================= */

function EmploymentTab({ employment }) {
  const ecs = employment?.appointmentCurrentStatus || {};
  const ma = employment?.myAppointment || {};
  const ti = employment?.teachingInfo || {};
  const prevService = employment?.previousService || [];
  const prevServiceInfo = employment?.previousServiceRelatedInfo || [];
  const prevWork = employment?.previousWorkingPlace || [];

  return (
    <div className="space-y-5">
      <ColorSection
        title="Appointment current status"
        color="slate"
        right={
          <RoundedActionButton onClick={() => {}} variant="outline">
            Edit
          </RoundedActionButton>
        }
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-gray-600" />
            {ecs.ageTag || "—"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Service" value={ecs.service} />
          <FieldCell
            label="Current Service Rank"
            value={ecs.currentServiceRank}
          />
          <FieldCell label="Appointment Date" value={ecs.appointmentDate} />
          <FieldCell
            label="Appointment/Transfer Letter No"
            value={ecs.transferLetterNo}
          />
          <FieldCell
            label="Position / Designation"
            value={ecs.positionDesignation}
          />
          <FieldCell label="Last Updated" value={ecs.lastUpdated} />
          <div className="md:col-span-2">
            <FieldCell
              label="Workplace name and address"
              value={ecs.workplaceNameAddress}
            />
          </div>
        </div>
      </ColorSection>

      <ColorSection
        title="My Appointment"
        color="indigo"
        right={
          <RoundedActionButton onClick={() => {}} variant="outline">
            Edit
          </RoundedActionButton>
        }
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-gray-600" />
            {ma.ageTag || "—"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Service" value={ma.service} />
          <FieldCell label="Service Rank" value={ma.serviceRank} />
          <FieldCell label="Appointment Date" value={ma.appointmentDate} />
          <FieldCell label="Appointment Number" value={ma.appointmentNumber} />
          <FieldCell
            label="Position / Designation"
            value={ma.positionDesignation}
          />
          <FieldCell label="Created" value={ma.created} />
          <div className="md:col-span-2">
            <FieldCell
              label="Workplace name and address"
              value={ma.workplaceNameAddress}
            />
          </div>
        </div>
      </ColorSection>

      <ColorSection
        title="Teaching Info"
        color="teal"
        right={
          <RoundedActionButton onClick={() => {}} variant="outline">
            Edit
          </RoundedActionButton>
        }
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-extrabold text-gray-600">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-teal-700" />
            {ti.serviceTag || "—"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="Teacher Catogary" value={ti.teacherCategory} />
          <FieldCell
            label="Teacher Appointment Type"
            value={ti.teacherAppointmentType}
          />
          <FieldCell label="Medium" value={ti.medium} />
          <FieldCell
            label="Appointment Subject"
            value={ti.appointmentSubject}
          />
          <FieldCell
            label="Main Teaching Subject"
            value={ti.mainTeachingSubject}
          />
          <FieldCell
            label="Secondary Subject (Optional)"
            value={ti.secondarySubjectOptional}
          />
          <div className="md:col-span-2">
            <FieldCell
              label="Current Teaching Subject (Assigned by school)"
              value={ti.currentTeachingSubjectAssignedBySchool}
            />
          </div>
        </div>
      </ColorSection>

      {/* Previous Service */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">
          Previous Service
        </h2>
        <RoundedActionButton icon={HiPlus} onClick={() => {}} variant="outline">
          Previous services
        </RoundedActionButton>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Service</th>
                <th className="px-5 py-4">Grade/Rank</th>
                <th className="px-5 py-4">Appointment Date</th>
                <th className="px-5 py-4">Retainment Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {prevService?.length ? (
                prevService.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {row.service}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.gradeRank}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.appointmentDate}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.retainmentDate}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                        ✓ {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="rounded-full border px-3 py-2 text-xs font-extrabold hover:bg-gray-50">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-6 text-gray-600" colSpan={6}>
                    No previous service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Previous Service-related information */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">
          Previous Service-related information
        </h2>
        <RoundedActionButton icon={HiPlus} onClick={() => {}} variant="outline">
          Previous Record
        </RoundedActionButton>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Position</th>
                <th className="px-5 py-4">Service</th>
                <th className="px-5 py-4">Grade/Rank</th>
                <th className="px-5 py-4">Start Date</th>
                <th className="px-5 py-4">End Date</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {prevServiceInfo?.length ? (
                prevServiceInfo.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {row.position}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{row.service}</td>
                    <td className="px-5 py-4 text-gray-700">{row.gradeRank}</td>
                    <td className="px-5 py-4 text-gray-700">{row.startDate}</td>
                    <td className="px-5 py-4 text-gray-700">{row.endDate}</td>
                    <td className="px-5 py-4">
                      <button className="rounded-full border px-3 py-2 text-xs font-extrabold hover:bg-gray-50">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-6 text-gray-600" colSpan={6}>
                    No previous service records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Previous working place */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">
          Previous working place
        </h2>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Working Place & Address</th>
                <th className="px-5 py-4">Appointed Date</th>
                <th className="px-5 py-4">Release Date</th>
                <th className="px-5 py-4">Service Period</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {prevWork?.length ? (
                prevWork.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold text-gray-900 whitespace-pre-line">
                      {row.workingPlaceAddress}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.appointedDate}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.releaseDate}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {row.servicePeriod}
                    </td>
                    <td className="px-5 py-4">
                      <button className="rounded-full border px-3 py-2 text-xs font-extrabold hover:bg-gray-50">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-6 text-gray-600" colSpan={5}>
                    No previous working place records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB: W&OP & Payment
========================================================= */

function WopTab({ wopAndPayment }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">
          W&OP & Payment Details
        </h2>
        <RoundedActionButton onClick={() => {}} variant="outline">
          Edit
        </RoundedActionButton>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="W&OP No" value={wopAndPayment?.wopNo} />
          <FieldCell label="Pay Sheet No" value={wopAndPayment?.paySheetNo} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB: Family (Spouse list table)
========================================================= */

function FamilyTab({ family }) {
  const spouses = family?.spouses || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Spouse List</h2>
        <RoundedActionButton onClick={() => {}} variant="outline">
          Add spouse
        </RoundedActionButton>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr className="text-xs font-extrabold uppercase tracking-wide text-gray-600">
                <th className="px-5 py-4">Spouse Names</th>
                <th className="px-5 py-4">Date of Birth</th>
                <th className="px-5 py-4">Married Date</th>
                <th className="px-5 py-4">Married CF No.</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {spouses?.length ? (
                spouses.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {s.spouseName}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{s.dob}</td>
                    <td className="px-5 py-4 text-gray-700">{s.marriedDate}</td>
                    <td className="px-5 py-4 text-gray-700">{s.marriedCfNo}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800">
                        {s.status || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="rounded-full border px-3 py-2 text-xs font-extrabold hover:bg-gray-50">
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-5 py-10 text-center text-gray-600"
                    colSpan={6}
                  >
                    No spouses have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TAB: Edit Request
========================================================= */

function EditRequestTab({ editRequests }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900">Edit Requests</h2>
      </div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <div className="p-6 text-sm text-gray-700">
          {editRequests?.length ? (
            <ul className="space-y-3">
              {editRequests.map((r) => (
                <li key={r.id} className="rounded-2xl border px-4 py-3">
                  <div className="font-extrabold text-gray-900">{r.title}</div>
                  <div className="text-gray-600">{r.note}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600">No edit requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
