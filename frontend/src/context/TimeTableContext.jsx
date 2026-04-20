import { createContext, useState, useEffect, useContext } from "react";
import {
  fetchSubjects,
  fetchSetup,
  fetchSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  fetchPeriods,
  updatePeriod,
  fetchIntervals,
  updateInterval,
  fetchSubjectColors,
  createSubjectColor,
  deleteSubjectColor,
  fetchHolidays,
  createHoliday,
  deleteHoliday,
  fetchRecordedDates,
} from "../api/timetableApi";
import { getThisWeekDate, getWeekSunday } from "../utils/time";

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

  // Effect 1: Static data (subjects, periods, intervals, colors, teacher)
  useEffect(() => {
    async function loadStaticData() {
      try {
        setLoading(true);
        setError(null);
        setNotConfigured(false);

        // Check config first — a 404 means the teacher hasn't set up yet
        let setupRes;
        try {
          setupRes = await fetchSetup();
        } catch (err) {
          if (err.response?.status === 404) {
            setNotConfigured(true);
            return;
          }
          throw err;
        }

        const [subjectsRes, periodsRes, intervalsRes, colorsRes] =
          await Promise.all([
            fetchSubjects(),
            fetchPeriods(),
            fetchIntervals(),
            fetchSubjectColors(),
          ]);

        const subjectNames = subjectsRes.map((s) =>
          typeof s === "string" ? s : s.name,
        );
        setSubjects(subjectNames);
        setPeriods(periodsRes);
        setIntervals(intervalsRes);

        const colorsMap = {};
        const idsMap = {};
        colorsRes.forEach((c) => {
          const subjectName = c.subject?.name || c.subject;
          if (subjectName && c.color) {
            colorsMap[subjectName] = c.color;
            idsMap[subjectName] = c.id;
          }
        });
        setSubjectColors(colorsMap);
        setSubjectColorIds(idsMap);
        setOffDays(setupRes.offDays || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStaticData();
  }, []);

  // Effect 2: Slots + holidays (depends on active week)
  useEffect(() => {
    if (notConfigured) return;

    async function loadWeekData() {
      try {
        setSlotsLoading(true);
        const weekEnd = getWeekSunday(activeWeekStart);
        const [slotsRes, holidaysRes, recordedDatesRes] = await Promise.all([
          fetchSlots(activeWeekStart),
          fetchHolidays(activeWeekStart, weekEnd),
          fetchRecordedDates(activeWeekStart),
        ]);
        setSlots(slotsRes);
        setHolidays(holidaysRes);
        setRecordedDates(recordedDatesRes);
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
