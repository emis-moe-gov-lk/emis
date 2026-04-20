import React from "react";

export default function ListLoading({
    text = "Loading..."
}) {
    return (
        <div className="rounded-3xl border bg-white p-10">
            <div className="flex flex-col items-center justify-center min-h-[240px] gap-4
                            animate-[pulse_2.2s_ease-in-out_infinite]">
                {/* Spinner */}
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                {/* Text */}
                <div className="text-sm font-medium text-gray-500">
                    {text}
                </div>
            </div>
        </div>
    );
}
