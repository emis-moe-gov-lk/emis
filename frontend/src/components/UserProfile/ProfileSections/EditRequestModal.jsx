import { useState } from "react";
import toast from "react-hot-toast";
import { submitEditRequest } from "@/api/userService";

export default function EditRequestModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: "", complaint: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.complaint.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await submitEditRequest(form);
      toast.success("Edit request submitted successfully.");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? "Failed to submit request. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Send Edit Request
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Describe what you need updated in your profile. An administrator will review your request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Update contact number"
              maxLength={255}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              name="complaint"
              value={form.complaint}
              onChange={handleChange}
              placeholder="Describe the change you need and provide any supporting details..."
              rows={5}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
