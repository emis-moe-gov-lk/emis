import { useState, useEffect } from "react";
import { fetchCurrentClass } from "@/api/timetableApi";
import ClassTimeCard from "@/pages/timetable/ClassTimeCard";

export default function TimetableWidget() {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCurrentClass()
            .then(setInfo)
            .catch(() => setInfo(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="w-full rounded-3xl border border-gray-100 bg-gray-50/50 p-6 shadow-sm text-center">
                <p className="text-sm font-medium text-gray-500">Loading...</p>
            </div>
        );
    }

    if (!info) {
        return (
            <div className="w-full rounded-3xl border border-gray-100 bg-gray-50/50 p-6 shadow-sm text-center">
                <p className="text-sm font-medium text-gray-500">No upcoming classes</p>
            </div>
        );
    }

    return <ClassTimeCard info={info} />;
}
