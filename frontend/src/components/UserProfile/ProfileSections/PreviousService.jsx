import React, { useState } from "react";
import { HiBriefcase, HiCalendar } from "react-icons/hi2";

import Input from "./Input";
import Select from "./Select";
import Modal from "./Modal";
import { format } from "date-fns";
import { Badge } from "flowbite-react";
import StatusBadge from "@/components/common/StatusBadge";

const PreviousService = ({
  employeeServiceList,
  canCreate,
  canDelete,
  servicesOptions,
  ranksOptions,
  positionOption,
  officeLevelOption,
  zonalEducationOfficeOption,
  institutionCategoryOption,
  workingPlaceOption,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [firstAppointmentDate, setFirstAppointmentDate] = useState("");
  const [appointmentLetterNo, setAppointmentLetterNo] = useState("");
  const [service, setService] = useState("");
  const [rank, setRank] = useState("");
  const [position, setPosition] = useState("");
  const [officeLevel, setOfficeLevel] = useState("");
  const [zonalEducationOffice, setZonalEducationOffice] = useState("");
  const [institutionCategory, setInstitutionCategory] = useState("");
  const [workingPlace, setWorkingPlace] = useState("");

  const resetFields = () => {
    setFirstAppointmentDate("");
    setAppointmentLetterNo("");
    setService("");
    setRank("");
    setPosition("");
    setOfficeLevel("");
    setZonalEducationOffice("");
    setInstitutionCategory("");
    setWorkingPlace("");
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this record?")) {
      // Call your delete function here
      console.log("Deleting record:", id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <HiBriefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              Previous Service
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              History of official career appointments
            </p>
          </div>
        </div>

        {canCreate && (
          <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
            <button
              className="px-3 py-1 border rounded-full text-sm hover:bg-gray-50"
              onClick={() => setShowModal(true)}
            >
              Add Record
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Cards Stack */}
      <div className="space-y-4">
        {employeeServiceList && employeeServiceList.length > 0 ? (
          employeeServiceList
            .filter((item) => item.updated_type !== "1")
            .map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mr-4 -mt-4 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform">
                  <HiBriefcase className="w-24 h-24" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6 relative">
                  {/* Icon & Main Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                      <HiBriefcase className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                        Official Assignment
                      </p>
                      <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase leading-tight truncate">
                        {item.service.service_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          {item.rank.rank_name}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">
                          |
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {item.appointment_letter_no}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Details */}
                  <div className="grid grid-cols-2 md:flex md:flex-row gap-8 md:gap-12 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-10">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                        Appointed On
                      </p>
                      <div className="flex items-center gap-2">
                        <HiCalendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-bold font-mono text-gray-700 dark:text-gray-300">
                          {format(
                            new Date(item.first_appointment_date),
                            "yyyy-MM-dd",
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">
                        Released On
                      </p>
                      <div className="flex items-center gap-2">
                        <HiCalendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-bold font-mono text-gray-700 dark:text-gray-300">
                          {format(new Date(item.retirement_date), "yyyy-MM-dd")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3">
                    {item.active_status === 1 ? (
                      <StatusBadge className="px-3 py-1 text-sm">
                        ACTIVE
                      </StatusBadge>
                    ) : (
                      <StatusBadge className="px-3 py-1 text-sm">
                        INACTIVE
                      </StatusBadge>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="flex flex-col items-center justify-center p-16 bg-gray-50/50 dark:bg-gray-900/10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <HiBriefcase className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-4" />
            <p className="text-sm text-gray-500 font-medium">
              No previous service history found.
            </p>
          </div>
        )}
      </div>

      {/* Modal Section */}
      {canCreate && showModal && (
        <Modal title="Add Previous Record" onClose={() => setShowModal(false)}>
          <form className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                type="date"
                label="First Appointment Date"
                value={firstAppointmentDate}
                onChange={(e) => setFirstAppointmentDate(e.target.value)}
              />
              <Input
                label="Appointment Letter No"
                placeholder="Enter letter number"
                value={appointmentLetterNo}
                onChange={(e) => setAppointmentLetterNo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <Select
                label="Service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                options={servicesOptions.map((s) => ({
                  value: s.service_id,
                  label: s.service_name,
                }))}
              />
              <Select
                label="Grade"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                options={ranksOptions.map((r) => ({
                  value: r.rank_id,
                  label: r.rank_name,
                }))}
              />
            </div>

            <Select
              label="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              options={positionOption.map((p) => ({
                value: p.position_id,
                label: p.position_name,
              }))}
            />

            <Select
              label="Working Place Level"
              value={officeLevel}
              onChange={(e) => setOfficeLevel(e.target.value)}
              options={officeLevelOption.map((l) => ({
                value: l.office_level_id,
                label: l.office_level_name,
              }))}
            />

            {officeLevel === "OLID006" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Zonal Education Office"
                  value={zonalEducationOffice}
                  onChange={(e) => setZonalEducationOffice(e.target.value)}
                  options={zonalEducationOfficeOption.map((z) => ({
                    value: z.workplace_id,
                    label: z.short_name,
                  }))}
                />
                <Select
                  label="Institution Category"
                  value={institutionCategory}
                  onChange={(e) => setInstitutionCategory(e.target.value)}
                  options={institutionCategoryOption.map((i) => ({
                    value: i.institution_category_id,
                    label: i.institution_category_name,
                  }))}
                />
              </div>
            )}

            <Select
              label="Working Place"
              value={workingPlace}
              onChange={(e) => setWorkingPlace(e.target.value)}
              options={workingPlaceOption.map((w) => ({
                value: w.workplace_id,
                label: w.office_name,
              }))}
            />

            <div className="flex pt-2 justify-end gap-2">
              <button
                type="button"
                onClick={resetFields}
                className="px-4 py-2 border rounded-lg"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PreviousService;
