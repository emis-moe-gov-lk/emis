import React, { useState } from "react";
import Card from "./Card";
import { format } from "date-fns";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import { HiAcademicCap, HiBuildingLibrary, HiTrash } from "react-icons/hi2";

const EducationalQualifications = ({
  qualificationList = [],
  educationQualificationList = [],
  gradeOption = {},
  canCreate = false,
  canDelete = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    qualification: "",
    institution: "",
    effectiveDate: "",
    grade: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving:", formData);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (confirm("Remove this qualification?")) {
      console.log("Delete ID:", id);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Educational Qualifications
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Academic background and certifications
          </p>
        </div>

        {/* {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm font-medium rounded-full border hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
          >
            <HiAcademicCap className="w-5 h-5" />
            Add New
          </button>
        )} */}
      </div>

      {/* QUALIFICATIONS LIST */}
      <div className="space-y-4">
        {qualificationList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 surface-muted rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <HiAcademicCap className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-sm text-gray-500 font-medium">
              No qualifications listed yet.
            </p>
          </div>
        ) : (
          qualificationList.map((data) => (
            <div
              key={data.id}
              className="group relative surface p-5 rounded-2xl hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <HiAcademicCap className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
                      {data.qualification?.qualification}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <HiBuildingLibrary className="w-3 h-3" />
                      {data.institution}
                    </p>

                    {data.description && (
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic line-clamp-2">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 mt-1 md:mt-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Completed
                    </p>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {data.effective_date
                        ? format(new Date(data.effective_date), "MMM yyyy")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Grade
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                      {data.qualificationGrade?.grade || "N/A"}
                    </span>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(data.id)}
                      className="pl-4 border-l border-gray-100 dark:border-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {canCreate && showModal && (
        <Modal title="Add Achievement" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              options={educationQualificationList.map((item) => ({
                value: item.qualifications_id,
                label: item.qualification,
              }))}
            />

            <Input
              label="Institution / University"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="e.g. University of Colombo"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Effective Date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
              />
              <Select
                label="Grade / Result"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                options={Object.entries(gradeOption).map(([key, value]) => ({
                  value: key,
                  label: value,
                }))}
              />
            </div>

            <Textarea
              label="Additional Details"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Major subjects, thesis title, or special awards..."
            />

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-500/20"
              >
                Save Achievement
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default EducationalQualifications;
