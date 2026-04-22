import React, { useState } from "react";
import { MdCancel, MdRestore, MdDelete, MdInfo, MdComment } from "react-icons/md";

const RejectedList = ({
  rejectedItems = [],
  workplaceName = "All Workplaces",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [alerts, setAlerts] = useState({
    success: "",
    error: "",
    warning: "",
    info: "",
  });

  // Filter rejected items based on search query
  const filteredItems = rejectedItems.filter((item) =>
    [item.nic, item.name, item.position, item.service, item.rejectionReason, item.rejectedBy].some((field) =>
      field?.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  // Handle restore action (move back to pending)
  const handleRestore = async (item) => {
    if (window.confirm(`Are you sure you want to restore ${item.name} for re-verification?`)) {
      try {
        setAlerts({
          ...alerts,
          success: `${item.name} has been restored to pending verification list.`,
        });
        setTimeout(() => setAlerts({ ...alerts, success: "" }), 3000);
      } catch (error) {
        setAlerts({
          ...alerts,
          error: `Failed to restore ${item.name}. Please try again.`,
        });
        setTimeout(() => setAlerts({ ...alerts, error: "" }), 3000);
      }
    }
  };

  // Handle permanent delete
  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to permanently delete ${item.name}? This action cannot be undone.`)) {
      try {
        setAlerts({
          ...alerts,
          success: `${item.name} has been permanently deleted.`,
        });
        setTimeout(() => setAlerts({ ...alerts, success: "" }), 3000);
      } catch (error) {
        setAlerts({
          ...alerts,
          error: `Failed to delete ${item.name}. Please try again.`,
        });
        setTimeout(() => setAlerts({ ...alerts, error: "" }), 3000);
      }
    }
  };

  // Handle view rejection reason
  const handleViewReason = (item) => {
    setSelectedItem(item);
    setShowReasonModal(true);
  };

  // Clear alert
  const clearAlert = (type) => {
    setAlerts({ ...alerts, [type]: "" });
  };

  return (
    <div className="w-full relative mb-6">
      {/* Heading */}
      <h1 className="text-xl font-bold mb-2">
        Rejected Items List for {workplaceName}
      </h1>
      <h2 className="text-sm font-semibold mb-6 text-slate-600">
        Manage rejected profiles, verification requests, and account approvals
      </h2>
      <hr className="border-t border-slate-200 mb-6" />

      {/* Alerts */}
      {Object.entries(alerts).map(
        ([type, message]) =>
          message && (
            <div
              key={type}
              className={`mb-4 px-4 py-2 rounded border relative ${
                type === "success"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : type === "error"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : type === "warning"
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <span>{message}</span>
              <button
                onClick={() => clearAlert(type)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          ),
      )}

      
      {/* Search Input */}
      <div className="my-6 flex justify-end">
        <input
          type="text"
          placeholder="Search by name, NIC, rejection reason, or rejected by..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-60 md:w-80 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-red-500 shadow-sm"
        />
      </div>

      {/* Rejected Items Table */}
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
                Rejection Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Rejected By
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Rejected Date
              </th>
              
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full overflow-hidden border">
                        <img
                          className="h-full w-full object-cover"
                          src={
                            item.gender === "F"
                              ? "/images/profile_f.png"
                              : "/images/profile_m.png"
                          }
                          alt="Profile"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {item.title} {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          NIC:{" "}
                          <span className="font-medium">{item.nic}</span>
                        </div>
                      </div>
                    </div>
                   </td>

                  {/* Designation */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.position}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.service}
                    </div>
                   </td>

                  {/* Rejection Reason - Truncated */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm text-gray-700 truncate">
                      {item.rejectionReason || "No reason provided"}
                    </div>
                    <button
                      onClick={() => handleViewReason(item)}
                      className="text-xs text-red-600 hover:text-red-800 mt-1 inline-flex items-center gap-1"
                    >
                      <MdInfo size={12} />
                      View full reason
                    </button>
                   </td>

                  {/* Rejected By */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.rejectedBy || "System"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.rejectedRole || "Admin"}
                    </div>
                   </td>

                  {/* Rejected Date */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.rejectedAt}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.rejectedDaysAgo ? `${item.rejectedDaysAgo} days ago` : ""}
                    </div>
                   </td>

                  
                 </tr>
              ))
            ) : (
              <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-gray-400 text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p>No rejected items found</p>
                      
                    </div>
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reason Modal */}
      {showReasonModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Rejection Details</h3>
              <button
                onClick={() => setShowReasonModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdCancel size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">
                    {selectedItem.title} {selectedItem.name}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    NIC
                  </label>
                  <p className="text-gray-900 font-semibold mt-1">{selectedItem.nic}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Position
                  </label>
                  <p className="text-gray-900 mt-1">{selectedItem.position}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Service
                  </label>
                  <p className="text-gray-900 mt-1">{selectedItem.service}</p>
                </div>
              </div>

              <hr className="border-t border-gray-200" />

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Rejected By
                </label>
                <p className="text-gray-900 mt-1">
                  {selectedItem.rejectedBy} ({selectedItem.rejectedRole || "Admin"})
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Rejected Date
                </label>
                <p className="text-gray-900 mt-1">{selectedItem.rejectedAt}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Rejection Reason
                </label>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex gap-2">
                    <MdComment className="text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedItem.rejectionReason || "No specific reason provided."}
                    </p>
                  </div>
                </div>
              </div>

              {selectedItem.additionalComments && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Additional Comments
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{selectedItem.additionalComments}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowReasonModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleRestore(selectedItem);
                  setShowReasonModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <MdRestore size={16} />
                Restore Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedList;