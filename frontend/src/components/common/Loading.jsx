import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 z-40">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
