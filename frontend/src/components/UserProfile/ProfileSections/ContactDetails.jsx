import React, { useState } from "react";

const ContactDetails = ({ employee, canEdit }) => {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState(employee?.email || "");
  const [phone, setPhone] = useState(employee?.phone || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, phone });
    setShowModal(false);
  };

  return (
    <div>
      <section>
        {/* Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Contact Details
            </h2>
            <p className="text-sm text-gray-500">Communication channels</p>
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
          {/* Email Card */}
          <a
            href={`mailto:${employee?.email}`}
            className="block bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-blue-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl group-hover:scale-110 transition-transform">
                <span className="text-blue-600 dark:text-blue-400 text-xl">
                  📧
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Primary Email
                </p>

                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                  {employee?.email}
                  <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    ↗
                  </span>
                </p>
              </div>
            </div>
          </a>

          {/* Phone Card */}
          <a
            href={`tel:${employee?.phone}`}
            className="block bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10 p-5 rounded-2xl border border-green-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md hover:border-green-300 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl group-hover:scale-110 transition-transform">
                <span className="text-green-600 dark:text-green-400 text-xl">
                  📱
                </span>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Mobile Number
                </p>

                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight flex items-center gap-2">
                  {employee?.phone}
                  <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    ↗
                  </span>
                </p>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Update Channels</h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0771234567"
                  className="w-full border rounded-lg p-2 dark:bg-gray-700"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full border rounded-lg p-2 dark:bg-gray-700"
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
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetails;
