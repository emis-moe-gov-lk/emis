import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiDocumentText, HiPlus } from "react-icons/hi";
import { Badge, Spinner } from "flowbite-react";
import { getDosAdmin } from "@/api/deoOfficerService";
import ProfileDataTable from "@/components/common/ProfileDataTable";
import BackToListButton from "@/components/UiComponents/BackToListButton";

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

export default function DosAdminProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDosAdmin(id);
        if (res.status === "success") setAdmin(res.data);
      } catch {
        // handled by null check below
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const tabs = [
    { id: "general", label: "General" },
    { id: "qualification", label: "Qualification" },
    { id: "employment", label: "Employment" },
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
                Zonal admin
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Zonal Administration profile
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
          {activeTab === "service" && <ServiceTab />}
          {activeTab === "wop" && <WopTab />}
          {activeTab === "family" && <FamilyTab />}
          {activeTab === "edit" && <EditRequestTab />}
        </section>
      </div>
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
                  <Badge
                    color="indigo"
                    className="px-4 py-1 font-bold rounded-full text-xs"
                  >
                    {profile.position}
                  </Badge>
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
            <Can permission={PermissionGroups.ZONAL.BULK_UPLOAD}>
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

function GeneralTab({ profile }) {
  return (
    <div className="space-y-5">
      <ColorSection title="Personal & Cultural" color="slate">
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

      <ColorSection title="Health Information" color="teal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <FieldCell label="Blood Group" value={profile.bloodGroup} />
          <FieldCell label="Health Condition" value={profile.healthCondition} />
          <FieldCell label="Known Problems" value={profile.healthProblem} />
        </div>
      </ColorSection>

      <ColorSection title="Contact & Location" color="indigo">
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

function QualificationTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Educational Qualification
        </h2>
        <Can permission={PermissionGroups.ZONAL.ADMIN_QUALIFICATIONS}>
          <RoundedActionButton icon={HiPlus} onClick={() => {}}>
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
        rows={[]}
        emptyMessage="No qualification records found."
        renderRow={(q) => (
          <tr key={q.id}>
            <td className={tablePrimaryCellClass}>{q.degree}</td>
            <td className={tableCellClass}>{q.institution}</td>
            <td className={tableCellClass}>{q.completionDate}</td>
            <td className={tableCellClass}>{q.grade}</td>
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
   TAB: Employment
========================================================= */

function EmploymentTab({ profile }) {
  return (
    <div className="space-y-5">
      <ColorSection title="Current Appointment" color="slate">
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

      <ColorSection title="First Appointment" color="indigo">
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
        <Can permission={PermissionGroups.ZONAL.ADMIN_SERVICES}>
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

function WopTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          W&OP & Payment Details
        </h2>
        <Can permission={PermissionGroups.ZONAL.ADMIN_WOP}>
          <RoundedActionButton onClick={() => {}}>Edit</RoundedActionButton>
        </Can>
      </div>

      <div className="rounded-2xl overflow-hidden border surface">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldCell label="W&OP No" value={null} />
          <FieldCell label="Pay Sheet No" value={null} />
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
        <Can permission={PermissionGroups.ZONAL.ADMIN_FAMILY}>
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
