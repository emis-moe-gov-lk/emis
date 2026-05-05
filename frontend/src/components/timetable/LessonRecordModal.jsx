import { useState, useEffect } from "react";
import { useTimetable } from "../../context/TimeTableContext";
import {
  fetchLessonRecordsBySlot,
  createLessonRecord,
  updateLessonRecord,
  deleteLessonRecord,
} from "../../api/timetableApi";

function LessonRecordModal({ slot, date, onClose }) {
  const { subjectColors, setRecordedDates } = useTimetable();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recordId, setRecordId] = useState(null);

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [outcomes, setOutcomes] = useState([]);
  const [error, setError] = useState("");

  const bgColor = subjectColors[slot.subject] || null;

  // Fetch existing record for this slot + date
  useEffect(() => {
    setLoading(true);
    fetchLessonRecordsBySlot(slot.id, date)
      .then((records) => {
        if (records.length > 0) {
          const r = records[0];
          setRecordId(r.id);
          setTopic(r.topic);
          setDescription(r.description || "");
          setOutcomes(
            r.outcomes.map((o) => ({
              description: o.description,
            })),
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slot.id, date]);

  const addOutcome = () => {
    setOutcomes([...outcomes, { description: "" }]);
  };

  const updateOutcome = (index, value) => {
    setOutcomes(
      outcomes.map((o, i) => (i === index ? { description: value } : o)),
    );
  };

  const removeOutcome = (index) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }

    const validOutcomes = outcomes.filter((o) => o.description.trim());

    setSaving(true);
    setError("");
    try {
      if (recordId) {
        await updateLessonRecord(recordId, {
          topic: topic.trim(),
          description: description.trim() || null,
          outcomes: validOutcomes.map((o, i) => ({
            description: o.description.trim(),
            sortOrder: i,
          })),
        });
      } else {
        await createLessonRecord({
          slotId: slot.id,
          date,
          topic: topic.trim(),
          description: description.trim() || null,
          outcomes: validOutcomes.map((o, i) => ({
            description: o.description.trim(),
            sortOrder: i,
          })),
        });
      }

      // Update recordedDates in context
      setRecordedDates((prev) => {
        const slotDates = prev[slot.id] || [];
        if (!slotDates.includes(date)) {
          return { ...prev, [slot.id]: [...slotDates, date] };
        }
        return prev;
      });

      onClose();
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!recordId) return;

    setDeleting(true);
    try {
      await deleteLessonRecord(recordId);

      setRecordedDates((prev) => {
        const slotDates = (prev[slot.id] || []).filter((d) => d !== date);
        if (slotDates.length === 0) {
          const updated = { ...prev };
          delete updated[slot.id];
          return updated;
        }
        return { ...prev, [slot.id]: slotDates };
      });

      onClose();
    } catch (err) {
      setError("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[460px] rounded-xl shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            {bgColor && (
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: bgColor }}
              />
            )}
            <h3 className="text-sm font-semibold">
              {recordId ? "Edit Record" : "Add Record"}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {slot.subject} • {slot.class} • {slot.startTime} – {slot.endTime}
          </p>
          <p className="text-xs font-medium text-indigo-600 mt-0.5">
            {formattedDate}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Topic <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setError("");
                  }}
                  placeholder="What was taught in this lesson?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional notes about the lesson (optional)"
                />
              </div>

              <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-indigo-700">
                    Learning Outcomes
                  </p>
                  <button
                    type="button"
                    onClick={addOutcome}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                  >
                    + Add
                  </button>
                </div>

                {outcomes.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No outcomes added yet
                  </p>
                )}

                <ul className="space-y-1.5">
                  {outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs text-indigo-400 font-semibold w-5 shrink-0 text-right">
                        {i + 1}.
                      </span>
                      <input
                        className="flex-1 border border-indigo-200 bg-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        value={outcome.description}
                        onChange={(e) => updateOutcome(i, e.target.value)}
                        placeholder="Describe the learning outcome..."
                      />
                      <button
                        type="button"
                        onClick={() => removeOutcome(i)}
                        className="text-indigo-300 hover:text-red-500 text-xs leading-none shrink-0"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center shrink-0">
          {recordId && (
            <button
              onClick={handleDelete}
              disabled={deleting || saving}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <div className="flex-1" />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              disabled={saving || loading}
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md disabled:opacity-50 hover:bg-indigo-700 transition"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonRecordModal;
