/**
 * Periods from the API already have correct start/end times with interval gaps.
 * This helper detects where intervals fall between consecutive periods and returns
 * an ordered list of { type: "period", ...period } and { type: "interval", startTime, endTime } items.
 */
export function getDisplayItems(periods, intervals = []) {
    if (!periods.length) return [];

    const items = [];

    // Build a set of intervals keyed by start time for quick lookup
    const intervalMap = {};
    intervals.forEach(iv => {
        intervalMap[iv.startTime] = iv;
    });

    for (let i = 0; i < periods.length; i++) {
        items.push({ type: "period", ...periods[i], periodIndex: i });

        // Check if there's an interval between this period and the next
        if (i < periods.length - 1) {
            const currentEnd = periods[i].endTime;
            const nextStart = periods[i + 1].startTime;

            if (currentEnd !== nextStart) {
                // There's a gap — check if it matches a known interval
                const interval = intervalMap[currentEnd];
                if (interval) {
                    items.push({ type: "interval", startTime: interval.startTime, endTime: interval.endTime });
                } else {
                    // Gap exists but no matching interval — still show it
                    items.push({ type: "interval", startTime: currentEnd, endTime: nextStart });
                }
            }
        }
    }

    return items;
}

/**
 * Backward-compatible: returns periods as-is (they already have correct times from API).
 */
export function getDisplayPeriods(periods) {
    return periods;
}
