import { useState, useRef, useEffect } from "react";
import { getUpcomingDates, formatDateShort } from "../../utils/time";
import { useTimetable } from "../../context/TimetableContext";
import { fetchSlotComments } from "../../api/timetableApi";

const COLOR_OPTIONS = [
    null,        // No color / default
    "#ef4444",   // Red
    "#f97316",   // Orange
    "#eab308",   // Yellow
    "#22c55e",   // Green
    "#14b8a6",   // Teal
    "#3b82f6",   // Blue
    "#8b5cf6",   // Purple
    "#ec4899",   // Pink
];

function EditSlotModal({ slot, onClose, onSave }) {
    const { subjectColors, saveSubjectColor, subjects, offDays } = useTimetable();
    const isSpecial = offDays.includes(slot.day);

    const isEdit = slot.id !== null;
    const dates = getUpcomingDates(slot.day);

    const [form, setForm] = useState({
        class: slot.class,
        subject: slot.subject,
        students: slot.students,
        purpose: slot.purpose || "",
        comments: slot.comments || [],
    });
    const [selectedColor, setSelectedColor] = useState(
        subjectColors[slot.subject] || null
    );
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [saving, setSaving] = useState(false);

    // Check if a color is already used by another subject
    const getColorOwner = (color) => {
        if (!color) return null;
        const currentSubject = form.subject.trim();
        for (const [subject, assignedColor] of Object.entries(subjectColors)) {
            if (assignedColor === color && subject !== currentSubject) {
                return subject;
            }
        }
        return null;
    };
    const [selectedDate, setSelectedDate] = useState(dates[0] || "");

    // Autocomplete state
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [subjectError, setSubjectError] = useState("");
    const [colorError, setColorError] = useState("");
    const suggestionRef = useRef(null);

    // Filter subjects that start with the typed text (case-insensitive)
    const filteredSubjects = form.subject.trim()
        ? subjects.filter(s =>
            s.toLowerCase().startsWith(form.subject.toLowerCase())
          )
        : [];

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch ALL comments for existing slots (grid only has this week's or next upcoming)
    useEffect(() => {
        if (slot.id) {
            setLoadingComments(true);
            fetchSlotComments(slot.id)
                .then(comments => setForm(f => ({ ...f, comments })))
                .catch(() => {}) // keep whatever comments were passed in
                .finally(() => setLoadingComments(false));
        }
    }, [slot.id]);

    const addComment = () => {
        const text = newComment.trim();
        if (!text || !selectedDate) return;
        setForm({
            ...form,
            comments: [...form.comments, { text, date: selectedDate }],
        });
        setNewComment("");
    };

    const removeComment = (index) => {
        setForm({ ...form, comments: form.comments.filter((_, i) => i !== index) });
    };

    /* group comments by date for display */
    const sorted = [...form.comments].sort((a, b) => a.date.localeCompare(b.date));

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white w-[420px] rounded-xl shadow-lg max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className={`px-5 py-4 border-b shrink-0 ${isSpecial ? "bg-orange-50" : ""}`}>
                    <h3 className="text-sm font-semibold">
                        {isSpecial ? "Special Class" : "Edit Slot"}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {slot.day} • {slot.startTime} – {slot.endTime}
                    </p>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                        <input
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={form.class}
                            onChange={e =>
                                setForm({ ...form, class: e.target.value })
                            }
                            placeholder="Class"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Students</label>
                        <input
                            type="number"
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={form.students}
                            onChange={e =>
                                setForm({ ...form, students: e.target.value })
                            }
                            placeholder="Students"
                        />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-3.5 space-y-3">
                        <div className="relative" ref={suggestionRef}>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject</label>
                            <input
                                className={`w-full border bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 ${
                                    subjectError ? "border-red-400" : "border-gray-200"
                                }`}
                                value={form.subject}
                                onChange={e => {
                                    setForm({ ...form, subject: e.target.value });
                                    setSubjectError("");
                                    setShowSuggestions(e.target.value.trim().length > 0);
                                }}
                                onFocus={() => {
                                    if (form.subject.trim().length > 0) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                placeholder="Type to search subjects..."
                            />
                            {subjectError && (
                                <p className="text-xs text-red-500 mt-1">{subjectError}</p>
                            )}
                            {showSuggestions && filteredSubjects.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                    {filteredSubjects.map(subject => (
                                        <li
                                            key={subject}
                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-violet-50 flex items-center gap-2"
                                            onClick={() => {
                                                setForm({ ...form, subject });
                                                setShowSuggestions(false);
                                                setSelectedColor(subjectColors[subject] || null);
                                            }}
                                        >
                                            {subjectColors[subject] && (
                                                <span
                                                    className="w-3 h-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: subjectColors[subject] }}
                                                />
                                            )}
                                            {subject}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {showSuggestions && form.subject.trim() && filteredSubjects.length === 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-sm text-gray-500">
                                    No matching subjects
                                </div>
                            )}
                        </div>



                        {!isSpecial && <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Subject Color</label>
                            <div className="flex gap-2 flex-wrap items-center">
                                {COLOR_OPTIONS.map((color, idx) => {
                                    const owner = getColorOwner(color);
                                    const isTaken = !!owner;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                if (!isTaken) {
                                                    setSelectedColor(color);
                                                    setColorError("");
                                                }
                                            }}
                                            disabled={isTaken}
                                            className={`w-7 h-7 rounded-lg transition-all duration-150 flex items-center justify-center ${
                                                isTaken
                                                    ? "opacity-40 cursor-not-allowed"
                                                    : selectedColor === color
                                                        ? "ring-2 ring-offset-2 ring-gray-400 shadow-sm"
                                                        : "hover:scale-110 shadow-sm"
                                            }`}
                                            style={{
                                                backgroundColor: color || "#e5e7eb",
                                                border: color ? `2px solid ${color}` : "2px solid #d1d5db",
                                            }}
                                            title={isTaken ? `Used by: ${owner}` : (color ? color : "No color")}
                                        >
                                            {isTaken && (
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="white" stroke="rgba(0,0,0,0.3)" strokeWidth="1">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {!isTaken && selectedColor === color && (
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={color ? "white" : "#6b7280"}>
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            {!isTaken && color === null && selectedColor !== color && (
                                                <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                                {/* Custom color picker */}
                                <label
                                    className={`relative w-7 h-7 rounded-lg transition-all duration-150 flex items-center justify-center shadow-sm cursor-pointer ${
                                        selectedColor && !COLOR_OPTIONS.includes(selectedColor)
                                            ? "ring-2 ring-offset-2 ring-gray-400"
                                            : "hover:scale-110"
                                    }`}
                                    style={{
                                        background: selectedColor && !COLOR_OPTIONS.includes(selectedColor)
                                            ? selectedColor
                                            : "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                                        border: selectedColor && !COLOR_OPTIONS.includes(selectedColor)
                                            ? `2px solid ${selectedColor}`
                                            : "2px solid #d1d5db",
                                    }}
                                    title="Pick custom color"
                                >
                                    <input
                                        type="color"
                                        value={selectedColor && !COLOR_OPTIONS.includes(selectedColor) ? selectedColor : "#6366f1"}
                                        onChange={(e) => {
                                            const owner = getColorOwner(e.target.value);
                                            if (owner) {
                                                setColorError(`This color is already used by "${owner}"`);
                                            } else {
                                                setColorError("");
                                                setSelectedColor(e.target.value);
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    {selectedColor && !COLOR_OPTIONS.includes(selectedColor) ? (
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="white">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5 text-white drop-shadow" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </label>
                            </div>
                            {colorError && (
                                <p className="text-xs text-red-500 mt-1">{colorError}</p>
                            )}
                        </div>}
                    </div>

                    {isSpecial && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                            <input
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
                                value={form.purpose}
                                onChange={e => setForm({ ...form, purpose: e.target.value })}
                                placeholder="e.g. Revision, Paper discussion, Extra class..."
                            />
                        </div>
                    )}

                    {/* Comments — only for regular slots */}
                    {!isSpecial && <div className="rounded-lg border border-violet-200 bg-violet-50/40 p-3.5 space-y-2.5">
                        <p className="text-xs font-semibold text-violet-700">
                            Reminders
                        </p>

                        {/* Date chip strip */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                            {dates.map(iso => (
                                <button
                                    key={iso}
                                    type="button"
                                    onClick={() => setSelectedDate(iso)}
                                    className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition ${
                                        selectedDate === iso
                                            ? "bg-violet-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                    }`}
                                >
                                    {formatDateShort(iso)}
                                </button>
                            ))}
                        </div>

                        {/* Input row */}
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-violet-200 bg-white rounded-md px-3 py-2 text-sm"
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && addComment()}
                                placeholder="Add a reminder ..."
                            />
                            <button
                                type="button"
                                onClick={addComment}
                                className="px-3 py-2 text-sm bg-violet-600 text-white rounded-md shrink-0"
                            >
                                Add
                            </button>
                        </div>

                        {/* Comment list */}
                        {loadingComments && (
                            <p className="text-xs text-violet-400 text-center py-2">Loading reminders...</p>
                        )}
                        {!loadingComments && sorted.length > 0 && (
                            <ul className="space-y-1">
                                {sorted.map((c, i) => {
                                    const origIndex = form.comments.indexOf(c);
                                    return (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-amber-200/60 text-sm"
                                        >
                                            <span className="text-[10px] text-amber-500 font-semibold shrink-0">
                                                {formatDateShort(c.date)}
                                            </span>
                                            <span className="flex-1 leading-tight truncate text-amber-800">
                                                {c.text}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeComment(origIndex)}
                                                className="text-amber-400 hover:text-red-500 text-xs leading-none shrink-0"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm border rounded-md"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        onClick={async () => {
                            // Validate subject is from the list
                            const trimmedSubject = form.subject.trim();
                            if (!trimmedSubject) {
                                setSubjectError("Please select a subject");
                                return;
                            }
                            if (!subjects.includes(trimmedSubject)) {
                                setSubjectError("Please select a valid subject from the list");
                                return;
                            }

                            if (!isSpecial) {
                                // Validate color is not already used by another subject
                                const colorOwner = getColorOwner(selectedColor);
                                if (colorOwner) {
                                    setColorError(`This color is already used by "${colorOwner}"`);
                                    return;
                                }
                            }

                            setSaving(true);
                            try {
                                if (!isSpecial) {
                                    await saveSubjectColor(trimmedSubject, selectedColor);
                                }
                                await onSave({ ...slot, ...form, subject: trimmedSubject, purpose: isSpecial ? form.purpose : undefined });
                            } catch (err) {
                                alert("Failed to save: " + err.message);
                            } finally {
                                setSaving(false);
                            }
                        }}
                        className="px-4 py-2 text-sm bg-violet-600 text-white rounded-md disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditSlotModal;
