import React, { useState } from "react";

const TemporaryLocation = ({ employee, canEdit }) => {
  const [showModal, setShowModal] = useState(false);

  const hasTemporaryAddress = !!employee?.t_address_line1;

  const tAddressString = [
    employee?.t_address_line1,
    employee?.t_address_line2,
    employee?.t_address_line3,
    employee?.t_postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  const tMapUrl = hasTemporaryAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        tAddressString,
      )}`
    : null;

  const [formData, setFormData] = useState({
    tAddressLine1: employee?.t_address_line1 || "",
    tAddressLine2: employee?.t_address_line2 || "",
    tAddressLine3: employee?.t_address_line3 || "",
    tPostalCode: employee?.t_postal_code || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setShowModal(false);
  };

  return (
    <div>
      <section>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Temporary Location
            </h2>
            <p className="text-sm text-gray-500">Current residential address</p>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              ✏ Edit Details
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Address Card */}
          <a
            href={tMapUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => !hasTemporaryAddress && e.preventDefault()}
            className="block surface-muted bg-gradient-to-br from-white to-teal-50/30 dark:from-gray-800 dark:to-teal-900/10 p-5 rounded-2xl border border-teal-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-teal-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/40 rounded-xl group-hover:scale-105 transition-transform">
                🏠
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Residential Address
                  </p>
                  {hasTemporaryAddress && (
                    <span className="text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                      ↗
                    </span>
                  )}
                </div>

                {hasTemporaryAddress ? (
                  <div className="mt-1 text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-relaxed">
                    {employee?.t_address_line1} <br />
                    {employee?.t_address_line2 && (
                      <>
                        {employee.t_address_line2} <br />
                      </>
                    )}
                    {employee?.t_address_line3 && (
                      <>
                        {employee.t_address_line3} <br />
                      </>
                    )}
                    <span className="text-teal-600 dark:text-teal-400 font-bold uppercase text-xs">
                      {employee?.t_postal_code}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm italic text-gray-400">
                    No temporary address provided.
                  </p>
                )}
              </div>
            </div>
          </a>

          {/* Note */}
          <div className="px-4 py-2 surface-muted rounded-xl">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center uppercase tracking-tighter">
              Only provide details if different from your{" "}
              <span className="font-bold">Permanent Location</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="surface w-full max-w-xl rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Residential Update</h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Update your current living address if you are working away from
              home.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="tAddressLine1"
                value={formData.tAddressLine1}
                onChange={handleChange}
                placeholder="Building / Street"
                className="w-full border rounded-lg p-2 dark:bg-gray-700"
              />

              <input
                name="tAddressLine2"
                value={formData.tAddressLine2}
                onChange={handleChange}
                placeholder="Locality"
                className="w-full border rounded-lg p-2 dark:bg-gray-700"
              />

              <div className="flex gap-4">
                <input
                  name="tAddressLine3"
                  value={formData.tAddressLine3}
                  onChange={handleChange}
                  placeholder="City"
                  className="flex-[2] border rounded-lg p-2 dark:bg-gray-700"
                />

                <input
                  name="tPostalCode"
                  value={formData.tPostalCode}
                  onChange={handleChange}
                  placeholder="Zip"
                  className="flex-1 border rounded-lg p-2 dark:bg-gray-700"
                />
              </div>

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
                  className="flex-1 py-2 rounded-lg bg-teal-600 text-white shadow-lg shadow-teal-500/20"
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

export default TemporaryLocation;
