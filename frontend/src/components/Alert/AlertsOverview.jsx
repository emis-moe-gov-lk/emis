import React from "react";

const AlertsOverview = ({
  pendingConfirmationCount = 0,
  pendingVerificationCount = 0,
  revisedCount = 0,
  rejectedCount = 0,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Pending Verification */}
      {pendingVerificationCount > 0 && (
        <div className="aspect-square flex flex-col items-center justify-center rounded-xl bg-yellow-50 border border-yellow-200 shadow-sm transition hover:shadow-md">
          <div className="mt-3 p-2 bg-yellow-200 rounded-full mb-10">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <span className="text-4xl font-bold text-yellow-600">
            {pendingVerificationCount}
          </span>
          <span className="text-sm font-semibold text-yellow-700 mt-2 mb-2">
            Pending Verification
          </span>
          <a
            href="/alerts/pending-verification"
            className="mt-2 w-full flex justify-center"
          >
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-4 rounded text-sm font-bold">
              View
            </button>
          </a>
        </div>
      )}

      {/* Revised */}
      {revisedCount > 0 && (
        <div className="aspect-square flex flex-col items-center justify-center rounded-xl bg-purple-50 border border-purple-200 shadow-sm transition hover:shadow-md">
          <div className="mt-3 p-2 bg-purple-200 rounded-full mb-10">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </div>
          <span className="text-4xl font-bold text-purple-600">
            {revisedCount}
          </span>
          <span className="text-sm font-semibold text-purple-700 mt-2 mb-2">
            Revised
          </span>
          <a
            href="/alerts/revised"
            className="mt-2 w-full flex justify-center"
          >
            <button className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-4 rounded text-sm font-bold">
              View
            </button>
          </a>
        </div>
      )}

      {/* Pending Confirmation */}
      {pendingConfirmationCount > 0 && (
        <div className="aspect-square flex flex-col items-center justify-center rounded-xl bg-green-50 border border-green-200 shadow-sm transition hover:shadow-md">
          <div className="mt-3 p-2 bg-green-200 rounded-full mb-10">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <span className="text-4xl font-bold text-green-600">
            {pendingConfirmationCount}
          </span>
          <span className="text-sm font-semibold text-green-700 mt-2 mb-2">
            Pending Confirmation
          </span>
          <a
            href="/alerts/pending-confirmation"
            className="mt-2 w-full flex justify-center"
          >
            <button className="bg-green-500 hover:bg-green-600 text-white py-1 px-4 rounded text-sm font-bold">
              View
            </button>
          </a>
        </div>
      )}

      {/* Rejected */}
      {rejectedCount > 0 && (
        <div className="aspect-square flex flex-col items-center justify-center rounded-xl bg-red-50 border border-red-200 shadow-sm transition hover:shadow-md">
          <div className="mt-3 p-2 bg-red-200 rounded-full mb-10">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <span className="text-4xl font-bold text-red-600">
            {rejectedCount}
          </span>
          <span className="text-sm font-semibold text-red-700 mt-2 mb-2">
            Rejected
          </span>
          <a
            href="/alerts/rejection"
            className="mt-2 w-full flex justify-center"
          >
            <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded text-sm font-bold">
              View
            </button>
          </a>
        </div>
      )}
    </div>
  );
};

export default AlertsOverview;