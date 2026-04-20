import React from "react";

const WeeklySchedule = ({
  monthLabel,
  weekDays,
  selectedDate,
  todayEvents,
  onPrevWeek,
  onNextWeek,
  onSelectDay,
  onViewFullCalendar,
}) => {
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 p-8 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800">Weekly Schedule</h3>
          <p className="text-sm text-slate-400 font-medium">{monthLabel}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPrevWeek}
            className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={onNextWeek}
            className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-400 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* WEEK DAYS */}
      <div className="flex justify-between items-center mb-10 bg-slate-50/50 p-2 rounded-2xl border border-slate-50">
        {weekDays.map((day, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </span>

            <div
              onClick={() => onSelectDay(day)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 cursor-pointer
              ${
                isSameDay(day, selectedDate)
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-600 hover:bg-white hover:shadow-sm"
              }`}
            >
              {day.getDate()}

              {isToday(day) && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-emerald-500"></span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* EVENTS */}
      <div className="space-y-4 flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
          {isToday(selectedDate)
            ? "Today's Briefing"
            : selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              })}
        </p>

        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {todayEvents.length > 0 ? (
            todayEvents.map((event, index) => (
              <div
                key={index}
                className="group cursor-pointer p-4 rounded-2xl bg-slate-50 hover:bg-indigo-600 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-indigo-600 group-hover:text-indigo-200 uppercase">
                    {event.time}
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 group-hover:bg-white"></div>
                </div>

                <h4 className="text-sm font-bold text-slate-800 group-hover:text-white">
                  {event.title}
                </h4>
                <p className="text-xs text-slate-500 group-hover:text-indigo-100">
                  {event.location}
                </p>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <h3 className="text-lg font-medium text-slate-600">
                Quiet day ahead
              </h3>
              <p className="text-sm text-slate-400 text-center max-w-xs">
                No scheduled events for this day. Check back later or create a
                new event.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={onViewFullCalendar}
        className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
      >
        View Full Calendar
      </button>
    </div>
  );
};

export default WeeklySchedule;
