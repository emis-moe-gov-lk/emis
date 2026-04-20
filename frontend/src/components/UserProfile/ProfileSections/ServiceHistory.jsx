import React, { useState } from "react";
import {
  HiBriefcase,
  HiMapPin,
  HiTrash,
  HiPlus,
  HiCalendar,
} from "react-icons/hi2";

const ServiceHistory = ({
  serviceUpdate = [],
  canCreate = false,
  canDelete = false,
  userServicesOptions = [],
  ranksOptions = [],
  positionOption = [],
  //   officeLevelOption = [],
  //   zonalEducationOfficeOption = [],
  //   institutionCategoryOption = [],
  //   workingPlaceOption = [],
}) => {
  // Modal state
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    recordType: "",
    service: "",
    rank: "",
    position: "",
    officeLevel: "",
    zonalEducationOffice: "",
    institutionCategory: "",
    workingPlace: "",
    appointDate: "",
    endedDate: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Form data:", form);
    // TODO: save via API
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure?")) {
      console.log("Delete record ID:", id);
      // TODO: delete via API
    }
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: PREVIOUS SERVICE */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <HiBriefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Previous Service-related information
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                History of positions and ranks
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
            {canCreate && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              >
                <HiPlus className="w-4 h-4" />
                Previous Record
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(serviceUpdate || [])
            .filter((item) => item.updated_type !== "1")
            .map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Position & Service */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase truncate">
                      {item.position?.position_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                        {item.service?.service_name}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">
                        •
                      </span>
                      <span className="text-xs text-gray-500 italic">
                        {item.rank?.rank_name}
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex gap-8 md:gap-12 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-10">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Start Date
                      </p>
                      <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                        {item.appoint_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        End Date
                      </p>
                      <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                        {item.end_date}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end md:w-20">
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {(serviceUpdate || []).filter((item) => item.updated_type !== "1")
            .length === 0 && (
            <div className="p-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-center text-sm text-gray-400">
              No service records found.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: WORKING PLACE */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <HiMapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                Previous Working Place
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                History of office placements
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {(serviceUpdate || [])
            .filter((item) => item.updated_type === "1")
            .map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Office & Address */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                      Institution
                    </p>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white uppercase truncate">
                      {item.workplace?.office_name || "N/A"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {item.workplace?.address || "N/A"}
                    </p>
                  </div>

                  {/* Service Period Badge */}
                  <div className="md:w-32">
                    <span className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold">
                      {item.service_period}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex gap-8 md:gap-12 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-10">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Appointed
                      </p>
                      <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                        {item.appoint_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                        Released
                      </p>
                      <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300">
                        {item.end_date}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end md:w-20">
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {(serviceUpdate || []).filter((item) => item.updated_type === "1")
            .length === 0 && (
            <div className="p-10 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl text-center text-sm text-gray-400">
              No workplace history found.
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {canCreate && showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl space-y-6">
            <h2 className="text-lg font-bold">Add Previous Record</h2>
            <p className="text-sm">
              Enter the details of the previous service record.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">
                  Update Type
                </label>
                <select
                  name="recordType"
                  value={form.recordType}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select type</option>
                  <option value="0">Position</option>
                  <option value="1">Grade update</option>
                  <option value="2">Previous workplace</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">
                    Service
                  </label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Service</option>
                    {userServicesOptions.map((s) => (
                      <option key={s.service_id} value={s.service_id}>
                        {s.service_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Grade</label>
                  <select
                    name="rank"
                    value={form.rank}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Rank</option>
                    {ranksOptions.map((r) => (
                      <option key={r.rank_id} value={r.rank_id}>
                        {r.rank_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Position</label>
                <select
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Position</option>
                  {positionOption.map((p) => (
                    <option key={p.position_id} value={p.position_id}>
                      {p.position_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="appointDate"
                  value={form.appointDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  type="date"
                  name="endedDate"
                  value={form.endedDate}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
