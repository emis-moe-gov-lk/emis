import { timeToMinutes, getTodayName } from "./time";

export const getCurrentOrNextSlot = (slots, now = new Date()) => {
    const today = getTodayName(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const sorted = [...slots].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    const todaySlots = sorted.filter(s => s.day === today);

    //  Ongoing
    for (const slot of todaySlots) {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);


        if (nowMinutes >= start && nowMinutes < end) {
            const duration = end - start;
            const elapsed = nowMinutes - start;

            return {
                type: "ONGOING",
                slot,
                remainingMinutes: end - nowMinutes,
                progressPercent: Math.round((elapsed / duration) * 100),
            };
        }

    }

    //  Upcoming today
    for (const slot of todaySlots) {
        const start = timeToMinutes(slot.startTime);
        if (start > nowMinutes) {
            return {
                type: "UPCOMING",
                slot,
                remainingMinutes: start - nowMinutes,
                progressPercent: 0

            };
        }
    }

    //  Next available day
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let index = days.indexOf(today);

    for (let i = 1; i <= 7; i++) {
        const nextDay = days[(index + i) % 7];
        const nextDaySlots = sorted.filter(s => s.day === nextDay);

        if (nextDaySlots.length > 0) {
            const firstSlot = nextDaySlots[0];
            return {
                type: "NEXT_DAY",
                slot: firstSlot,
                remainingMinutes:
                    timeToMinutes(firstSlot.startTime) +
                    i * 24 * 60 -
                    nowMinutes,
                progressPercent: 0

            };
        }
    }

    return null;
};
