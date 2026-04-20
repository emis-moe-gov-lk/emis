import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTimetable } from "../../context/TimetableContext";
import { fetchLessonRecords } from "../../api/timetableApi";
import { toLocalISO, formatDateShort } from "../../utils/time";

function RecordBook() {
    const { subjects, subjectColors } = useTimetable();

    const today = toLocalISO(new Date());
    const thirtyDaysAgo = (() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return toLocalISO(d);
    })();

    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);
    const [filterClass, setFilterClass] = useState("");
    const [filterSubject, setFilterSubject] = useState("");

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fetched, setFetched] = useState(false);

    const loadRecords = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchLessonRecords({
                startDate,
                endDate,
                className: filterClass || undefined,
                subject: filterSubject || undefined,
            });
            setRecords(data);
            setFetched(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        loadRecords();
    }, []);

    // Derive unique classes and subjects from records for filter dropdowns
    const uniqueClasses = useMemo(() => {
        const classes = new Set(records.map((r) => r.class).filter(Boolean));
        return [...classes].sort();
    }, [records]);

    const uniqueSubjects = useMemo(() => {
        const subs = new Set(records.map((r) => r.subject).filter(Boolean));
        return [...subs].sort();
    }, [records]);

    // Group records by date
    const groupedByDate = useMemo(() => {
        const groups = {};
        for (const record of records) {
            if (!groups[record.date]) {
                groups[record.date] = [];
            }
            groups[record.date].push(record);
        }
        // Sort dates descending
        return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    }, [records]);

    const getDayName = (dateStr) => {
        return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
    };

    return (
        <div className="p-3 sm:p-6">
            <div className="print-area max-w-4xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Record Book</h2>
                        <p className="text-xs text-gray-500">Lesson records and learning outcomes</p>
                    </div>
                    <div className="no-print flex items-center gap-2">
                        <Link
                            to="../weekly"
                            className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                        >
                            Timetable
                        </Link>
                        <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition"
                        >
                            Print
                        </button>
                    </div>
                </div>

                {/* Print-only header */}
                <div className="print-only hidden print-area-title py-2">
                    <h1 className="text-xl font-bold text-center">Record Book</h1>
                    <p className="text-sm text-center mt-1">Teacher:</p>
                    <p className="text-xs text-center text-gray-500">
                        {formatDateShort(startDate)} — {formatDateShort(endDate)}
                    </p>
                </div>

                {/* Filters */}
                <div className="no-print bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm min-w-[120px]"
                            >
                                <option value="">All Classes</option>
                                {uniqueClasses.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="border border-gray-200 rounded-md px-3 py-1.5 text-sm min-w-[120px]"
                            >
                                <option value="">All Subjects</option>
                                {uniqueSubjects.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={loadRecords}
                            disabled={loading}
                            className="px-4 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Filter"}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Records */}
                {fetched && records.length === 0 && !loading && (
                    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-sm text-gray-400">No records found for this period.</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Add records by clicking the book icon on slots in the timetable.
                        </p>
                    </div>
                )}

                {groupedByDate.map(([date, dateRecords]) => (
                    <div key={date} className="space-y-3">
                        {/* Date header */}
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-xs font-semibold text-gray-500 shrink-0">
                                {getDayName(date)}, {formatDateShort(date)}
                            </span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        {/* Record cards for this date */}
                        {dateRecords.map((record) => {
                            const color = subjectColors[record.subject];
                            return (
                                <div
                                    key={record.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                                >
                                    {/* Card header */}
                                    <div
                                        className="px-4 py-3 border-b flex items-center justify-between gap-3"
                                        style={{
                                            backgroundColor: color ? color + "10" : "#f9fafb",
                                            borderColor: color ? color + "30" : undefined,
                                        }}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            {color && (
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: color }}
                                                />
                                            )}
                                            <span className="text-sm font-semibold text-gray-800 truncate">
                                                {record.subject}
                                            </span>
                                            <span className="text-xs text-gray-500 shrink-0">
                                                {record.class}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-400 shrink-0">
                                            {record.periodTime} • {record.day}
                                        </span>
                                    </div>

                                    {/* Card body */}
                                    <div className="px-4 py-3 space-y-2">
                                        <p className="text-sm font-medium text-gray-800">{record.topic}</p>
                                        {record.description && (
                                            <p className="text-xs text-gray-500 leading-relaxed">{record.description}</p>
                                        )}

                                        {record.outcomes.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                <p className="text-[11px] font-semibold text-indigo-600 mb-1.5">
                                                    Learning Outcomes
                                                </p>
                                                <ol className="space-y-1">
                                                    {record.outcomes.map((o, i) => (
                                                        <li key={o.id} className="flex items-start gap-2 text-xs text-gray-600">
                                                            <span className="text-indigo-400 font-semibold shrink-0">{i + 1}.</span>
                                                            <span>{o.description}</span>
                                                        </li>
                                                    ))}
                                                </ol>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Summary footer for print */}
                {fetched && records.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-400">
                            {records.length} record{records.length !== 1 ? "s" : ""} total
                            {filterClass && ` • ${filterClass}`}
                            {filterSubject && ` • ${filterSubject}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecordBook;
