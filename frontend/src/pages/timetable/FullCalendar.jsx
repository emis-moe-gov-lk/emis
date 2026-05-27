import React, { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

const FullCalendar = ({ onClose, events = [], show }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);

  const generateCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  useEffect(() => {
    setCalendarDays(generateCalendar(currentDate));
  }, [currentDate]);

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (d1, d2) => {
    return (
      d1 &&
      d2 &&
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const prevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentDate(prev);
  };

  const nextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  // 👉 Filter events by selected date using exact start/date fields
  const filteredEvents = events.filter((event) => {
    // support several common field names: date, start, startDate, start_time
    const dateValue = event.date || event.start || event.startDate || event.start_time;
    if (!dateValue) return false;
    const eventDate = new Date(dateValue);
    if (isNaN(eventDate)) return false;
    return isSameDay(eventDate, selectedDate);
  });

  const formatEventTime = (event) => {
    const start = event.start || event.date || event.startDate || event.start_time;
    const end = event.end || event.endDate || event.end_time;
    if (start && end) {
      const s = new Date(start);
      const e = new Date(end);
      if (!isNaN(s) && !isNaN(e)) {
        return `${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
    }
    if (start) {
      const s = new Date(start);
      if (!isNaN(s)) return s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return event.time || "TBA";
  };

  return (
    <>
      <Modal show={show} onClose={onClose} size="5xl">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/10 transition"
          >
            <IoIosArrowDropleft size={22} />
          </button>

          <h2 className="text-xl font-semibold text-gray-700 dark:text-white">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/10 transition"
          >
            <IoIosArrowDropright size={22} />
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT → CALENDAR */}
          <div className="md:col-span-2">
            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 dark:text-gray-400 mb-3 uppercase">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* CALENDAR */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDate(day)}
                  className={`h-12 flex items-center justify-center rounded-xl text-sm cursor-pointer transition
                    ${
                      day
                        ? isSameDay(day, selectedDate)
                          ? "bg-indigo-600 text-white font-bold shadow-md"
                          : isToday(day)
                            ? "bg-indigo-100 text-indigo-600 font-semibold dark:bg-indigo-900/20 dark:text-indigo-200"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        : ""
                    }
                  `}
                >
                  {day ? day.getDate() : ""}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT → EVENTS PANEL */}
          <div className="md:col-span-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 shadow-inner border dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-200 mb-3">
              Events on{" "}
              {selectedDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })}
            </h3>

            <div className="max-h-64 overflow-y-auto">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setActiveEvent(event); setShowDetailModal(true); }}
                    className="p-3 mb-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition border dark:border-slate-700 cursor-pointer"
                  >
                    <div className="text-xs text-indigo-500 font-semibold dark:text-indigo-300">
                      {formatEventTime(event)}
                    </div>
                    <div className="text-sm font-medium text-gray-700 dark:text-slate-200">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">
                      {event.location}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No events for this day</p>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 flex justify-end">
          <Button color="gray" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      </Modal>

      {activeEvent && (
        <Modal show={showDetailModal} onClose={() => setShowDetailModal(false)} size="md">
          <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
            <h2 className="text-lg font-semibold mb-2">{activeEvent.title}</h2>
            <div className="text-sm text-gray-500 mb-4">
              {new Date(activeEvent.date || activeEvent.start || activeEvent.startDate).toLocaleDateString()} • {formatEventTime(activeEvent)}
            </div>
            {activeEvent.description && (
              <p className="mb-3 text-sm text-gray-700">{activeEvent.description}</p>
            )}
            {activeEvent.location && (
              <div className="text-sm text-gray-600 mb-2">Location: {activeEvent.location}</div>
            )}
            {activeEvent.organizer && (
              <div className="text-sm text-gray-600 mb-2">Organizer: {activeEvent.organizer}</div>
            )}
            {activeEvent.attendees && Array.isArray(activeEvent.attendees) && (
              <div className="text-sm text-gray-600 mb-2">Attendees: {activeEvent.attendees.join(', ')}</div>
            )}

            <div className="mt-4 flex justify-end">
              <Button color="gray" onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default FullCalendar;
