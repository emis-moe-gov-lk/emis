import React, { useEffect, useState } from "react";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import { getPersonalFormData, updatePersonSection } from "@/api/profileService";

const LocationDetails = ({
  employee,
  canEdit,
  peopleId,
  onSaveSuccess,
  districtOptions = [],
}) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const hasCoords = employee?.latitude && employee?.longitude;

  const addressString = [
    employee?.address_line1,
    employee?.address_line2,
    employee?.address_line3,
    employee?.district?.district_name,
  ]
    .filter(Boolean)
    .join(", ");

  const mapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${employee.latitude},${employee.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;

  const [formData, setFormData] = useState({
    district: employee?.district?.district_id || "",
    dsOffice: employee?.gn_division?.dso_id || "",
    gnDivision: employee?.gn_division?.gn_division_id || "",
    addressLine1: employee?.address_line1 || "",
    addressLine2: employee?.address_line2 || "",
    addressLine3: employee?.address_line3 || "",
    postalCode: employee?.postal_code || "",
    latitude: employee?.latitude || "",
    longitude: employee?.longitude || "",
  });

  const [dsOfficeOptions, setDsOfficeOptions] = useState([]);
  const [gnDivisionOptions, setGnDivisionOptions] = useState([]);

  // When modal opens, load DS offices and GN divisions for the current values
  useEffect(() => {
    if (!showModal) return;

    const loadInitialCascades = async () => {
      if (formData.district) {
        try {
          const res = await getPersonalFormData(formData.district);
          setDsOfficeOptions(
            (res.data.divisionalSecretariats || []).map((o) => ({
              id: o.dso_id,
              name: o.dso_name,
            })),
          );
        } catch {
          // ignore
        }
      }
      if (formData.district && formData.dsOffice) {
        try {
          const res = await getPersonalFormData(formData.district, formData.dsOffice);
          setGnDivisionOptions(
            (res.data.gnDivisions || []).map((g) => ({
              id: g.gn_division_id,
              name: g.gn_division_name,
            })),
          );
        } catch {
          // ignore
        }
      }
    };

    loadInitialCascades();
  }, [showModal]);

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      district: districtId,
      dsOffice: "",
      gnDivision: "",
    }));
    setDsOfficeOptions([]);
    setGnDivisionOptions([]);
    if (!districtId) return;
    try {
      const res = await getPersonalFormData(districtId);
      setDsOfficeOptions(
        (res.data.divisionalSecretariats || []).map((o) => ({
          id: o.dso_id,
          name: o.dso_name,
        })),
      );
    } catch {
      // ignore
    }
  };

  const handleDsOfficeChange = async (e) => {
    const dsoId = e.target.value;
    setFormData((prev) => ({ ...prev, dsOffice: dsoId, gnDivision: "" }));
    setGnDivisionOptions([]);
    if (!dsoId) return;
    try {
      const res = await getPersonalFormData(formData.district, dsoId);
      setGnDivisionOptions(
        (res.data.gnDivisions || []).map((g) => ({
          id: g.gn_division_id,
          name: g.gn_division_name,
        })),
      );
    } catch {
      // ignore
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePersonSection(peopleId, "address", {
        districtId: formData.district,
        dsOfficeId: formData.dsOffice,
        gnDivisionId: formData.gnDivision,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        addressLine3: formData.addressLine3 || null,
        postalCode: formData.postalCode,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
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
        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Location Details
            </h2>
            <p className="text-sm text-gray-500">Residency and mapping data</p>
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
          {/* Address Card */}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-800 dark:to-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-orange-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-xl group-hover:scale-105 transition-transform">
                📍
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold uppercase tracking-widest">
                    Permanent Address
                  </p>
                  <span className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    ↗
                  </span>
                </div>

                <div className="mt-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                  {employee?.address_line1} <br />
                  {employee?.address_line2 && (
                    <>
                      {employee.address_line2} <br />
                    </>
                  )}
                  {employee?.address_line3 && (
                    <>
                      {employee.address_line3} <br />
                    </>
                  )}
                  <span className="text-orange-600 dark:text-orange-400 font-bold uppercase text-xs">
                    {employee?.postal_code}
                  </span>
                </div>
              </div>
            </div>
          </a>

          {/* Secondary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                District
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {employee?.district?.district_name || "N/A"}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                GN Division
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                <span className="text-gray-400 font-medium">
                  ({employee?.gn_division?.gn_division_code || "---"})
                </span>{" "}
                {employee?.gn_division?.gn_division_name || "N/A"}
              </p>
            </div>

            {/* Coordinate Status */}
            <div className="sm:col-span-2 flex items-center justify-center gap-4 py-2.5 px-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              {hasCoords ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      Lat:
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                      {employee.latitude}
                    </span>
                  </div>

                  <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">
                      Long:
                    </span>
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                      {employee.longitude}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] italic text-gray-400 flex items-center gap-2">
                  ℹ GPS not set. Mapping via address fallback.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl p-6 shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold mb-4">Update Residency</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Address Line 1"
                className="w-full border rounded-lg p-2 dark:bg-gray-700"
              />

              <input
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Address Line 2"
                className="w-full border rounded-lg p-2 dark:bg-gray-700"
              />

              <div className="flex gap-4">
                <input
                  name="addressLine3"
                  value={formData.addressLine3}
                  onChange={handleChange}
                  placeholder="City"
                  className="flex-1 border rounded-lg p-2 dark:bg-gray-700"
                />
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Postal Code"
                  className="w-1/3 border rounded-lg p-2 dark:bg-gray-700"
                  />
              </div>

              {/* District / DS Office / GN Division */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Administrative Division
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    District
                  </label>
                  <select
                    value={formData.district}
                    onChange={handleDistrictChange}
                    className="w-full border rounded-lg p-2 text-sm dark:bg-gray-700"
                      >
                    <option value="">Select District</option>
                    {districtOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Divisional Secretariat
                  </label>
                  <select
                    value={formData.dsOffice}
                    onChange={handleDsOfficeChange}
                    className="w-full border rounded-lg p-2 text-sm dark:bg-gray-700"
                        disabled={!formData.district}
                  >
                    <option value="">
                      {formData.district
                        ? "Select Divisional Secretariat"
                        : "Select a district first"}
                    </option>
                    {dsOfficeOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    GN Division
                  </label>
                  <select
                    value={formData.gnDivision}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gnDivision: e.target.value,
                      }))
                    }
                    className="w-full border rounded-lg p-2 text-sm dark:bg-gray-700"
                        disabled={!formData.dsOffice}
                  >
                    <option value="">
                      {formData.dsOffice
                        ? "Select GN Division"
                        : "Select a divisional secretariat first"}
                    </option>
                    {gnDivisionOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-widest">
                  GPS Coordinates (Optional)
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="Latitude"
                    className="border rounded-lg p-2 dark:bg-gray-700"
                  />
                  <input
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="border rounded-lg p-2 dark:bg-gray-700"
                  />
                </div>
              </div>

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
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
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

export default LocationDetails;
