import React, { useState } from "react";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { updatePersonSection } from "@/api/profileService";

const HealthInformation = ({
  employee,
  canEdit,
  peopleId,
  onSaveSuccess,
  bloodGroupOptions = [],
}) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [bloodGroupId, setBloodGroupId] = useState(
    employee?.blood_group?.blood_group_id || "",
  );
  const [healthCondition, setHealthCondition] = useState(
    employee?.health_condition ?? 0,
  );
  const [knownProblems, setKnownProblems] = useState(
    employee?.health_problem || "",
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePersonSection(peopleId, "health", {
        bloodGroupId,
        healthCondition: Number(healthCondition),
        knownProblems: knownProblems || null,
      });
      setShowModal(false);
      onSaveSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <section>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Health Information
            </h2>
            <p className="text-sm text-gray-500">Medical overview and vitals</p>
          </div>

          {canEdit && (
            <Can permission={PermissionGroups.MY_PROFILE.GENERAL_EDIT}>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                ✏ Edit Details
              </button>
            </Can>
          )}
        </div>

        <div className="space-y-4">
          {/* Blood Group Card */}
          <div className="surface-muted bg-gradient-to-br from-white to-red-50/30 dark:from-gray-800 dark:to-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute -right-2 -top-2 opacity-5">
              <div className="text-6xl text-red-600">🧪</div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl shadow-inner">
                <span className="text-xl font-black text-red-600 dark:text-red-400">
                  {employee?.blood_group?.blood_group}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Blood Group Type
                </p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Emergency Vital Information
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Overall Condition */}
            <div className="surface p-4 rounded-2xl flex items-start gap-3">
              <div className="mt-1">
                <div
                  className={`size-2.5 rounded-full ${
                    employee?.health_condition === 0
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                      : "bg-amber-500"
                  }`}
                ></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
                  Overall Condition
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  {employee?.health_condition === 0 ? "Healthy" : "Under Treatment"}
                </p>
              </div>
            </div>

            {/* Known Problems */}
            <div className="surface p-4 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
                    Known Problems
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                    {employee?.health_problem || "No reported medical conditions"}
                  </p>
                </div>
                <span className="text-gray-300 dark:text-gray-600">🛡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="surface w-full max-w-md rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Health Details</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Blood Group */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Blood Group
                </label>
                <select
                  value={bloodGroupId}
                  onChange={(e) => setBloodGroupId(e.target.value)}
                  className="w-full border rounded-lg p-2 dark:bg-gray-700"
                >
                  <option value="">Select</option>
                  {bloodGroupOptions.map((bg) => (
                    <option key={bg.id} value={bg.id}>
                      {bg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Health Status */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Current Health Status
                </label>
                <select
                  value={healthCondition}
                  onChange={(e) => setHealthCondition(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 dark:bg-gray-700"
                >
                  <option value={0}>Healthy</option>
                  <option value={1}>Under Treatment</option>
                </select>
              </div>

              {/* Medical Details */}
              {healthCondition === 1 && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Medical Details
                  </label>
                  <textarea
                    rows="3"
                    value={knownProblems}
                    onChange={(e) => setKnownProblems(e.target.value)}
                    className="w-full border rounded-lg p-2 dark:bg-gray-700"
                    placeholder="Enter details..."
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthInformation;
