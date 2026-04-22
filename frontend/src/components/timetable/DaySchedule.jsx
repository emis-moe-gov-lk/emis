import { useTimetable } from "../../context/TimetableContext";
import { getDisplayItems } from "../../utils/getDisplayPeriods";
import { timeToMinutes, toLocalISO } from "../../utils/time";

const STATUS_THEME = {
  ongoing: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    sub: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-600",
    dot: "bg-emerald-500 animate-pulse",
    label: "Ongoing",
  },
  completed: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-500",
    sub: "text-gray-400",
    badge: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
    label: "Completed",
  },
  upcoming: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    sub: "text-amber-500",
    badge: "bg-amber-100 text-amber-600",
    dot: "bg-amber-500",
    label: "Upcoming",
  },
};

const DAYS_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function DaySchedule({ day, isToday }) {
  const { periods, slots, intervals, offDays } = useTimetable();
  const displayItems = getDisplayItems(periods, intervals);
  const isOffDay = offDays.includes(day);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const getSlot = (periodId) =>
    slots.find((s) => s.day === day && s.periodId === periodId);

  const getStatus = (item) => {
    if (!isToday) return "upcoming";
    const start = timeToMinutes(item.startTime);
    const end = timeToMinutes(item.endTime);
    if (nowMinutes >= start && nowMinutes < end) return "ongoing";
    if (nowMinutes >= end) return "completed";
    return "upcoming";
  };

  const hasSlots = slots.some((s) => s.day === day);

  if (isOffDay && !hasSlots) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-12 text-center">
        <p className="text-sm text-gray-500">{day} is an off day.</p>
        <p className="text-xs text-gray-400 mt-1">No classes scheduled.</p>
      </div>
    );
  }

  const renderCell = (item) => {
    const slot = getSlot(item.id);

    if (!slot) {
      return (
        <div className="rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/40 p-3 h-full flex items-center justify-center">
          <span className="text-xs text-gray-300 font-medium">Free</span>
        </div>
      );
    }

    const status = getStatus(item);
    const t = STATUS_THEME[status];

    return (
      <div
        className={`rounded-xl ${isOffDay ? "bg-orange-50 border-orange-200" : `${t.bg} ${t.border}`} border p-3 h-full`}
      >
        {isOffDay && (
          <div className="mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
              Special
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p
            className={`text-[13px] font-bold ${isOffDay ? "text-orange-800" : t.text} leading-tight`}
          >
            {slot.subject}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-lg ${isOffDay ? "bg-orange-100 text-orange-600" : t.badge}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOffDay ? "bg-orange-500" : t.dot}`}
            />
            {isOffDay ? "Special" : t.label}
          </span>
        </div>

        <p
          className={`text-[11px] ${isOffDay ? "text-orange-600" : t.sub} mt-1 font-medium`}
        >
          {slot.class}
        </p>
        {isOffDay && slot.purpose && (
          <p className="text-[11px] text-orange-600/80 italic mt-0.5">
            {slot.purpose}
          </p>
        )}

        <div
          className={`mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${isOffDay ? "bg-orange-100 text-orange-600" : t.badge}`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {slot.students}
        </div>
        {(() => {
          const todayISO = toLocalISO(new Date());
          const todayComments =
            slot.comments?.filter((c) => c.date === todayISO) || [];
          if (!todayComments.length) return null;
          return (
            <div className="mt-2 space-y-1">
              {todayComments.map((c, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-1.5 px-2 py-1.5 rounded-lg ${t.badge}`}
                >
                  <span className="leading-none mt-px text-[10px]">
                    &#9998;
                  </span>
                  <p className="text-[11px] leading-tight">{c.text}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    );
  };

  let periodCounter = 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {isOffDay && (
        <div className="px-4 py-2 bg-orange-50 border-b border-orange-200 text-center">
          <span className="text-xs font-medium text-orange-600">
            Off Day — Special Classes Only
          </span>
        </div>
      )}
      {displayItems.map((item, index) => {
        if (item.type === "interval") {
          return (
            <div
              key={`interval-${index}`}
              className="flex bg-amber-50/40 border-b border-gray-100"
            >
              <div className="w-20 shrink-0 bg-amber-50/60 flex flex-col items-center justify-center py-2.5 border-r border-gray-100">
                <p className="text-[10px] text-amber-400 font-medium">
                  {item.startTime}
                </p>
                <p className="text-[10px] text-amber-400 font-medium">
                  {item.endTime}
                </p>
              </div>
              <div className="flex-1 flex items-center gap-3 px-4">
                <div className="h-px flex-1 bg-amber-200/60" />
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  Interval
                </span>
                <div className="h-px flex-1 bg-amber-200/60" />
              </div>
            </div>
          );
        }

        periodCounter++;
        return (
          <div key={item.id} className="flex border-b border-gray-100">
            <div className="w-20 shrink-0 bg-gray-50 flex flex-col items-center justify-center py-4 border-r border-gray-100">
              <span className="text-xs font-bold text-gray-500">
                P{periodCounter}
              </span>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                {item.startTime}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                {item.endTime}
              </p>
            </div>
            <div className="flex-1 p-2">{renderCell(item)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default DaySchedule;
