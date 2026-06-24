import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronRight, Inbox } from "lucide-react";
import { getZonalEditRequests } from "@/api/userService";

const EditRequestsPanel = () => {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getZonalEditRequests({ per_page: 5 });
        if (res.data?.status === "success") {
          setRequests(res.data.data?.data ?? []);
          setTotal(res.data.data?.total ?? 0);
        }
      } catch (err) {
        console.error("Failed to fetch zonal edit requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Clock size={15} className="text-indigo-500" />
          Pending Edit Requests
          {total > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {total}
            </span>
          )}
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-600">
          <Inbox size={28} className="mb-2" />
          <p className="text-xs">No pending edit requests</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => {
            const teacherName =
              req.person?.name_with_initials || req.person?.full_name || "—";
            const institution =
              req.person?.current_appointment?.workplace?.institution?.name ||
              null;
            const subject = req.requested_changes?.subject || "Edit Request";

            return (
              <li key={req.id}>
                <Link
                  to={`/teacher/${req.people_id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 bg-white dark:bg-gray-700/60 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {teacherName}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {subject}
                      {institution ? ` · ${institution}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {req.created_ago}
                    </span>
                    <ChevronRight
                      size={13}
                      className="text-gray-400 group-hover:text-indigo-500 transition-colors"
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default EditRequestsPanel;
