import { useState, useEffect, Fragment } from "react";
import { useTimetable } from "../../context/TimetableContext";
import { getDisplayItems } from "../../utils/getDisplayPeriods";
import { formatDateShort, toLocalISO, getWeekMonday } from "../../utils/time";
import EditSlotModal from "../../components/timetable/EditSlotModal";
import EditPeriodModal from "../../components/timetable/EditPeriodModal";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import DaySchedule from "../../components/timetable/DaySchedule";
import WeekNavigator from "../../components/timetable/WeekNavigator";
import LessonRecordModal from "../../components/timetable/LessonRecordModal";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* Helper to darken a hex color for text readability */
function adjustColor(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return `rgb(${r}, ${g}, ${b})`;
}

function WeeklyTimetable() {
    const { periods, slots, intervals, subjectColors, offDays, holidays, recordedDates, saveSlot, savePeriod, saveInterval, toggleHoliday, activeWeekStart, setActiveWeekStart, notConfigured, loading } = useTimetable();

    if (!loading && notConfigured) {
        return <Navigate to="/timetable/setup" replace />;
    }

    const getHoliday = (dateISO) => holidays.find(h => h.date === dateISO);

    const [searchParams, setSearchParams] = useSearchParams();
    const [isLocked, setIsLocked] = useState(true);
    const [activeSlot, setActiveSlot] = useState(null);
    const [activePeriod, setActivePeriod] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [activeRecord, setActiveRecord] = useState(null);

    // Support ?week= deep link from month view
    useEffect(() => {
        const weekParam = searchParams.get("week");
        if (weekParam) {
            setActiveWeekStart(getWeekMonday(weekParam));
            setSearchParams({}, { replace: true });
        }
    }, []);

    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const todayISO = toLocalISO(new Date());

    /** Compute the date for a given day index (0=Monday) in the active week */
    const getDayDate = (dayIndex) => {
        const [y, m, d] = activeWeekStart.split("-").map(Number);
        const date = new Date(y, m - 1, d + dayIndex);
        return toLocalISO(date);
    };

    const displayItems = getDisplayItems(periods, intervals);

    /* ---------------- SLOT LOGIC ---------------- */

    const getSlot = (day, periodId) =>
        slots.find((s) => s.day === day && s.periodId === periodId);

    const handleSaveSlot = async (slotData) => {
        try {
            await saveSlot({
                ...slotData,
                students: Number(slotData.students),
            });
            setActiveSlot(null);
        } catch (err) {
            alert("Failed to save slot: " + err.message);
        }
    };

    const handleSavePeriod = async (updatedPeriod) => {
        try {
            await savePeriod(updatedPeriod);
            setActivePeriod(null);
        } catch (err) {
            alert("Failed to save period: " + err.message);
        }
    };

    /* ---------------- INTERVAL ROW ---------------- */

    const [savingInterval, setSavingInterval] = useState(null);

    /** Compute the duration in minutes between two HH:MM strings */
    const minutesBetween = (a, b) => {
        const [ah, am] = a.split(":").map(Number);
        const [bh, bm] = b.split(":").map(Number);
        return (bh * 60 + bm) - (ah * 60 + am);
    };

    const addMinutes = (time, mins) => {
        const [h, m] = time.split(":").map(Number);
        const total = h * 60 + m + mins;
        return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    };

    /**
     * Move interval so it sits after a different period.
     * direction: -1 = move up (after previous period), +1 = move down (after next period)
     *
     * We use displayItems to find where the interval currently sits, then
     * pick the period before/after it to compute the new position.
     */
    const moveInterval = async (interval, direction) => {
        const items = getDisplayItems(periods, intervals);
        const ivIndex = items.findIndex(it => it.type === "interval" && it.startTime === interval.startTime);
        if (ivIndex === -1) return;

        // Collect only period items for position reference
        const periodItems = items.filter(it => it.type === "period");
        // The interval currently sits after periodBefore
        const periodBeforeIdx = periodItems.findIndex(p => p.endTime === interval.startTime);
        const targetIdx = periodBeforeIdx + direction;
        if (targetIdx < 0 || targetIdx >= periodItems.length - 1) return;

        const duration = minutesBetween(interval.startTime, interval.endTime);
        const newStart = periodItems[targetIdx].endTime;
        const newEnd = addMinutes(newStart, duration);

        setSavingInterval(interval.id);
        try {
            await saveInterval({ id: interval.id, startTime: newStart, endTime: newEnd });
        } catch (err) {
            alert("Failed to move interval: " + err.message);
        } finally {
            setSavingInterval(null);
        }
    };

    /** Change interval duration by delta minutes */
    const changeIntervalDuration = async (interval, delta) => {
        const currentDuration = minutesBetween(interval.startTime, interval.endTime);
        const newDuration = currentDuration + delta;
        if (newDuration < 5) return;
        const newEnd = addMinutes(interval.startTime, newDuration);

        setSavingInterval(interval.id);
        try {
            await saveInterval({ id: interval.id, startTime: interval.startTime, endTime: newEnd });
        } catch (err) {
            alert("Failed to update interval: " + err.message);
        } finally {
            setSavingInterval(null);
        }
    };

    const IntervalRow = ({ item }) => {
        // Find the matching interval record (with id) for editing
        const interval = intervals.find(iv => iv.startTime === item.startTime && iv.endTime === item.endTime);
        const duration = minutesBetween(item.startTime, item.endTime);
        const isSaving = interval && savingInterval === interval.id;

        // Can move up/down? Use period list to determine boundaries
        const periodItems = displayItems.filter(it => it.type === "period");
        const periodBeforeIdx = periodItems.findIndex(p => p.endTime === item.startTime);
        const canMoveUp = periodBeforeIdx > 0;
        const canMoveDown = periodBeforeIdx >= 0 && periodBeforeIdx < periodItems.length - 2;

        return (
            <tr className="bg-amber-50/40 border-b border-gray-100">
                <td className="px-4 py-2.5 whitespace-nowrap text-[11px] text-amber-400 font-medium sticky left-0 z-10 bg-amber-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    {item.startTime} – {item.endTime}
                </td>
                <td colSpan={ALL_DAYS.length} className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-amber-200/60" />

                        {!isLocked && interval ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => moveInterval(interval, -1)}
                                    disabled={!canMoveUp || isSaving}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                                    title="Move up"
                                >
                                    ▲
                                </button>
                                <button
                                    onClick={() => changeIntervalDuration(interval, -5)}
                                    disabled={duration <= 5 || isSaving}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                                    title="-5 min"
                                >
                                    −
                                </button>
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${isSaving ? "text-amber-300" : "text-amber-500"}`}>
                                    {isSaving ? "..." : `${duration} min`}
                                </span>
                                <button
                                    onClick={() => changeIntervalDuration(interval, 5)}
                                    disabled={isSaving}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                                    title="+5 min"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => moveInterval(interval, 1)}
                                    disabled={!canMoveDown || isSaving}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-amber-100 text-amber-600 hover:bg-amber-200 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                                    title="Move down"
                                >
                                    ▼
                                </button>
                            </div>
                        ) : (
                            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                                Interval
                            </span>
                        )}

                        <div className="h-px flex-1 bg-amber-200/60" />
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="p-3 sm:p-6">
            <div className="print-area bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Print-only header */}
                <div className="print-only hidden print-area-title py-4 px-6 relative">
                    <h1 className="text-xl font-bold tracking-wide text-center">abc college</h1>
                    <p className="text-sm mt-1 text-center">Weekly Timetable</p>
                    <p className="absolute left-6 top-4 text-base font-bold">Teacher Name:</p>
                </div>

                {/* Screen header */}
                <div className="no-print px-6 py-4 border-b flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-800">
                                    Weekly Timetable
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {isLocked
                                        ? "Unlock to edit timetable"
                                        : "Click a day header to toggle holiday"
                                    }
                                </p>
                            </div>
                            <Link
                                to="../day"
                                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                            >
                                ← Today
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link
                                to="../monthly"
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 transition"
                            >
                                Month
                            </Link>
                            <Link
                                to="../report"
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition"
                            >
                                Report
                            </Link>
                            <Link
                                to="../record-book"
                                className="px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition"
                            >
                                Records
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="hidden sm:inline-flex px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition"
                            >
                                Print
                            </button>
                            <button
                                onClick={() => setIsLocked(!isLocked)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition
                                    ${
                                    isLocked
                                        ? "bg-gray-100 text-gray-600"
                                        : "bg-violet-600 text-white"
                                }
                                `}
                            >
                                {isLocked ? "Locked" : "Editing"}
                            </button>
                        </div>
                    </div>
                    <WeekNavigator />
                </div>

                {/* Table */}
                <div className="overflow-x-auto snap-x snap-mandatory scroll-pl-[100px] sm:snap-none sm:scroll-pl-0">
                    <table className="text-sm sm:w-full sm:table-fixed">
                        <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left w-[100px] sticky left-0 z-10 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">Time</th>
                            {ALL_DAYS.map((day, index) => {
                                const isOff = offDays.includes(day);
                                const dayDateISO = getDayDate(index);
                                const isToday = dayDateISO === todayISO;
                                const holiday = getHoliday(dayDateISO);
                                return (
                                    <th
                                        key={day}
                                        onClick={async () => {
                                            if (isLocked) return;
                                            const slotsOnDay = slots.filter(s => s.day === day);
                                            if (!holiday && slotsOnDay.length > 0) {
                                                if (!confirm(`There are ${slotsOnDay.length} slot(s) on ${day}. Mark as holiday anyway?`)) return;
                                            }
                                            try {
                                                await toggleHoliday(dayDateISO);
                                            } catch (err) {
                                                alert("Failed to toggle holiday: " + err.message);
                                            }
                                        }}
                                        className={`px-4 py-3 text-left min-w-[calc(100vw-130px)] sm:min-w-0 sm:w-[160px] snap-start
                                            ${holiday ? "bg-teal-50 text-teal-600" : ""}
                                            ${isOff && !holiday ? "bg-red-50 text-red-400" : ""}
                                            ${isToday && !holiday ? "bg-blue-50" : ""}
                                            ${!isLocked ? "cursor-pointer hover:bg-teal-100/50" : ""}
                                        `}
                                    >
                                        <div>{day}</div>
                                        <div className={`text-[10px] font-normal ${holiday ? "text-teal-500" : isToday ? "text-blue-500" : "text-gray-400"}`}>
                                            {formatDateShort(dayDateISO)}
                                            {isOff && !holiday && <span className="ml-1">(Off)</span>}
                                            {holiday && <span className="ml-1 font-semibold">(Holiday)</span>}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                        </thead>

                        <tbody>
                        {displayItems.map((item, index) => {
                            if (item.type === "interval") {
                                return <IntervalRow key={`interval-${index}`} item={item} />;
                            }

                            const period = item;

                            return (
                                <Fragment key={period.id}>
                                    {/* Period Row */}
                                    <tr className="border-t">
                                        <td
                                            onClick={() => {
                                                if (!isLocked) setActivePeriod(period);
                                            }}
                                            className={`px-4 py-4 whitespace-nowrap text-gray-500 sticky left-0 z-10 bg-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]
                                                    ${
                                                !isLocked
                                                    ? "cursor-pointer hover:text-violet-600"
                                                    : ""
                                            }
                                                `}
                                        >
                                            {period.startTime} – {period.endTime}
                                        </td>

                                        {ALL_DAYS.map((day, dayIndex) => {
                                            const isOff = offDays.includes(day);
                                            const dayDateISO = getDayDate(dayIndex);
                                            const holiday = getHoliday(dayDateISO);

                                            if (holiday) {
                                                return (
                                                    <td key={day} className="px-3 py-3 h-0 min-w-[calc(100vw-130px)] sm:min-w-0 sm:w-[160px] bg-teal-50/40">
                                                        <div className="min-h-[95px] h-full rounded-lg border border-teal-200 bg-teal-50 flex flex-col items-center justify-center text-xs gap-1">
                                                            <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                            </svg>
                                                            <span className="font-medium text-teal-500">Holiday</span>
                                                            {holiday.reason && <span className="text-[10px] text-teal-400 truncate max-w-[120px]">{holiday.reason}</span>}
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            const slot = getSlot(day, period.id);

                                            if (isOff && !slot) {
                                                return (
                                                    <td key={day} className="px-3 py-3 h-0 min-w-[calc(100vw-130px)] sm:min-w-0 sm:w-[160px] bg-red-50/40">
                                                        <div
                                                            onClick={() => {
                                                                if (!isLocked) {
                                                                    setActiveSlot({
                                                                        id: null,
                                                                        day,
                                                                        periodId: period.id,
                                                                        subject: "",
                                                                        class: "",
                                                                        students: "",
                                                                        date: getDayDate(ALL_DAYS.indexOf(day)),
                                                                    });
                                                                } else {
                                                                    setSelectedDay(day);
                                                                }
                                                            }}
                                                            className={`min-h-[95px] h-full rounded-lg border flex items-center justify-center text-xs cursor-pointer
                                                                ${!isLocked
                                                                    ? "border-dashed border-orange-300 bg-orange-50 hover:bg-orange-100"
                                                                    : "border-red-200 bg-red-50 hover:bg-red-100"
                                                                }`}
                                                        >
                                                            <span className={`font-medium ${!isLocked ? "text-orange-400" : "text-red-300"}`}>
                                                                {!isLocked ? "+ Special Class" : "Off Day"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                );
                                            }

                                            if (isOff && slot) {
                                                const color = subjectColors[slot.subject];
                                                const hasColor = !!color;
                                                const hasRecord = recordedDates[slot.id]?.includes(dayDateISO);
                                                return (
                                                    <td key={day} className="px-3 py-3 h-0 min-w-[calc(100vw-130px)] sm:min-w-0 sm:w-[160px] bg-red-50/40">
                                                        <div
                                                            onClick={() => {
                                                                if (!isLocked) setActiveSlot(slot);
                                                                else setSelectedDay(day);
                                                            }}
                                                            className="rounded-xl p-3 text-xs transition h-full min-h-[95px] cursor-pointer hover:shadow-md"
                                                            style={{
                                                                backgroundColor: hasColor ? color + "15" : "#fff7ed",
                                                                border: `2px solid ${hasColor ? color : "#f97316"}`,
                                                                borderStyle: "solid",
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">Special</span>
                                                            </div>
                                                            <p
                                                                className="font-bold text-sm leading-tight truncate"
                                                                style={{ color: hasColor ? adjustColor(color, -60) : "#9a3412" }}
                                                            >
                                                                {slot.subject}
                                                            </p>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <span
                                                                    className="text-[11px] font-semibold px-2 py-0.5 rounded"
                                                                    style={{
                                                                        backgroundColor: hasColor ? color + "30" : "#fed7aa",
                                                                        color: hasColor ? adjustColor(color, -40) : "#9a3412",
                                                                    }}
                                                                >
                                                                    {slot.class}
                                                                </span>
                                                                <span
                                                                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded"
                                                                    style={{
                                                                        backgroundColor: hasColor ? color + "30" : "#fed7aa",
                                                                        color: hasColor ? adjustColor(color, -40) : "#9a3412",
                                                                    }}
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    {slot.students}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActiveRecord({ slot: { ...slot, startTime: period.startTime, endTime: period.endTime }, date: dayDateISO });
                                                                    }}
                                                                    className={`no-print w-5 h-5 flex items-center justify-center rounded transition ${
                                                                        hasRecord
                                                                            ? "text-emerald-500 hover:text-emerald-600"
                                                                            : "text-gray-300 hover:text-gray-500"
                                                                    }`}
                                                                    title={hasRecord ? "Edit record" : "Add record"}
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            {slot.purpose && (
                                                                <p className="mt-1.5 text-[10px] text-orange-600/80 italic truncate" title={slot.purpose}>
                                                                    {slot.purpose}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={day} className="px-3 py-3 h-0 min-w-[calc(100vw-130px)] sm:min-w-0 sm:w-[160px]">
                                                    {slot ? (() => {
                                                        const color = subjectColors[slot.subject];
                                                        const hasColor = !!color;
                                                        const hasRecord = recordedDates[slot.id]?.includes(dayDateISO);
                                                        return (
                                                        <div
                                                            onClick={() => {
                                                                if (!isLocked) setActiveSlot(slot);
                                                                else setSelectedDay(day);
                                                            }}
                                                            className={`rounded-xl p-3 text-xs transition h-full min-h-[95px] cursor-pointer
                                                                    ${
                                                                !isLocked
                                                                    ? "hover:shadow-md"
                                                                    : "hover:opacity-80"
                                                            }
                                                                `}
                                                            style={
                                                                hasColor
                                                                    ? {
                                                                        backgroundColor: color + "20",
                                                                        border: `1px solid ${color}`,
                                                                    }
                                                                    : {
                                                                        backgroundColor: !isLocked ? "#ede9fe" : "#f9fafb",
                                                                        border: !isLocked ? "1px solid #a78bfa" : "1px solid #e5e7eb",
                                                                    }
                                                            }
                                                        >
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p
                                                                    className="font-bold text-sm leading-tight truncate min-w-0 flex-1 whitespace-nowrap"
                                                                    style={{ color: hasColor ? adjustColor(color, -60) : "#1f2937" }}
                                                                    title={slot.subject}
                                                                >
                                                                    {slot.subject}
                                                                </p>

                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <span
                                                                        className="inline-block text-[11px] font-semibold px-2 py-1 rounded overflow-hidden text-ellipsis whitespace-nowrap"
                                                                        style={{
                                                                            backgroundColor: hasColor ? color + "30" : "#f3f4f6",
                                                                            color: hasColor ? adjustColor(color, -40) : "#6b7280",
                                                                            maxWidth: "55px"
                                                                        }}
                                                                        title={slot.class}
                                                                    >
                                                                        {slot.class}
                                                                    </span>
                                                                    <span
                                                                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded"
                                                                        style={{
                                                                            backgroundColor: hasColor ? color + "30" : "#f3f4f6",
                                                                            color: hasColor ? adjustColor(color, -40) : "#6b7280"
                                                                        }}
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        </svg>
                                                                        {slot.students}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveRecord({ slot: { ...slot, startTime: period.startTime, endTime: period.endTime }, date: dayDateISO });
                                                                        }}
                                                                        className={`no-print w-5 h-5 flex items-center justify-center rounded bg-white border transition ${
                                                                            hasRecord
                                                                                ? "border-amber-300 text-amber-500 hover:bg-amber-50"
                                                                                : "border-gray-200 text-amber-300 hover:border-amber-300 hover:text-amber-500"
                                                                        }`}
                                                                        title={hasRecord ? "Edit record" : "Add record"}
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {(() => {
                                                                const comments = slot.comments || [];
                                                                if (!comments.length) return null;
                                                                const isUpcoming = comments[0].isUpcoming;
                                                                return (
                                                                    <div
                                                                        className={`no-print mt-4 flex items-start gap-1 px-1.5 py-1 rounded-md ${isUpcoming ? "opacity-60" : ""}`}
                                                                        style={
                                                                            hasColor
                                                                                ? { backgroundColor: color + "25", border: `1px solid ${color}40` }
                                                                                : { backgroundColor: "#fef3c7", border: "1px solid #fde68a" }
                                                                        }
                                                                        title={comments.map(c => c.text).join("\n")}
                                                                    >
                                                                        <span
                                                                            className="leading-none mt-px"
                                                                            style={{ color: hasColor ? adjustColor(color, -20) : "#f59e0b" }}
                                                                        >&#9998;</span>
                                                                        <p
                                                                            className="text-[10px] leading-tight truncate flex-1"
                                                                            style={{ color: hasColor ? adjustColor(color, -50) : "#92400e" }}
                                                                        >
                                                                            <span className="font-semibold mr-1">{formatDateShort(comments[0].date)}</span>
                                                                            {comments[0].text}
                                                                        </p>
                                                                        {comments.length > 1 && (
                                                                            <span
                                                                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0"
                                                                                style={
                                                                                    hasColor
                                                                                        ? { backgroundColor: color + "35", color: adjustColor(color, -40) }
                                                                                        : { backgroundColor: "#fde68a", color: "#b45309" }
                                                                                }
                                                                            >
                                                                                +{comments.length - 1}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                        );
                                                    })() : (
                                                        <div
                                                            onClick={() => {
                                                                if (!isLocked) {
                                                                    setActiveSlot({
                                                                        id: null,
                                                                        day,
                                                                        periodId: period.id,
                                                                        subject: "",
                                                                        class: "",
                                                                        students: "",
                                                                    });
                                                                } else {
                                                                    setSelectedDay(day);
                                                                }
                                                            }}
                                                            className={`min-h-[95px] h-full rounded-lg border border-dashed flex items-center justify-center text-xs
                                                                    ${
                                                                isLocked
                                                                    ? "border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                                                    : "border-violet-200 bg-violet-50 cursor-pointer hover:bg-violet-100"
                                                            }
                                                                `}
                                                        >
                                                            {!isLocked && (
                                                                <span className="text-violet-500">
                                                                        + Add
                                                                    </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </Fragment>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                {/* Print-only signature section */}
                <div className="print-only hidden print-signature">
                    <div className="flex justify-between items-end px-6 pt-40 pb-4">
                        <div className="text-center">
                            <div className="w-48 border-b border-black mb-1"></div>
                            <p className="text-xs">Principal's Signature</p>
                        </div>
                        <div className="text-center">
                            <div className="w-48 border-b border-black mb-1"></div>
                            <p className="text-xs">Date</p>
                        </div>
                        <div className="text-center">
                            <div className="w-48 border-b border-black mb-1"></div>
                            <p className="text-xs">Sectional Head</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {activeSlot && (
                <EditSlotModal
                    slot={activeSlot}
                    onClose={() => setActiveSlot(null)}
                    onSave={handleSaveSlot}
                />
            )}

            {activePeriod && (
                <EditPeriodModal
                    period={activePeriod}
                    onClose={() => setActivePeriod(null)}
                    onSave={handleSavePeriod}
                />
            )}

            {selectedDay && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedDay(null)}>
                    <div className="bg-gray-50 w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b bg-white flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">{selectedDay}'s Schedule</h3>
                                {selectedDay === todayName && <p className="text-xs text-emerald-500 font-medium">Today</p>}
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4">
                            <DaySchedule day={selectedDay} isToday={selectedDay === todayName} />
                        </div>
                    </div>
                </div>
            )}

            {activeRecord && (
                <LessonRecordModal
                    slot={activeRecord.slot}
                    date={activeRecord.date}
                    onClose={() => setActiveRecord(null)}
                />
            )}
        </div>
    );
}

export default WeeklyTimetable;
