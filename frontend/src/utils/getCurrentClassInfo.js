import { timeToMinutes } from "./time";

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export function getCurrentClassInfo(periods, slots) {
    // Periods from API already have correct times (interval gaps baked in)
    const now = new Date();
    const today = DAYS[now.getDay()];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // 1. Find current period index
    let currentPeriodIndex = -1;

    for (let i = 0; i < periods.length; i++) {
        const start = timeToMinutes(periods[i].startTime);
        const end = timeToMinutes(periods[i].endTime);

        if (nowMinutes >= start && nowMinutes < end) {
            currentPeriodIndex = i;
            break;
        }
    }

    // 2. Ongoing class
    if (currentPeriodIndex !== -1) {
        const currentPeriod = periods[currentPeriodIndex];
        const slot = slots.find(
            (s) => s.day === today && s.periodId === currentPeriod.id
        );

        if (slot) {
            const start = timeToMinutes(currentPeriod.startTime);
            const end = timeToMinutes(currentPeriod.endTime);
            const duration = end - start;
            const elapsed = nowMinutes - start;

            return {
                type: "ONGOING",
                slot,
                period: currentPeriod,
                remainingMinutes: end - nowMinutes,
                progressPercent: Math.round((elapsed / duration) * 100),
            };
        }
    }

    // 3. Upcoming class (today)
    const searchFrom = currentPeriodIndex !== -1 ? currentPeriodIndex + 1 : 0;

    for (let i = searchFrom; i < periods.length; i++) {
        const period = periods[i];
        const start = timeToMinutes(period.startTime);

        if (nowMinutes >= start + (timeToMinutes(period.endTime) - start)) continue;
        if (nowMinutes >= start && currentPeriodIndex === -1) continue;

        const slot = slots.find(
            (s) => s.day === today && s.periodId === period.id
        );

        if (slot) {
            return {
                type: "UPCOMING",
                slot,
                period,
                remainingMinutes: start - nowMinutes,
                progressPercent: 0,
            };
        }
    }

    // 4. Day finished - find next day with a class
    for (let d = 1; d <= 7; d++) {
        const nextDayIndex = (now.getDay() + d) % 7;
        const nextDay = DAYS[nextDayIndex];

        for (const period of periods) {
            const slot = slots.find(
                (s) => s.day === nextDay && s.periodId === period.id
            );

            if (slot) {
                const dayStart = timeToMinutes(period.startTime);
                const minutesUntilMidnight = 24 * 60 - nowMinutes;

                return {
                    type: "UPCOMING",
                    slot,
                    period,
                    remainingMinutes: minutesUntilMidnight + (d - 1) * 24 * 60 + dayStart,
                    progressPercent: 0,
                };
            }
        }
    }

    return null;
}
