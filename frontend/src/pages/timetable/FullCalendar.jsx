import React, { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";

const FullCalendar = ({ onClose, events = [], show }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // 👉 Filter events by selected date
  const filteredEvents = events.filter((event) => {
    if (!event.date) return true; // fallback if no date field
    const eventDate = new Date(event.date);
    return isSameDay(eventDate, selectedDate);
  });

  return (
    <Modal show={show} onClose={onClose} size="5xl">
      <div className="p-6 bg-white rounded-2xl shadow-2xl">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full bg-gray-100 hover:bg-indigo-100 transition"
          >
            <IoIosArrowDropleft size={22} />
          </button>

          <h2 className="text-xl font-semibold text-gray-700">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-full bg-gray-100 hover:bg-indigo-100 transition"
          >
            <IoIosArrowDropright size={22} />
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* LEFT → CALENDAR */}
          <div className="md:col-span-2">
            {/* WEEK DAYS */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-3 uppercase">
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
                            ? "bg-indigo-100 text-indigo-600 font-semibold"
                            : "hover:bg-gray-100"
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
          <div className="md:col-span-3 bg-gray-50 rounded-xl p-4 shadow-inner border">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">
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
                    className="p-3 mb-2 rounded-lg bg-white shadow-sm hover:shadow-md transition border"
                  >
                    <div className="text-xs text-indigo-500 font-semibold">
                      {event.time}
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-400">
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
  );
};

export default FullCalendar;
