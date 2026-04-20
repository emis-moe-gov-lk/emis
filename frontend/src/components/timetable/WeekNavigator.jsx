import { useTimetable } from "../../context/TimetableContext";
import { shiftWeek, getWeekSunday, getThisWeekDate, formatDateShort, getWeekMonday, toLocalISO } from "../../utils/time";

function WeekNavigator() {
    const { activeWeekStart, setActiveWeekStart, slotsLoading } = useTimetable();

    const goToPrevWeek = () => setActiveWeekStart(shiftWeek(activeWeekStart, -1));
    const goToNextWeek = () => setActiveWeekStart(shiftWeek(activeWeekStart, 1));
    const goToThisWeek = () => setActiveWeekStart(getThisWeekDate("Monday"));

    const sundayISO = getWeekSunday(activeWeekStart);
    const isThisWeek = activeWeekStart === getThisWeekDate("Monday");

    const handleMonthChange = (e) => {
        const val = e.target.value; // "YYYY-MM"
        if (!val) return;
        const [y, m] = val.split("-").map(Number);
        const firstOfMonth = new Date(y, m - 1, 1);
        setActiveWeekStart(getWeekMonday(toLocalISO(firstOfMonth)));
    };

    // Derive current YYYY-MM for the month input value
    const [wy, wm] = activeWeekStart.split("-").map(Number);
    const monthValue = `${wy}-${String(wm).padStart(2, "0")}`;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
                <button
                    onClick={goToPrevWeek}
                    disabled={slotsLoading}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 text-sm font-bold transition"
                >
                    &#8592;
                </button>
                <span className="text-xs sm:text-sm font-semibold text-gray-700 px-1 whitespace-nowrap">
                    {formatDateShort(activeWeekStart)} – {formatDateShort(sundayISO)}
                </span>
                <button
                    onClick={goToNextWeek}
                    disabled={slotsLoading}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 text-sm font-bold transition"
                >
                    &#8594;
                </button>
            </div>

            {!isThisWeek && (
                <button
                    onClick={goToThisWeek}
                    disabled={slotsLoading}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 transition"
                >
                    Today
                </button>
            )}

            <input
                type="month"
                value={monthValue}
                onChange={handleMonthChange}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
            />

            {slotsLoading && (
                <span className="text-[11px] text-gray-400 animate-pulse">Loading...</span>
            )}
        </div>
    );
}

export default WeekNavigator;
