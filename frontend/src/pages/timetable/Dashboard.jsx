import { useTimetable } from "../../context/TimetableContext";
import { getCurrentClassInfo } from "../../utils/getCurrentClassInfo";
import ClassTimeCard from "./ClassTimeCard";

function Dashboard() {
    const { periods, slots } = useTimetable();

    const info = getCurrentClassInfo(periods, slots);

    return (
        <div>
            {info ? (
                <ClassTimeCard info={info} />
            ) : (
                <div className="w-[280px] rounded-2xl bg-white border border-gray-200/80 shadow-sm p-6 text-center">
                    <p className="text-sm text-gray-500">No upcoming classes</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
