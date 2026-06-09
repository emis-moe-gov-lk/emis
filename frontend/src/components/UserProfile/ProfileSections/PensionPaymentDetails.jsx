import { useState } from "react";
import { Banknote, FileText, CreditCard, Pencil } from "lucide-react";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";

export default function PensionPaymentDetails({ employee, canEdit, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [wopNo, setWopNo] = useState(employee?.appointment?.w_op_no || "");
  const [paySheetNo, setPaySheetNo] = useState(
    employee?.appointment?.pay_sheet_no || "",
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      w_op_no: wopNo,
      pay_sheet_no: paySheetNo,
    };

    if (onSave) onSave(updatedData);
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
              W&OP & Payment Details
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Pension contributions & payroll identification
            </p>
          </div>
        </div>

        {canEdit && (
          <Can permission={PermissionGroups.MY_PROFILE.WOP_EDIT}>
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Pencil size={16} />
              Edit Details
            </button>
          </Can>
        )}
      </div>

      {/* Data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* W&OP Number */}
        <div className="group p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-sm transition">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition">
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                W&OP Number
              </p>
              <p className="text-base font-mono font-bold text-gray-900 dark:text-white">
                {employee?.appointment?.w_op_no || "NOT ASSIGNED"}
              </p>
            </div>
          </div>
        </div>

        {/* Pay Sheet Number */}
        <div className="group p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-sm transition">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition">
              <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Pay Sheet Number
              </p>
              <p className="text-base font-mono font-bold text-gray-900 dark:text-white">
                {employee?.appointment?.pay_sheet_no || "NOT ASSIGNED"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Update Payment Details
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Update your Widows' & Orphans' Pension and payroll
                identification numbers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  W&OP No
                </label>
                <input
                  type="text"
                  value={wopNo}
                  onChange={(e) => setWopNo(e.target.value)}
                  placeholder="E.g. 1234567-X"
                  className="w-full mt-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pay Sheet No
                </label>
                <input
                  type="text"
                  value={paySheetNo}
                  onChange={(e) => setPaySheetNo(e.target.value)}
                  placeholder="E.g. PS-8821"
                  className="w-full mt-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
