import { useState } from "react";

function EditPeriodModal({ period, onClose, onSave }) {
    const [form, setForm] = useState({
        startTime: period.startTime,
        endTime: period.endTime,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!form.startTime || !form.endTime) {
            alert("Both start and end time are required");
            return;
        }

        if (form.startTime >= form.endTime) {
            alert("End time must be after start time");
            return;
        }

        setSaving(true);
        try {
            await onSave({
                ...period,
                startTime: form.startTime,
                endTime: form.endTime,
            });
        } catch (err) {
            alert("Failed to save: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-white shadow-lg">

                {/* Header */}
                <div className="px-5 py-4 border-b">
                    <h3 className="text-sm font-semibold text-gray-800">
                        Edit Period Time
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Update start and end time for this period
                    </p>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Start Time
                        </label>
                        <input
                            type="time"
                            value={form.startTime}
                            onChange={(e) =>
                                setForm({ ...form, startTime: e.target.value })
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            End Time
                        </label>
                        <input
                            type="time"
                            value={form.endTime}
                            onChange={(e) =>
                                setForm({ ...form, endTime: e.target.value })
                            }
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-3 py-1.5 text-xs rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default EditPeriodModal;
