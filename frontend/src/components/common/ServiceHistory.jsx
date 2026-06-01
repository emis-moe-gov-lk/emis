import { useState, useEffect } from "react";
import { HiPlus } from "react-icons/hi";
import api from "@/api/axios";
import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import DarkSafeModal, {
  darkSafeInputClass,
  darkSafeButtonClasses,
  darkSafeTextareaClass,
} from "@/components/common/DarkSafeModal";
import UIButton from "@/components/UiComponents/Button";

export const DEFAULT_PAST_SERVICE_FORM = {
  service_id: "",
  rank_id: "",
  position_id: "",
  office_level_id: "OLID006",
  zone: "",
  inst_category: "",
  workplace_id: "",
  first_appointment_date: "",
  appointment_letter_no: "",
};

export const DEFAULT_SERVICE_HISTORY_FORM = {
  appointment_id: "",
  appoint_date: "",
  end_date: "",
  service_id: "",
  rank_id: "",
  position_id: "",
  office_level_id: "OLID006",
  zone: "",
  inst_category: "",
  workplace_id: "",
  updated_type: "2",
  appointment_letter_no: "",
  remarks: "",
};

export const SERVICE_HISTORY_CHANGE_TYPES = [
  { value: "0", label: "Position Change" },
  { value: "1", label: "Rank Change / Promotion" },
  { value: "2", label: "Transfer" },
  { value: "3", label: "Retirement" },
  { value: "4", label: "Other" },
];

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

export function ServiceHistoryTab({ serviceHistory, onAddPosting, onAddPastService }) {
  const { appointments = [], historyEntries = [], currentAppointment } = serviceHistory;

  const changeTypeLabel = (type) => {
    const found = SERVICE_HISTORY_CHANGE_TYPES.find((t) => t.value === String(type));
    return found?.label ?? "—";
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const da = new Date(a.first_appointment_date ?? 0);
    const db = new Date(b.first_appointment_date ?? 0);
    return da - db;
  });

  const entriesForAppointment = (appointmentId) =>
    historyEntries
      .filter((e) => e.appointment_id === appointmentId)
      .sort((a, b) => new Date(b.appoint_date ?? 0) - new Date(a.appoint_date ?? 0));

  const institutionName = (entry) =>
    entry?.workplace?.institution?.name ?? entry?.workplace_id ?? "—";

  const formatPeriod = (start, end) => {
    const s = start ? String(start).slice(0, 10) : null;
    const e = end ? String(end).slice(0, 10) : null;
    if (!s) return "—";
    return e ? `${s} — ${e}` : `${s} — Present`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
          Service History
        </h2>
        {onAddPastService && (
          <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
            <RoundedActionButton icon={HiPlus} onClick={onAddPastService} variant="outline">
              Add Past Service
            </RoundedActionButton>
          </Can>
        )}
      </div>

      {sortedAppointments.length === 0 && (
        <div className="rounded-2xl border surface p-6 text-sm text-gray-500 dark:text-gray-400">
          No service records found.
        </div>
      )}

      {sortedAppointments.map((appt) => {
        const isActive = appt.active_status === 1;
        const serviceName = appt.service?.service_name ?? appt.service_id ?? "—";
        const historyRows = entriesForAppointment(appt.appointment_id);

        return (
          <div
            key={appt.appointment_id}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Service block header */}
            <div className={[
              "flex items-center justify-between px-5 py-3",
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40"
                : "bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700",
            ].join(" ")}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  {serviceName}
                </span>
                <span className={[
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
                ].join(" ")}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Since {String(appt.first_appointment_date ?? "—").slice(0, 10)}
                </span>
                <Can permission={PermissionGroups.SCHOOLS.PROFILE_EDIT}>
                  <RoundedActionButton icon={HiPlus} onClick={() => onAddPosting(appt.appointment_id)} variant="outline">
                    Add Posting
                  </RoundedActionButton>
                </Can>
              </div>
            </div>

            {/* Postings within this service */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {/* Current posting — only for active appointment */}
              {isActive && currentAppointment && (
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {institutionName(currentAppointment)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-bold text-green-700 dark:text-green-400">
                        Current
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{currentAppointment.rank?.name ?? currentAppointment.rank?.rank_name ?? currentAppointment.rank_id ?? "—"}</span>
                      <span>{currentAppointment.position?.position_name ?? currentAppointment.position_id ?? "—"}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatPeriod(currentAppointment.appoint_date, null)}
                  </div>
                </div>
              )}

              {/* Historical postings */}
              {historyRows.map((entry) => (
                <div key={entry.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {institutionName(entry)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{entry.rank?.name ?? entry.rank?.rank_name ?? entry.rank_id ?? "—"}</span>
                      <span>{entry.position?.position_name ?? entry.position_id ?? "—"}</span>
                      <span className="text-gray-400 dark:text-gray-500">{changeTypeLabel(entry.updated_type)}</span>
                      {entry.appointment_letter_no && (
                        <span className="font-mono text-gray-400 dark:text-gray-500">
                          {entry.appointment_letter_no}
                        </span>
                      )}
                    </div>
                    {entry.remarks && (
                      <div className="mt-1 text-xs italic text-gray-400 dark:text-gray-500">
                        {entry.remarks}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatPeriod(entry.appoint_date, entry.end_date)}
                  </div>
                </div>
              ))}

              {/* First appointment anchor */}
              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-2 bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {appt.workplace?.institution?.name ?? appt.workplace_id ?? "—"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      First Appointment
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>{appt.rank?.name ?? appt.rank?.rank_name ?? appt.rank_id ?? "—"}</span>
                    <span>{appt.position?.position_name ?? appt.position_id ?? "—"}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {String(appt.first_appointment_date ?? "—").slice(0, 10)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Returns true for SLTS / SLPS (school-based), false for SLTAS / SLTES / SLEAS (office-based)
export function isSchoolBasedService(serviceName) {
  return /teachers\s+service|principals\s+service|slts|slps/i.test(serviceName ?? "");
}

export function ServiceHistoryModal({
  isOpen,
  form,
  appointments = [],
  onChange,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({ services: [], ranks: [], positions: [], zones: [], instCategories: [], institutions: [] });
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [zeoOffices, setZeoOffices] = useState([]);
  const [loadingZeos, setLoadingZeos] = useState(false);

  // Derive which appointment is selected (fall back to first when only one)
  const selectedAppointment =
    appointments.find((a) => a.appointment_id === form.appointment_id) ?? appointments[0];
  const selectedServiceName = selectedAppointment?.service?.service_name ?? "";
  const schoolBased = isSchoolBasedService(selectedServiceName);

  // Load school-based form data (zones / categories / institutions)
  useEffect(() => {
    if (!isOpen || !schoolBased) return;
    setLoadingFormData(true);
    api.get("/register/appointment-form-data", {
      params: { service: form.service_id || "", ins_cat: form.inst_category || "", zone: form.zone || "", office_level: "OLID006" },
    })
      .then((res) => {
        const d = res.data;
        setFormData({
          services: d.service ?? [],
          ranks: d.serviceRanks ?? [],
          positions: d.positions ?? [],
          zones: d.zonalEducationOffices ?? [],
          instCategories: d.institutionCategory ?? [],
          institutions: d.institutions ?? [],
        });
      })
      .catch(() => {})
      .finally(() => setLoadingFormData(false));
  }, [isOpen, schoolBased, form.service_id, form.zone, form.inst_category]);

  // Load office-based form data (ranks / positions / ZEO offices)
  useEffect(() => {
    if (!isOpen || schoolBased) return;
    setLoadingZeos(true);
    Promise.all([
      api.get("/register/appointment-form-data", {
        params: { service: form.service_id || "" },
      }),
      api.get("/zeo-list", { params: { per_page: 999 } }),
    ])
      .then(([formRes, zeoRes]) => {
        const d = formRes.data;
        setFormData((prev) => ({
          ...prev,
          ranks: d.serviceRanks ?? [],
          positions: d.positions ?? [],
        }));
        setZeoOffices(zeoRes.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoadingZeos(false));
  }, [isOpen, schoolBased, form.service_id]);

  if (!isOpen) return null;

  const loading = loadingFormData || loadingZeos;

  const footer = (
    <>
      <button type="button" onClick={onClose} disabled={isSubmitting} className={darkSafeButtonClasses.secondary}>
        Cancel
      </button>
      <button type="button" onClick={onSubmit} disabled={isSubmitting || loading} className={darkSafeButtonClasses.primary}>
        {isSubmitting ? "Saving..." : "Save Entry"}
      </button>
    </>
  );

  return (
    <DarkSafeModal isOpen={isOpen} title="Add Service History Entry" onClose={onClose} footer={footer} size="lg">
      <div className="space-y-4 py-1">
        {appointments.length > 1 && (
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Service / Appointment <span className="text-red-500">*</span>
            </label>
            <select
              value={form.appointment_id}
              onChange={(e) => onChange("appointment_id", e.target.value)}
              className={darkSafeInputClass}
            >
              <option value="">Select service</option>
              {appointments.map((a) => (
                <option key={a.appointment_id} value={a.appointment_id}>
                  {a.service?.service_name ?? a.service_id} {a.active_status === 1 ? "(Active)" : "(Inactive)"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              From Date <span className="text-red-500">*</span>
            </label>
            <input type="date" value={form.appoint_date} onChange={(e) => onChange("appoint_date", e.target.value)} className={darkSafeInputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              To Date <span className="text-gray-400">(leave blank if current)</span>
            </label>
            <input type="date" value={form.end_date} onChange={(e) => onChange("end_date", e.target.value)} className={darkSafeInputClass} />
          </div>
        </div>

        {schoolBased ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Zone <span className="text-red-500">*</span>
                </label>
                <select value={form.zone} onChange={(e) => onChange("zone", e.target.value)} className={darkSafeInputClass} disabled={loadingFormData}>
                  <option value="">Select zone</option>
                  {formData.zones.map((z) => (
                    <option key={z.workplace_id} value={z.workplace_id}>
                      {z.name ?? z.office_name ?? z.workplace_id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Institution Category <span className="text-red-500">*</span>
                </label>
                <select value={form.inst_category} onChange={(e) => onChange("inst_category", e.target.value)} className={darkSafeInputClass} disabled={!form.zone || loadingFormData}>
                  <option value="">Select category</option>
                  {formData.instCategories.map((c) => (
                    <option key={c.institution_category_id ?? c.id} value={c.institution_category_id ?? c.id}>
                      {c.institution_category_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                School / Workplace <span className="text-red-500">*</span>
              </label>
              <select value={form.workplace_id} onChange={(e) => onChange("workplace_id", e.target.value)} className={darkSafeInputClass} disabled={!form.zone || !form.inst_category || loadingFormData}>
                <option value="">Select school</option>
                {formData.institutions.map((inst) => (
                  <option key={inst.workplace_id} value={inst.workplace_id}>
                    [{inst.census_no}] {inst.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Office / Workplace <span className="text-red-500">*</span>
            </label>
            <select value={form.workplace_id} onChange={(e) => onChange("workplace_id", e.target.value)} className={darkSafeInputClass} disabled={loadingZeos}>
              <option value="">Select office</option>
              {zeoOffices.map((z) => (
                <option key={z.workplace_id} value={z.workplace_id}>
                  {z.name ?? z.office_name ?? z.workplace_id}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Rank <span className="text-red-500">*</span>
            </label>
            <select value={form.rank_id} onChange={(e) => onChange("rank_id", e.target.value)} className={darkSafeInputClass} disabled={loading}>
              <option value="">Select rank</option>
              {formData.ranks.map((r) => (
                <option key={r.rank_id} value={r.rank_id}>
                  {r.name ?? r.rank_name ?? r.rank_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <select value={form.position_id} onChange={(e) => onChange("position_id", e.target.value)} className={darkSafeInputClass} disabled={loading}>
              <option value="">Select position</option>
              {formData.positions.map((p) => (
                <option key={p.position_id} value={p.position_id}>
                  {p.position_name ?? p.position_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Change Type <span className="text-red-500">*</span>
            </label>
            <select value={form.updated_type} onChange={(e) => onChange("updated_type", e.target.value)} className={darkSafeInputClass}>
              {SERVICE_HISTORY_CHANGE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Letter / Order No
            </label>
            <input
              type="text"
              value={form.appointment_letter_no}
              onChange={(e) => onChange("appointment_letter_no", e.target.value)}
              placeholder="e.g. MOE/123/2010"
              className={darkSafeInputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Remarks
          </label>
          <textarea
            value={form.remarks}
            onChange={(e) => onChange("remarks", e.target.value)}
            rows={2}
            placeholder="Optional notes"
            className={darkSafeTextareaClass}
          />
        </div>
      </div>
    </DarkSafeModal>
  );
}

export function PastServiceModal({
  isOpen,
  form,
  onChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  allowedServiceIds = [],
}) {
  const [formData, setFormData] = useState({ services: [], ranks: [], positions: [], zones: [], instCategories: [], institutions: [] });
  const [zeoOffices, setZeoOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedServiceName = formData.services.find((s) => s.service_id === form.service_id)?.service_name ?? "";
  const schoolBased = isSchoolBasedService(selectedServiceName);

  // Load all services once on open
  useEffect(() => {
    if (!isOpen) return;
    api.get("/register/appointment-form-data", { params: {} })
      .then((res) => {
        const all = res.data.service ?? [];
        const filtered = allowedServiceIds.length > 0
          ? all.filter((s) => allowedServiceIds.includes(s.service_id))
          : all;
        setFormData((prev) => ({ ...prev, services: filtered }));
      })
      .catch(() => {});
  }, [isOpen]);

  // Load ranks, positions, and workplace data when service changes
  useEffect(() => {
    if (!isOpen || !form.service_id) return;
    setLoading(true);

    const requests = [
      api.get("/register/appointment-form-data", {
        params: {
          service: form.service_id,
          ins_cat: form.inst_category || "",
          zone: form.zone || "",
          office_level: schoolBased ? "OLID006" : "OLID004",
        },
      }),
    ];

    if (!schoolBased) {
      requests.push(api.get("/zeo-list", { params: { per_page: 999 } }));
    }

    Promise.all(requests)
      .then(([formRes, zeoRes]) => {
        const d = formRes.data;
        setFormData((prev) => ({
          ...prev,
          ranks: d.serviceRanks ?? [],
          positions: d.positions ?? [],
          zones: d.zonalEducationOffices ?? [],
          instCategories: d.institutionCategory ?? [],
          institutions: d.institutions ?? [],
        }));
        if (zeoRes) setZeoOffices(zeoRes.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, form.service_id, form.zone, form.inst_category, schoolBased]);

  if (!isOpen) return null;

  const footer = (
    <>
      <button type="button" onClick={onClose} disabled={isSubmitting} className={darkSafeButtonClasses.secondary}>
        Cancel
      </button>
      <button type="button" onClick={onSubmit} disabled={isSubmitting || loading} className={darkSafeButtonClasses.primary}>
        {isSubmitting ? "Saving..." : "Add Service Block"}
      </button>
    </>
  );

  return (
    <DarkSafeModal isOpen={isOpen} title="Add Past Service Block" onClose={onClose} footer={footer} size="lg">
      <div className="space-y-4 py-1">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Service <span className="text-red-500">*</span>
            </label>
            <select
              value={form.service_id}
              onChange={(e) => {
                onChange("service_id", e.target.value);
                onChange("rank_id", "");
                onChange("position_id", "");
                onChange("zone", "");
                onChange("inst_category", "");
                onChange("workplace_id", "");
              }}
              className={darkSafeInputClass}
            >
              <option value="">Select service</option>
              {formData.services.map((s) => (
                <option key={s.service_id} value={s.service_id}>
                  {s.service_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              First Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.first_appointment_date}
              onChange={(e) => onChange("first_appointment_date", e.target.value)}
              className={darkSafeInputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Rank <span className="text-red-500">*</span>
            </label>
            <select value={form.rank_id} onChange={(e) => onChange("rank_id", e.target.value)} className={darkSafeInputClass} disabled={!form.service_id || loading}>
              <option value="">Select rank</option>
              {formData.ranks.map((r) => (
                <option key={r.rank_id} value={r.rank_id}>
                  {r.name ?? r.rank_name ?? r.rank_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <select value={form.position_id} onChange={(e) => onChange("position_id", e.target.value)} className={darkSafeInputClass} disabled={!form.service_id || loading}>
              <option value="">Select position</option>
              {formData.positions.map((p) => (
                <option key={p.position_id} value={p.position_id}>
                  {p.position_name ?? p.position_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {form.service_id && (
          schoolBased ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Zone <span className="text-red-500">*</span>
                  </label>
                  <select value={form.zone} onChange={(e) => { onChange("zone", e.target.value); onChange("inst_category", ""); onChange("workplace_id", ""); }} className={darkSafeInputClass} disabled={loading}>
                    <option value="">Select zone</option>
                    {formData.zones.map((z) => (
                      <option key={z.workplace_id} value={z.workplace_id}>
                        {z.name ?? z.office_name ?? z.workplace_id}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Institution Category <span className="text-red-500">*</span>
                  </label>
                  <select value={form.inst_category} onChange={(e) => { onChange("inst_category", e.target.value); onChange("workplace_id", ""); }} className={darkSafeInputClass} disabled={!form.zone || loading}>
                    <option value="">Select category</option>
                    {formData.instCategories.map((c) => (
                      <option key={c.institution_category_id ?? c.id} value={c.institution_category_id ?? c.id}>
                        {c.institution_category_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  School / Workplace <span className="text-red-500">*</span>
                </label>
                <select value={form.workplace_id} onChange={(e) => onChange("workplace_id", e.target.value)} className={darkSafeInputClass} disabled={!form.zone || !form.inst_category || loading}>
                  <option value="">Select school</option>
                  {formData.institutions.map((inst) => (
                    <option key={inst.workplace_id} value={inst.workplace_id}>
                      [{inst.census_no}] {inst.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Office / Workplace <span className="text-red-500">*</span>
              </label>
              <select value={form.workplace_id} onChange={(e) => onChange("workplace_id", e.target.value)} className={darkSafeInputClass} disabled={loading}>
                <option value="">Select office</option>
                {zeoOffices.map((z) => (
                  <option key={z.workplace_id} value={z.workplace_id}>
                    {z.name ?? z.office_name ?? z.workplace_id}
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
            Appointment Letter No
          </label>
          <input
            type="text"
            value={form.appointment_letter_no}
            onChange={(e) => onChange("appointment_letter_no", e.target.value)}
            placeholder="e.g. MOE/123/2010"
            className={darkSafeInputClass}
          />
        </div>
      </div>
    </DarkSafeModal>
  );
}
