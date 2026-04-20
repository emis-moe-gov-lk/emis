import api from "./axios";

// Subjects (global)
export async function fetchSubjects() {
    const response = await api.get("/v1/subjects");
    return response.data;
}

// Setup / config
export async function fetchSetup() {
    const response = await api.get("/v1/timetable/setup");
    return response.data;
}

export async function saveSetup(data) {
    const response = await api.post("/v1/timetable/setup", data);
    return response.data;
}

// Slots
export async function fetchSlots(weekStart) {
    const response = await api.get("/v1/timetable/slots", {
        params: weekStart ? { week_start: weekStart } : {},
    });
    return response.data;
}

export async function fetchSlotComments(slotId) {
    const response = await api.get(`/v1/timetable/slots/${slotId}/comments`);
    return response.data;
}

export async function createSlot(slotData) {
    const response = await api.post("/v1/timetable/slots", slotData);
    return response.data;
}

export async function updateSlot(id, slotData) {
    const response = await api.put(`/v1/timetable/slots/${id}`, slotData);
    return response.data;
}

export async function deleteSlot(id) {
    await api.delete(`/v1/timetable/slots/${id}`);
}

// Slots for a full month
export async function fetchMonthSlots(monthStart) {
    const response = await api.get("/v1/timetable/slots", {
        params: { month_start: monthStart },
    });
    return response.data;
}

// Periods
export async function fetchPeriods() {
    const response = await api.get("/v1/timetable/periods");
    return response.data;
}

export async function updatePeriod(id, periodData) {
    const response = await api.put(`/v1/timetable/periods/${id}`, periodData);
    return response.data;
}

// Intervals
export async function fetchIntervals() {
    const response = await api.get("/v1/timetable/intervals");
    return response.data;
}

export async function updateInterval(id, intervalData) {
    const response = await api.put(`/v1/timetable/intervals/${id}`, intervalData);
    return response.data;
}

// Subject Colors
export async function fetchSubjectColors() {
    const response = await api.get("/v1/timetable/subject-colors");
    return response.data;
}

export async function createSubjectColor(colorData) {
    const response = await api.post("/v1/timetable/subject-colors", colorData);
    return response.data;
}

export async function deleteSubjectColor(subjectColorId) {
    await api.delete(`/v1/timetable/subject-colors/${subjectColorId}`);
}

// Holidays
export async function fetchHolidays(start, end) {
    const response = await api.get("/v1/timetable/holidays", {
        params: { start, end },
    });
    return response.data;
}

export async function createHoliday(data) {
    const response = await api.post("/v1/timetable/holidays", data);
    return response.data;
}

export async function deleteHoliday(holidayId) {
    await api.delete(`/v1/timetable/holidays/${holidayId}`);
}

// Lesson Records
export async function fetchLessonRecords({ startDate, endDate, className, subject } = {}) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (className) params.class = className;
    if (subject) params.subject = subject;
    const response = await api.get("/v1/timetable/lesson-records", { params });
    return response.data;
}

export async function fetchLessonRecordsBySlot(slotId, date) {
    const response = await api.get(`/v1/timetable/lesson-records/by-slot/${slotId}`, {
        params: date ? { date } : {},
    });
    return response.data;
}

export async function fetchRecordedDates(weekStart) {
    const response = await api.get("/v1/timetable/lesson-records/dates", {
        params: { week_start: weekStart },
    });
    return response.data;
}

export async function createLessonRecord(data) {
    const response = await api.post("/v1/timetable/lesson-records", data);
    return response.data;
}

export async function updateLessonRecord(id, data) {
    const response = await api.put(`/v1/timetable/lesson-records/${id}`, data);
    return response.data;
}

export async function deleteLessonRecord(id) {
    await api.delete(`/v1/timetable/lesson-records/${id}`);
}

// Current class (dashboard widget)
export async function fetchCurrentClass() {
    const response = await api.get("/v1/timetable/current-class");
    return response.data;
}

// Report
export async function fetchReport(startDate, endDate) {
    const response = await api.get("/v1/timetable/report", {
        params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
}
