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
                <div className="w-[280px] rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700 shadow-sm dark:shadow-gray-900/20 p-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming classes</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
