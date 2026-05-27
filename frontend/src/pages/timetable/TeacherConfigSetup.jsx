import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveSetup } from "../../api/timetableApi.js";

function TeacherConfigSetup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        dayStartTime: "07:30",
        dayEndTime: "13:45",
        numPeriods: 8,
    });
    const [intervals, setIntervals] = useState([]);
    const [offDays, setOffDays] = useState([]);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const toggleOffDay = (day) => {
        setOffDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const addInterval = () => {
        setIntervals([...intervals, { startTime: "", endTime: "" }]);
    };

    const removeInterval = (index) => {
        setIntervals(intervals.filter((_, i) => i !== index));
    };

    const updateInterval = (index, field, value) => {
        setIntervals(intervals.map((iv, i) =>
            i === index ? { ...iv, [field]: value } : iv
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        for (const iv of intervals) {
            if (!iv.startTime || !iv.endTime) {
                setError("All intervals must have start and end times");
                return;
            }
            if (iv.startTime >= iv.endTime) {
                setError("Interval end time must be after start time");
                return;
            }
        }

        setSubmitting(true);
        try {
            const data = {
                ...form,
                numPeriods: Number(form.numPeriods),
                intervals: intervals.length > 0 ? intervals : undefined,
                offDays: offDays.length > 0 ? offDays : undefined,
            };
            await saveSetup(data);
            navigate("/timetable/weekly");
        } catch (err) {
            setError(err.message || "Failed to save setup");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Configure Timetable</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-300">Set up your day and periods</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Day Start</label>
                        <input
                            type="time"
                            className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                            value={form.dayStartTime}
                            onChange={e => setForm({ ...form, dayStartTime: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Day End</label>
                        <input
                            type="time"
                            className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                            value={form.dayEndTime}
                            onChange={e => setForm({ ...form, dayEndTime: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Number of Periods</label>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        className="w-full border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                        value={form.numPeriods}
                        onChange={e => setForm({ ...form, numPeriods: e.target.value })}
                    />
                </div>

                {/* Intervals */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-700 dark:text-slate-300">Intervals (Breaks)</label>
                        <button
                            type="button"
                            onClick={addInterval}
                            className="text-xs font-medium text-violet-600 hover:text-violet-700"
                        >
                            + Add Interval
                        </button>
                    </div>

                    {intervals.map((iv, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-slate-700">
                            <input
                                type="time"
                                className="flex-1 border border-gray-200 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                                value={iv.startTime}
                                onChange={e => updateInterval(index, "startTime", e.target.value)}
                            />
                            <span className="text-xs text-gray-400 dark:text-gray-300">to</span>
                            <input
                                type="time"
                                className="flex-1 border border-gray-200 dark:border-slate-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                                value={iv.endTime}
                                onChange={e => updateInterval(index, "endTime", e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => removeInterval(index)}
                                className="text-gray-400 hover:text-red-500 text-sm px-1"
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {intervals.length === 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-300 text-center py-2">No intervals added yet</p>
                    )}
                </div>

                {/* Off Days */}
                <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-700">Off Days</label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_DAYS.map(day => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleOffDay(day)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                    offDays.includes(day)
                                        ? "bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/20 dark:text-red-300"
                                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-gray-700"
                                }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">
                        {offDays.length === 0
                            ? "No off days — works all 7 days"
                            : `${offDays.length} off day${offDays.length > 1 ? "s" : ""} selected`}
                    </p>
                </div>

                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-2.5 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
                    >
                        {submitting ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TeacherConfigSetup;
