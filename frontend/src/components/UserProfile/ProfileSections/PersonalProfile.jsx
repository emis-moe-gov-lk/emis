import React, { useState } from "react";
import InfoBlock from "./InfoBlock";
import Modal from "./Modal";
import Input from "./Input";
import Select from "./Select";
import Card from "./Card";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { updatePersonSection } from "@/api/profileService";

const PersonalProfile = ({
  employee,
  canEdit,
  peopleId,
  onSaveSuccess,
  titleOptions = [],
  genderOptions = [],
  ethnicityOptions = [],
  religionOptions = [],
  civilStatusOptions = [],
}) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nic: employee?.nic || "",
    title: employee?.title?.title_id || "",
    fullName: employee?.full_name || "",
    gender: employee?.gender?.gender_id || "",
    birthday: employee?.date_of_birth || "",
    ethnicity: employee?.ethnicity?.ethnicity_id || "",
    religion: employee?.religion?.religion_id || "",
    civilStatus: employee?.civilStatus?.civil_status_id || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePersonSection(peopleId, "personal", {
        titleId: formData.title,
        fullName: formData.fullName,
        genderId: formData.gender,
        dateOfBirth: formData.birthday,
        ethnicityId: formData.ethnicity,
        religionId: formData.religion,
        civilStatusId: formData.civilStatus,
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
      <section>
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Personal Profile
            </h2>
            <p className="text-sm text-gray-500">
              Identity and cultural details
            </p>
          </div>

          {canEdit && (
            <Can permission={PermissionGroups.MY_PROFILE.GENERAL_EDIT}>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-sm font-medium rounded-full border hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Edit Details
              </button>
            </Can>
          )}
        </div>

        <div className="space-y-4">
          {/* Primary Identity Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 p-5 rounded-2xl border shadow-sm">
            <InfoBlock label="Legal Full Name" value={employee?.full_name} />
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-3" />
            <InfoBlock
              label="Display Name"
              value={employee?.name_with_initials}
            />
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card label="Birth Date" value={employee?.date_of_birth} />
            <Card label="Gender" value={employee?.gender?.gender_name} />
            <Card label="Religion" value={employee?.religion?.religion_name} />
            <Card
              label="Ethnicity"
              value={employee?.ethnicity?.ethnicity_name}
            />

            <div className="col-span-2 bg-white dark:bg-gray-800 p-4 rounded-2xl border shadow-sm flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Civil Status
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {employee?.civil_status?.civil_status_name}
                </p>
              </div>
              ❤️
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {showModal && (
        <Modal title="Update Info" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="NIC Number"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              disabled
            />

            <div className="flex gap-3">
              <Select
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                options={titleOptions}
              />
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
              />
              <Input
                type="date"
                label="Birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Ethnicity"
                name="ethnicity"
                value={formData.ethnicity}
                onChange={handleChange}
                options={ethnicityOptions}
              />
              <Select
                label="Religion"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                options={religionOptions}
              />
            </div>

            <Select
              label="Civil Status"
              name="civilStatus"
              value={formData.civilStatus}
              onChange={handleChange}
              options={civilStatusOptions}
            />

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PersonalProfile;
