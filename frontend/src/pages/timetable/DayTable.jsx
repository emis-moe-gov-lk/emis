import { Link } from "react-router-dom";
import DaySchedule from "../../components/timetable/DaySchedule";

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

function DayTable() {
    const today = DAYS[new Date().getDay()];

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Today's Schedule
                    </h2>
                    <p className="text-[13px] text-gray-400 font-medium">
                        {today}
                    </p>
                </div>

                <div className="flex items-center justify-between mb-6">
                <Link
                    to="../"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                    Current slot
                </Link>

                <Link
                    to="../weekly"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                >
                    Week view →
                </Link>
                </div>
            </div>

            <DaySchedule day={today} isToday={true} />
        </div>
    );
}

export default DayTable;
