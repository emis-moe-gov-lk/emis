import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";

import { HiBriefcase, HiBuildingOffice2, HiMapPin } from "react-icons/hi2";
import { format } from "date-fns";
import { Badge } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { getAppointmentFormData, updatePersonSection } from "@/api/profileService";

const EmploymentStatus = ({
  employee = {},
  canEdit = false,
  peopleId,
  onSaveSuccess,
  servicesOptions = [],
  allRanks = [],
}) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    appointmentDate: employee.current_appointment?.appoint_date || "",
    appointmentLetterNo: employee.current_appointment?.appointment_letter_no || "",
    service: employee.current_appointment?.service_id || "",
    serviceRank: employee.current_appointment?.rank_id || "",
    position: employee.current_appointment?.position_id || "",
    officeLevel: employee.current_appointment?.workplace?.office_level_id || "",
    zonalEducationOffice: "",
    institutionCategory: "",
    workingPlace: employee.current_appointment?.workplace_id || "",
  });

  const [officeLevelOptions, setOfficeLevelOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [zonalOptions, setZonalOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [institutionOptions, setInstitutionOptions] = useState([]);

  // Ranks filtered client-side by selected service
  const ranksOptions = allRanks
    .filter((r) => !formData.service || r.service_id === formData.service)
    .map((r) => ({ id: r.rank_id, name: r.rank_name }));

  // Fetch form data when modal opens
  useEffect(() => {
    if (!showModal) return;

    const loadFormData = async () => {
      try {
        const res = await getAppointmentFormData({
          service: formData.service || undefined,
        });
        const data = res.data;
        setOfficeLevelOptions(
          (data.officeLevels || []).map((l) => ({
            id: l.office_level_id,
            name: l.office_level_name,
          })),
        );
        setPositionOptions(
          (data.positions || []).map((p) => ({
            id: p.position_id,
            name: p.position_name,
          })),
        );
        setZonalOptions(
          (data.zonalEducationOffices || []).map((z) => ({
            id: z.workplace_id,
            name: z.short_name ?? z.office_name ?? z.name,
          })),
        );
        setCategoryOptions(
          (data.institutionCategory || []).map((c) => ({
            id: c.institution_category_id,
            name: c.institution_category_name,
          })),
        );
      } catch (err) {
        console.error("Error loading appointment form data:", err);
      }
    };

    loadFormData();
  }, [showModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = async (e) => {
    const serviceId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      service: serviceId,
      serviceRank: "",
      position: "",
    }));
    setPositionOptions([]);
    if (!serviceId) return;
    try {
      const res = await getAppointmentFormData({ service: serviceId });
      setPositionOptions(
        (res.data.positions || []).map((p) => ({
          id: p.position_id,
          name: p.position_name,
        })),
      );
    } catch {
      // ignore
    }
  };

  const handleOfficeLevelChange = (e) => {
    const level = e.target.value;
    setFormData((prev) => ({
      ...prev,
      officeLevel: level,
      zonalEducationOffice: "",
      institutionCategory: "",
      workingPlace: "",
    }));
    setInstitutionOptions([]);
  };

  const handleZonalChange = async (e) => {
    const zoneId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      zonalEducationOffice: zoneId,
      institutionCategory: "",
      workingPlace: "",
    }));
    setInstitutionOptions([]);
  };

  const handleCategoryChange = async (e) => {
    const catId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      institutionCategory: catId,
      workingPlace: "",
    }));
    setInstitutionOptions([]);
    if (!catId || !formData.zonalEducationOffice) return;
    try {
      const res = await getAppointmentFormData({
        service: formData.service || undefined,
        zone: formData.zonalEducationOffice,
        ins_cat: catId,
      });
      setInstitutionOptions(
        (res.data.institutions || []).map((i) => ({
          id: i.workplace_id,
          name: i.name ?? i.institution_name,
        })),
      );
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePersonSection(peopleId, "current_appointment", {
        currentAppointmentDate: formData.appointmentDate,
        currentAppointmentService: formData.service,
        currentAppointmentRank: formData.serviceRank,
        currentAppointmentPosition: formData.position,
        currentAppointmentInstitution: formData.workingPlace || null,
      });
      setShowModal(false);
      onSaveSuccess?.();
    } catch (err) {
      const fieldErrors = err.response?.data?.errors;
      setError(
        fieldErrors
          ? Object.values(fieldErrors).flat().join(", ")
          : err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <HiBriefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Employment Status
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Current appointment & placement
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
          <StatusBadge className="px-3 py-1 text-sm">
            {employee.current_appointment?.service_years ?? 0} Service
          </StatusBadge>
          {canEdit && (
            <Can permission={PermissionGroups.MY_PROFILE.EMPLOYMENT_EDIT}>
              <button
                onClick={() => setShowModal(true)}
                className="px-3 py-1 text-sm rounded-full border hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
              >
                Edit
              </button>
            </Can>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-5 sm:p-6 rounded-2xl shadow-xl text-white">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-mobile"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 30 0 L 0 0 0 30"
                  fill="none"
                  stroke="white"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-mobile)" />
          </svg>
        </div>

        <div className="relative flex flex-col xs:flex-row items-start xs:items-center gap-4">
          <div className="hidden xs:block p-3.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
            <HiBuildingOffice2 className="w-6 h-6 text-blue-300" />
          </div>

          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[9px] font-bold text-blue-300/70 uppercase tracking-[0.2em]">
                Active Placement
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold leading-tight flex flex-wrap items-center gap-2">
              {employee.current_appointment?.workplace?.institution
                ?.census_no && (
                <span className="bg-blue-400/20 text-blue-100 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">
                  {employee.current_appointment.workplace.institution.census_no}
                </span>
              )}
              <span className="break-words">
                {employee.current_appointment?.workplace?.institution?.name ??
                  "Not Assigned"}
              </span>
            </h3>

            <div className="mt-2.5 flex items-start gap-2 text-slate-300/90">
              <HiMapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-400/60" />
              <p className="text-xs sm:text-sm leading-relaxed">
                {employee.current_appointment?.workplace?.institution
                  ?.address ?? "Address not available"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Service Branch
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {employee.current_appointment?.service?.service_name ?? "N/A"}
          </p>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Current Grade
          </p>
          <StatusBadge className="text-[10px] px-1.5">
            {employee.current_appointment?.rank?.rank_name ?? "N/A"}
          </StatusBadge>
        </div>

        <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Designation
          </p>
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {employee.current_appointment?.position?.position_name ?? "N/A"}
          </p>
        </div>

        <div className="p-3.5 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Appointed
          </p>
          <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400">
            {employee.current_appointment?.appoint_date
              ? format(
                  new Date(employee.current_appointment.appoint_date),
                  "yyyy-MM-dd",
                )
              : "N/A"}
          </p>
        </div>

        <div className="p-3.5 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 col-span-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            Reference
          </p>
          <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-400 truncate">
            {employee.current_appointment?.appointment_letter_no ?? "---"}
          </p>
        </div>
      </div>

      {/* Modal */}
      {canEdit && showModal && (
        <Modal title="Service Update" onClose={() => setShowModal(false)}>
          <form
            onSubmit={handleSubmit}
            className="space-y-5 max-h-[80vh] overflow-y-auto pr-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Appointment Date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
              />
              <Input
                label="Letter Number"
                name="appointmentLetterNo"
                value={formData.appointmentLetterNo}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Service"
                name="service"
                value={formData.service}
                onChange={handleServiceChange}
                options={servicesOptions}
              />
              <Select
                label="Service Rank"
                name="serviceRank"
                value={formData.serviceRank}
                onChange={handleChange}
                options={ranksOptions}
              />
            </div>

            <Select
              label="Designation"
              name="position"
              value={formData.position}
              onChange={handleChange}
              options={positionOptions}
            />

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Placement
              </p>

              <Select
                label="Workplace Level"
                name="officeLevel"
                value={formData.officeLevel}
                onChange={handleOfficeLevelChange}
                options={officeLevelOptions}
              />

              {formData.officeLevel === "OLID006" && (
                <>
                  <Select
                    label="Zonal Education Office"
                    name="zonalEducationOffice"
                    value={formData.zonalEducationOffice}
                    onChange={handleZonalChange}
                    options={zonalOptions}
                  />
                  <Select
                    label="Institution Category"
                    name="institutionCategory"
                    value={formData.institutionCategory}
                    onChange={handleCategoryChange}
                    options={categoryOptions}
                  />
                </>
              )}

              <Select
                label="Working Place"
                name="workingPlace"
                value={formData.workingPlace}
                onChange={handleChange}
                options={institutionOptions}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 pb-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    appointmentDate: employee.current_appointment?.appoint_date || "",
                    appointmentLetterNo: employee.current_appointment?.appointment_letter_no || "",
                    service: employee.current_appointment?.service_id || "",
                    serviceRank: employee.current_appointment?.rank_id || "",
                    position: employee.current_appointment?.position_id || "",
                    officeLevel: employee.current_appointment?.workplace?.office_level_id || "",
                    zonalEducationOffice: "",
                    institutionCategory: "",
                    workingPlace: employee.current_appointment?.workplace_id || "",
                  })
                }
                className="w-full sm:flex-1 px-4 py-2 border rounded-lg"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:flex-[2] px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : "Update Records"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EmploymentStatus;
