import React, { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";

import { HiBriefcase, HiBuildingOffice2, HiMapPin } from "react-icons/hi2";
import { format } from "date-fns";
import { Badge } from "flowbite-react";

const EmploymentStatus = ({
  employee = {},
  canEdit = false,
  userServicesOptions = [],
  ranksOptions = [],
  positionOption = [],
  officeLevelOption = [],
  zonalEducationOfficeOption = [],
  institutionCategoryOption = [],
  workingPlaceOption = [],
}) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentLetterNo: "",
    service: "",
    serviceRank: "",
    position: "",
    officeLevel: "",
    zonalEducationOffice: "",
    institutionCategory: "",
    workingPlace: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Update Employment:", formData);
    setShowModal(false);
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
          <Badge size="sm" color="blue">
            {employee.current_appointment?.service_years ?? 0} Service
          </Badge>
          {/* {canEdit && (
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 text-sm rounded-full border hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
            >
              Edit
            </button>
          )} */}
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
          <Badge size="sm" color="blue" className="text-[10px] px-1.5">
            {employee.current_appointment?.rank?.rank_name ?? "N/A"}
          </Badge>
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
                onChange={handleChange}
                options={userServicesOptions.map((s) => ({
                  value: s.service_id,
                  label: s.service_name,
                }))}
              />
              <Select
                label="Service Rank"
                name="serviceRank"
                value={formData.serviceRank}
                onChange={handleChange}
                options={ranksOptions.map((r) => ({
                  value: r.rank_id,
                  label: r.rank_name,
                }))}
              />
            </div>

            <Select
              label="Designation"
              name="position"
              value={formData.position}
              onChange={handleChange}
              options={positionOption.map((p) => ({
                value: p.position_id,
                label: p.position_name,
              }))}
            />

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Placement
              </p>

              <Select
                label="Workplace Level"
                name="officeLevel"
                value={formData.officeLevel}
                onChange={handleChange}
                options={officeLevelOption.map((l) => ({
                  value: l.office_level_id,
                  label: l.office_level_name,
                }))}
              />

              {formData.officeLevel === "OLID006" && (
                <>
                  <Select
                    label="Zonal Education Office"
                    name="zonalEducationOffice"
                    value={formData.zonalEducationOffice}
                    onChange={handleChange}
                    options={zonalEducationOfficeOption.map((z) => ({
                      value: z.workplace_id,
                      label: z.short_name,
                    }))}
                  />
                  <Select
                    label="Institution Category"
                    name="institutionCategory"
                    value={formData.institutionCategory}
                    onChange={handleChange}
                    options={institutionCategoryOption.map((c) => ({
                      value: c.institution_category_id,
                      label: c.institution_category_name,
                    }))}
                  />
                </>
              )}

              <Select
                label="Working Place"
                name="workingPlace"
                value={formData.workingPlace}
                onChange={handleChange}
                options={workingPlaceOption.map((o) => ({
                  value: o.workplace_id,
                  label: o.office_name,
                }))}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 pb-2">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    appointmentDate: "",
                    appointmentLetterNo: "",
                    service: "",
                    serviceRank: "",
                    position: "",
                    officeLevel: "",
                    zonalEducationOffice: "",
                    institutionCategory: "",
                    workingPlace: "",
                  })
                }
                className="w-full sm:flex-1 px-4 py-2 border rounded-lg"
              >
                Reset
              </button>
              <button
                type="submit"
                className="w-full sm:flex-[2] px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Update Records
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EmploymentStatus;
