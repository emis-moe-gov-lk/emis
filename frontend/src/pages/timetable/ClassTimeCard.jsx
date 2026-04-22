import { Link } from "react-router-dom";
import { formatDuration } from "../../utils/formatTime";
import { formatDateShort } from "../../utils/time";

function ClassTimeCard({ info }) {
    if (!info) return null;

    const { type, slot, period, remainingMinutes, progressPercent } = info;
    const isOngoing = type === "ONGOING";

    return (
        <Link to="/timetable/day" className="block">
            <div className="w-[280px] rounded-2xl bg-white border m-12 border-gray-200/80 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">

                {/* Header */}
                <div
                    className={`px-5 pt-6 pb-5 ${
                        isOngoing
                            ? "bg-gradient-to-br from-emerald-50 to-teal-50/60"
                            : type === "UPCOMING"
                                ? "bg-gradient-to-br from-amber-50 to-orange-50/60"
                                : "bg-gradient-to-br from-blue-50 to-indigo-50/60"
                    }`}
                >
                    {/* Status badge and class/subject on same row */}
                    <div className="flex items-start justify-between gap-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg shrink-0 ${
                            isOngoing
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                        }`}>
                            {isOngoing ? "Ongoing" : "Upcoming"}
                        </span>
                        <div className="text-right">
                            <p className="text-[14px] font-semibold text-gray-800">{slot.class}</p>
                            <p className={`text-[12px] ${isOngoing ? "text-emerald-600/80" : "text-amber-600/80"}`}>
                                {slot.subject}
                            </p>
                        </div>
                    </div>
                    {(() => {
                        const comments = slot.comments || [];
                        if (!comments.length) return null;
                        return (
                            <div className="mt-2.5 space-y-1">
                                {comments.map((c, i) => (
                                    <div key={i} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${
                                        c.isUpcoming
                                            ? "bg-gray-100 text-gray-500"
                                            : isOngoing
                                                ? "bg-emerald-100/60 text-emerald-700"
                                                : "bg-amber-100/60 text-amber-700"
                                    }`}>
                                        <span className="font-semibold mr-1">{formatDateShort(c.date)}</span>
                                        {c.text}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {isOngoing && (
                    <div className="px-5">
                        <div className="h-1 w-full rounded-full bg-emerald-100 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="px-5 pt-3.5 pb-3 flex justify-between">
                    <InfoPill label={isOngoing ? "Ends" : "Starts"} value={isOngoing ? period.endTime : period.startTime} />
                    <InfoPill label="Students" value={slot.students} />
                    <InfoPill label={isOngoing ? "Left" : "In"} value={formatDuration(remainingMinutes)} />
                </div>
            </div>
        </Link>
    );
}

function InfoPill({ label, value }) {
    return (
        <div className="text-center">
            <p className="text-[10px] text-gray-400 uppercase">{label}</p>
            <p className="text-[13px] font-semibold text-gray-800">{value}</p>
        </div>
    );
}

export default ClassTimeCard;
