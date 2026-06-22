import { Clock, X, CheckCircle, User, FileSearch } from "lucide-react";

export default function EditRequestTimeline({ editRequests = [] }) {
  return (
    <div className="mx-auto mb-20 px-4">
      <div className="flow-root">
        <ul className="-mb-8">
          {editRequests.length > 0 ? (
            editRequests.map((request, index) => {
              const statusText = request.status_text || "";
              const statusLower = statusText.toLowerCase();

              const isRejected = statusLower.includes("reject");
              const isPending = statusLower.includes("pending");
              const isApproved = !isRejected && !isPending;

              const isLast = index === editRequests.length - 1;

              return (
                <li key={request.id}>
                  <div className="relative pb-12">
                    {/* Vertical Line */}
                    {!isLast && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                    )}

                    <div className="relative flex items-start space-x-4">
                      {/* Status Icon */}
                      <div className="relative px-1">
                        <div
                          className={`h-8 w-8 rounded-full ring-8 ring-white dark:ring-gray-900 flex items-center justify-center shadow-sm text-white
                          ${
                            isPending
                              ? "bg-amber-500"
                              : isRejected
                                ? "bg-red-500"
                                : "bg-emerald-500"
                          }`}
                        >
                          {isPending && <Clock size={14} />}
                          {isRejected && <X size={14} />}
                          {isApproved && <CheckCircle size={14} />}
                        </div>
                      </div>

                      {/* Card */}
                      <div className="min-w-0 flex-1">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
                          {/* Header */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 tracking-wider">
                              {request.complaint_request_ref}
                            </span>
                            <span className="text-[10px] italic text-gray-400">
                              {request.created_ago}
                            </span>
                          </div>

                          {/* User Message */}
                          <div className="p-4">
                            <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              User Request
                            </span>

                            <div className="mt-3 space-y-2">
                              {request.requested_changes?.subject && (
                                <h4 className="text-sm font-bold dark:text-white">
                                  {request.requested_changes.subject}
                                </h4>
                              )}

                              {request.requested_changes?.complaint && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {request.requested_changes.complaint}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Reviewer Section */}
                          {request.review_comments ? (
                            <div
                              className={`border-t border-dashed p-4
                              ${
                                isRejected
                                  ? "bg-red-50/30 dark:bg-red-900/10"
                                  : "bg-emerald-50/30 dark:bg-emerald-900/10"
                              }`}
                            >
                              <div className="flex justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase text-gray-400">
                                    Decision:
                                  </span>
                                  <span
                                    className={`text-xs font-bold px-2 py-1 rounded text-white
                                    ${
                                      isRejected
                                        ? "bg-red-500"
                                        : "bg-emerald-500"
                                    }`}
                                  >
                                    {statusText}
                                  </span>
                                </div>

                                <span className="text-[10px] text-gray-400 italic">
                                  {request.updated_ago}
                                </span>
                              </div>

                              <div
                                className={`relative pl-4 border-l-2 ${
                                  isRejected
                                    ? "border-red-500"
                                    : "border-emerald-500"
                                }`}
                              >
                                <p
                                  className={`text-sm italic leading-relaxed ${
                                    isRejected
                                      ? "text-red-900 dark:text-red-200"
                                      : "text-emerald-900 dark:text-emerald-200"
                                  }`}
                                >
                                  "{request.review_comments}"
                                </p>

                                {request.reviewer && (
                                  <div className="mt-4 flex items-center gap-2 opacity-70">
                                    <div
                                      className={`h-5 w-5 rounded-full flex items-center justify-center ${
                                        isRejected
                                          ? "bg-red-200 dark:bg-red-800"
                                          : "bg-emerald-200 dark:bg-emerald-800"
                                      }`}
                                    >
                                      <User size={12} />
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest">
                                      {request.reviewer.title?.title_name}{" "}
                                      {request.reviewer.name_with_initials}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="px-4 py-3 bg-amber-50/30 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/20">
                              <p className="text-xs text-amber-700 dark:text-amber-500 flex items-center gap-2 font-medium">
                                <Clock size={12} />
                                Pending review by administration...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-center">
              <FileSearch
                className="text-gray-300 dark:text-gray-600 mb-4"
                size={40}
              />
              <h3 className="text-sm font-bold dark:text-white">
                No requests found
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your history will appear here once you make a request.
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
