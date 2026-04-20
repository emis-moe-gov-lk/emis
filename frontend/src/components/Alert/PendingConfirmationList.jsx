import React, { useState } from "react";

// Sample Employee Type
// const employees = [
//   {
//     id: 1,
//     name: "John Doe",
//     gender: "M",
//     nic: "123456789V",
//     title: "Mr.",
//     position: "Teacher",
//     service: "SER001",
//     isConfirmed: true,
//     updatedAt: "2026-03-10",
//   },
// ];

const PendingConfirmationList = ({
  employees = [],
  workplaceName = "All Workplaces",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [alerts, setAlerts] = useState({
    success: "",
    error: "",
    warning: "",
    info: "",
  });

  // Filter employees based on search
  const filteredEmployees = employees.filter((e) =>
    [e.nic, e.name, e.position, e.service].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="w-full relative mb-6">
      {/* Heading */}
      <h1 className="text-xl font-bold mb-2">
        Pending Confirmation List for {workplaceName}
      </h1>
      <h2 className="text-sm font-semibold mb-6 text-slate-600">
        Manage pending confirmation profile and account
      </h2>
      <hr className="border-t border-slate-200 mb-6" />

      {/* Alerts */}
      {Object.entries(alerts).map(
        ([type, message]) =>
          message && (
            <div
              key={type}
              className={`mb-4 px-4 py-2 rounded border ${
                type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : type === "warning"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              {message}
            </div>
          ),
      )}

      {/* Search Input */}
      <div className="my-6 flex justify-end">
        <input
          type="text"
          placeholder="Search by NIC, email, or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-60 md:w-80 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Last update
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full overflow-hidden border">
                        <img
                          className="h-full w-full object-cover"
                          src={
                            employee.gender === "F"
                              ? "/images/profile_f.png"
                              : "/images/profile_m.png"
                          }
                          alt="Profile"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {employee.title} {employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          NIC:{" "}
                          <span className="font-medium">{employee.nic}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Designation */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.position}
                    </div>
                    <div className="text-xs text-gray-500">
                      {employee.service}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center ${
                        employee.isConfirmed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {employee.isConfirmed ? "Confirmed" : "Not Confirmed"}
                    </span>
                  </td>

                  {/* Last update */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.updatedAt}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/profile/${employee.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-gray-400 text-sm"
                >
                  No employees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingConfirmationList;
