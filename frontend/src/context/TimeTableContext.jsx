import { createContext, useState, useEffect, useContext } from "react";
import {
  fetchInit,
  fetchWeek,
  createSlot,
  updateSlot,
  deleteSlot,
  updatePeriod,
  updateInterval,
  createSubjectColor,
  deleteSubjectColor,
  createHoliday,
  deleteHoliday,
} from "../api/timetableApi";
import { getThisWeekDate } from "../utils/time";

// const TimetableContext = createContext(null);
const TimetableContext = createContext(null);

export function TimetableProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [slots, setSlots] = useState([]);
  const [intervals, setIntervals] = useState([]);
  const [subjectColors, setSubjectColors] = useState({});
  // Map subject name -> subjectColor record id (for deletion)
  const [subjectColorIds, setSubjectColorIds] = useState({});
  const [offDays, setOffDays] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [recordedDates, setRecordedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const [activeWeekStart, setActiveWeekStart] = useState(() =>
    getThisWeekDate("Monday"),
  );

  // Effect 1: Static data via single /init request
  useEffect(() => {
    async function loadStaticData() {
      try {
        setLoading(true);
        setError(null);
        setNotConfigured(false);

        let initRes;
        try {
          initRes = await fetchInit();
        } catch (err) {
          if (err.response?.status === 404) {
            setNotConfigured(true);
            return;
          }
          throw err;
        }

        setPeriods(initRes.periods);
        setIntervals(initRes.intervals);
        setOffDays(initRes.offDays || []);
        setSubjects(initRes.subjects.map((s) => s.name));

        const colorsMap = {};
        const idsMap = {};
        initRes.subjectColors.forEach((c) => {
          if (c.subject && c.color) {
            colorsMap[c.subject] = c.color;
            idsMap[c.subject] = c.id;
          }
        });
        setSubjectColors(colorsMap);
        setSubjectColorIds(idsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStaticData();
  }, []);

  // Effect 2: Week data via single /week request
  useEffect(() => {
    if (notConfigured) return;

    async function loadWeekData() {
      try {
        setSlotsLoading(true);
        const weekRes = await fetchWeek(activeWeekStart);
        setSlots(weekRes.slots);
        setHolidays(weekRes.holidays);
        setRecordedDates(weekRes.recordedDates);
      } catch (err) {
        setError(err.message);
      } finally {
        setSlotsLoading(false);
      }
    }

    loadWeekData();
  }, [activeWeekStart, notConfigured]);

  const saveSlot = async (slotData) => {
    if (slotData.id === null) {
      const newSlot = await createSlot(slotData);
      setSlots((prev) => [...prev, newSlot]);
      return newSlot;
    } else {
      const updatedSlot = await updateSlot(slotData.id, slotData);
      setSlots((prev) =>
        prev.map((s) => (s.id === slotData.id ? updatedSlot : s)),
      );
      return updatedSlot;
    }
  };

  const removeSlot = async (id) => {
    await deleteSlot(id);
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const savePeriod = async (periodData) => {
    const allPeriods = await updatePeriod(periodData.id, periodData);
    setPeriods(allPeriods);
    return allPeriods;
  };

  const saveInterval = async (intervalData) => {
    const result = await updateInterval(intervalData.id, intervalData);
    setPeriods(result.periods);
    setIntervals(result.intervals);
    return result;
  };

  const toggleHoliday = async (date, reason = null) => {
    const existing = holidays.find((h) => h.date === date);
    if (existing) {
      await deleteHoliday(existing.id);
      setHolidays((prev) => prev.filter((h) => h.id !== existing.id));
      return { action: "removed" };
    } else {
      const result = await createHoliday({ date, reason });
      setHolidays((prev) => [
        ...prev,
        { id: result.id, date: result.date, reason: result.reason },
      ]);
      return { action: "added", conflictingSlots: result.conflictingSlots };
    }
  };

  const saveSubjectColor = async (subject, color) => {
    const existingColor = subjectColors[subject];

    if (color) {
      const result = await createSubjectColor({ subject, color });
      setSubjectColors((prev) => ({ ...prev, [subject]: color }));
      setSubjectColorIds((prev) => ({ ...prev, [subject]: result.id }));
    } else if (existingColor) {
      const colorId = subjectColorIds[subject];
      if (colorId) {
        await deleteSubjectColor(colorId);
      }
      setSubjectColors((prev) => {
        const updated = { ...prev };
        delete updated[subject];
        return updated;
      });
      setSubjectColorIds((prev) => {
        const updated = { ...prev };
        delete updated[subject];
        return updated;
      });
    }
  };

  return (
    <TimetableContext.Provider
      value={{
        subjects,
        periods,
        slots,
        intervals,
        subjectColors,
        offDays,
        holidays,
        recordedDates,
        setRecordedDates,
        loading,
        slotsLoading,
        error,
        notConfigured,
        activeWeekStart,
        setActiveWeekStart,
        saveSlot,
        removeSlot,
        savePeriod,
        saveInterval,
        toggleHoliday,
        saveSubjectColor,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);

  if (!context) {
    throw new Error("useTimetable must be used inside a TimetableProvider");
  }

  return context;
}
