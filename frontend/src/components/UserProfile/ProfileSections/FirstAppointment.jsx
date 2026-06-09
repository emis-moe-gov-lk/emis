import React, { useState } from "react";
import { HiBriefcase, HiBuildingLibrary, HiMapPin } from "react-icons/hi2";
import Input from "./Input";
import Select from "./Select";
import Modal from "./Modal";
import { format } from "date-fns";
import { Badge } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

const FirstAppointment = ({ employee, canEdit, options }) => {
  const [showModal, setShowModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(
    employee?.appointment?.first_appointment_date || "",
  );
  const [appointmentLetterNo, setAppointmentLetterNo] = useState(
    employee?.appointment?.appointment_letter_no || "",
  );
  const [service, setService] = useState(
    employee?.appointment?.service_id || "",
  );
  const [serviceRank, setServiceRank] = useState(
    employee?.appointment?.rank_id || "",
  );
  const [position, setPosition] = useState(
    employee?.appointment?.position_id || "",
  );
  const [officeLevel, setOfficeLevel] = useState(
    employee?.appointment?.office_level_id || "",
  );
  const [workingPlace, setWorkingPlace] = useState(
    employee?.appointment?.workplace_id || "",
  );

  const resetFields = () => {
    setAppointmentDate(employee?.appointment?.first_appointment_date || "");
    setAppointmentLetterNo(employee?.appointment?.appointment_letter_no || "");
    setService(employee?.appointment?.service_id || "");
    setServiceRank(employee?.appointment?.rank_id || "");
    setPosition(employee?.appointment?.position_id || "");
    setOfficeLevel(employee?.appointment?.office_level_id || "");
    setWorkingPlace(employee?.appointment?.workplace_id || "");
  };

  return (
    <div>
      <section>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <HiBriefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                First Appointment
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Official entry and service details
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
            <StatusBadge className="text-[10px] sm:text-xs">
              {employee?.appointment?.service_years ?? 0} Active
            </StatusBadge>

            {canEdit && (
              <Can permission={PermissionGroups.MY_PROFILE.EMPLOYMENT_EDIT}>
                <button
                  className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50"
                  onClick={() => setShowModal(true)}
                >
                  Edit
                </button>
              </Can>
            )}
          </div>
        </div>

        {/* Appointment Card */}
        <div className="space-y-4">
          <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Initial Workplace
                </p>
                <div className="h-px flex-1 bg-emerald-50 dark:bg-emerald-900/20"></div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug flex flex-wrap items-center gap-2">
                {employee?.appointment?.workplace?.census_no && (
                  <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200 dark:border-gray-600">
                    {employee?.appointment?.workplace?.census_no}
                  </span>
                )}
                <span className="break-words">
                  {employee?.appointment?.workplace?.name ?? "N/A"}
                </span>
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-start gap-1.5 leading-relaxed">
                <HiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500/50" />
                {employee?.appointment?.workplace?.address ??
                  "Address not specified"}
              </p>
            </div>

            <HiBuildingLibrary className="absolute -right-6 -bottom-6 w-24 h-24 text-gray-50 dark:text-gray-700/20 -rotate-12 pointer-events-none" />
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Service Branch
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {employee?.appointment?.service?.service_name}
              </p>
            </div>

            <div className="p-3.5 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Entry Rank
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {employee?.appointment?.rank?.rank_name}
              </p>
            </div>

            <div className="p-3.5 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Position
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {employee?.appointment?.position?.position_name ?? "N/A"}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Appointed On
              </p>
              <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {employee?.appointment?.first_appointment_date
                  ? format(
                      new Date(employee.appointment.first_appointment_date),
                      "dd MMM yyyy",
                    )
                  : "N/A"}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Reference
              </p>
              <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 truncate">
                {employee?.appointment?.appointment_letter_no}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 col-span-2 lg:col-span-1">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                System Entry
              </p>
              <p className="text-[11px] text-gray-500">
                Created:{" "}
                {employee?.appointment?.created_at
                  ? format(
                      new Date(employee.appointment.created_at),
                      "yyyy-MM-dd",
                    )
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {canEdit && showModal && (
        <Modal title="Update Appointment" onClose={() => setShowModal(false)}>
          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Appointment Date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
              <Input
                label="Appointment No"
                value={appointmentLetterNo}
                onChange={(e) => setAppointmentLetterNo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                options={options.services}
              />
              <Select
                label="Service Rank"
                value={serviceRank}
                onChange={(e) => setServiceRank(e.target.value)}
                options={options.ranks}
              />
            </div>

            <Select
              label="Designation"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              options={options.positions}
            />

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Initial Placement
              </p>

              <Select
                label="Workplace Level"
                value={officeLevel}
                onChange={(e) => setOfficeLevel(e.target.value)}
                options={options.officeLevels}
              />

              <Select
                label="Working Place"
                value={workingPlace}
                onChange={(e) => setWorkingPlace(e.target.value)}
                options={options.workingPlaces}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 pb-2">
              <button
                type="button"
                onClick={resetFields}
                className="w-full sm:flex-1 px-4 py-2 border rounded-lg"
              >
                Reset
              </button>
              <button
                type="submit"
                className="w-full sm:flex-[2] px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-500/20"
              >
                Save Appointment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FirstAppointment;
