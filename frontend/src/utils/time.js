export const timeToMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

export const getTodayName = (date = new Date()) =>
    date.toLocaleDateString("en-US", { weekday: "long" });

export const minutesUntil = (from, to) => to - from;

/* -------- date helpers for comments -------- */

const DAY_INDEX = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6,
};

/** "2026-02-06" — timezone-safe local ISO string */
export const toLocalISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

/** "Feb 6" style short label from an ISO string */
export const formatDateShort = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/** All occurrences of a given weekday for the next `months` months */
export const getUpcomingDates = (dayName, months = 3) => {
    const target = DAY_INDEX[dayName];
    const today = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + months);

    const cur = new Date(today);
    const diff = (target - cur.getDay() + 7) % 7;
    cur.setDate(cur.getDate() + (diff === 0 ? 0 : diff));

    const dates = [];
    while (cur <= end) {
        dates.push(toLocalISO(new Date(cur)));
        cur.setDate(cur.getDate() + 7);
    }
    return dates;
};

/** Split a date range into per-calendar-month chunks.
 *  Returns [{ start, end, label }] where label is e.g. "January 2026". */
export const splitIntoMonths = (startISO, endISO) => {
    const [sy, sm, sd] = startISO.split("-").map(Number);
    const [ey, em, ed] = endISO.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    const chunks = [];
    const cur = new Date(start);

    while (cur <= end) {
        const chunkStart = toLocalISO(cur);
        // last day of this month
        const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
        const chunkEnd = monthEnd <= end ? toLocalISO(monthEnd) : toLocalISO(end);
        const label = cur.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        chunks.push({ start: chunkStart, end: chunkEnd, label });
        // move to 1st of next month
        cur.setFullYear(monthEnd.getFullYear());
        cur.setMonth(monthEnd.getMonth() + 1);
        cur.setDate(1);
    }
    return chunks;
};

/** Monday ISO date of the week containing a given date */
export const getWeekMonday = (dateISO) => {
    const [y, m, d] = dateISO.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dow = date.getDay(); // 0=Sun
    const offset = dow === 0 ? -6 : 1 - dow;
    date.setDate(date.getDate() + offset);
    return toLocalISO(date);
};

/** Shift a Monday ISO date by N weeks (+1 = next, -1 = prev) */
export const shiftWeek = (mondayISO, weeks) => {
    const [y, m, d] = mondayISO.split("-").map(Number);
    const date = new Date(y, m - 1, d + weeks * 7);
    return toLocalISO(date);
};

/** Sunday ISO date from a Monday ISO date */
export const getWeekSunday = (mondayISO) => {
    const [y, m, d] = mondayISO.split("-").map(Number);
    const date = new Date(y, m - 1, d + 6);
    return toLocalISO(date);
};

/** Calendar grid for a month: array of 28-42 day objects (Mon-Sun weeks).
 *  month is 0-indexed. */
export const getCalendarGrid = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from Monday of the week containing the 1st
    const startDow = firstDay.getDay();
    const startOffset = startDow === 0 ? -6 : 1 - startDow;
    const gridStart = new Date(year, month, 1 + startOffset);

    // End on Sunday of the week containing the last day
    const endDow = lastDay.getDay();
    const endOffset = endDow === 0 ? 0 : 7 - endDow;
    const gridEnd = new Date(lastDay);
    gridEnd.setDate(gridEnd.getDate() + endOffset);

    const days = [];
    const cur = new Date(gridStart);
    while (cur <= gridEnd) {
        days.push({
            date: toLocalISO(cur),
            dayName: cur.toLocaleDateString("en-US", { weekday: "long" }),
            isCurrentMonth: cur.getMonth() === month,
            dayOfMonth: cur.getDate(),
        });
        cur.setDate(cur.getDate() + 1);
    }
    return days;
};

/** "YYYY-MM" from year and 0-indexed month */
export const formatYearMonth = (year, month) =>
    `${year}-${String(month + 1).padStart(2, "0")}`;

/** ISO date string for a given weekday in the current Mon–Sun week */
export const getThisWeekDate = (dayName) => {
    const target = DAY_INDEX[dayName];
    const today = new Date();
    // JS getDay(): 0=Sun..6=Sat → convert to Mon-based: 0=Mon..6=Sun
    const todayMon = (today.getDay() + 6) % 7;
    const targetMon = (target + 6) % 7;
    const diff = targetMon - todayMon;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return toLocalISO(date);
};
