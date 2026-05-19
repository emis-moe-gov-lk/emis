import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTimetable } from "../../context/TimeTableContext";
import { fetchMonthSlots, fetchHolidays } from "../../api/timetableApi";
import {
  getCalendarGrid,
  formatYearMonth,
  getWeekMonday,
  toLocalISO,
} from "../../utils/time";

/* Helper to darken a hex color for text readability */
function adjustColor(hex, amount) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MonthlyTimetable() {
  const { subjectColors, offDays } = useTimetable();
  const navigate = useNavigate();

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [monthSlots, setMonthSlots] = useState([]);
  const [monthHolidays, setMonthHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const monthStr = formatYearMonth(year, month);
    const startDate = `${monthStr}-01`;
    const lastDay = new Date(year, month + 1, 0);
    const endDate = toLocalISO(lastDay);

    Promise.all([fetchMonthSlots(monthStr), fetchHolidays(startDate, endDate)])
      .then(([slots, holidays]) => {
        if (!cancelled) {
          setMonthSlots(slots);
          setMonthHolidays(holidays);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const calendarDays = getCalendarGrid(year, month);
  const todayISO = toLocalISO(new Date());

  const getSlotsForDay = (dayInfo) =>
    monthSlots.filter(
      (s) =>
        (s.date === null && s.day === dayInfo.dayName) ||
        s.date === dayInfo.date,
    );

  const getHoliday = (dateISO) => monthHolidays.find((h) => h.date === dateISO);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const goToToday = () => {
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth());
  };

  const handleDayClick = (dayInfo) => {
    const monday = getWeekMonday(dayInfo.date);
    navigate(`../weekly?week=${monday}`);
  };

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  return (
    <div className="p-3 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
              Monthly Overview
            </h2>
            <Link
              to="../weekly"
              className="text-[13px] font-medium text-gray-500 dark:text-slate-300 hover:text-gray-800 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              ← Week View
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 text-sm font-bold transition"
            >
              &#8592;
            </button>
            <span className="text-sm font-semibold text-gray-700 dark:text-white min-w-[140px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={nextMonth}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 text-sm font-bold transition"
            >
              &#8594;
            </button>
            {!isCurrentMonth && (
              <button
                onClick={goToToday}
                disabled={loading}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition"
              >
                Today
              </button>
            )}
            {loading && (
              <span className="text-[11px] text-gray-400 animate-pulse">
                Loading...
              </span>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 border-b bg-gray-50 dark:bg-gray-900/10">
              {SHORT_DAYS.map((d) => (
                <div
                  key={d}
                  className="px-2 py-2.5 text-[11px] font-semibold text-gray-500 text-center uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayInfo) => {
                const daySlots = getSlotsForDay(dayInfo);
                const isOff = offDays.includes(dayInfo.dayName);
                const isToday = dayInfo.date === todayISO;
                const holiday =
                  dayInfo.isCurrentMonth && getHoliday(dayInfo.date);

                return (
                  <div
                    key={dayInfo.date}
                    onClick={() => handleDayClick(dayInfo)}
                    className={`min-h-[90px] sm:min-h-[110px] border-b border-r p-1.5 cursor-pointer transition hover:bg-gray-50/80
                                            ${!dayInfo.isCurrentMonth ? "bg-gray-50/60 opacity-50" : ""}
                                            ${holiday ? "bg-teal-50/40" : ""}
                                            ${isOff && dayInfo.isCurrentMonth && !holiday ? "bg-red-50/30" : ""}
                                            ${isToday ? "ring-2 ring-inset ring-blue-400 bg-blue-50/20 dark:bg-blue-900/20" : ""}
                                        `}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        holiday
                          ? "text-teal-600 font-bold"
                          : isToday
                            ? "text-blue-600 font-bold"
                            : isOff
                              ? "text-red-400"
                              : "text-gray-500"
                      }`}
                    >
                      {dayInfo.dayOfMonth}
                    </div>

                    {holiday && dayInfo.isCurrentMonth ? (
                      <div className="text-[10px] text-teal-500 font-medium pl-1">
                        Holiday
                        {holiday.reason && (
                          <span className="block text-[9px] text-teal-400 font-normal truncate">
                            {holiday.reason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {daySlots.slice(0, 4).map((slot, i) => {
                          const color = subjectColors[slot.subject];
                          return (
                            <div
                              key={`${slot.id}-${i}`}
                              className="text-[10px] leading-tight truncate rounded px-1 py-0.5"
                              style={{
                                backgroundColor: color
                                  ? color + "25"
                                  : "#f3f4f6",
                                color: color
                                  ? adjustColor(color, -60)
                                  : "#6b7280",
                              }}
                            >
                              {slot.subject}
                            </div>
                          );
                        })}
                        {daySlots.length > 4 && (
                          <div className="text-[9px] text-gray-400 pl-1">
                            +{daySlots.length - 4} more
                          </div>
                        )}
                        {daySlots.length === 0 &&
                          dayInfo.isCurrentMonth &&
                          !isOff && (
                            <div className="text-[9px] text-gray-300 pl-1">
                              No classes
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyTimetable;
