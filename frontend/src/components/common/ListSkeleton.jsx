import React from "react";

export default function ListSkeleton({
    text = "Loading..."
}) {
    const SKELETON_COUNT = 5;

    return (
        <div className="rounded-2xl border bg-white dark:bg-gray-800 p-6">
            {/* Loading text */}
            <div className="mb-5 text-sm font-medium text-gray-500">
                {text}
            </div>

            {/* Skeleton rows */}
            <div className="space-y-4 animate-pulse">
                {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                    <div
                        key={index}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800"
                    >
                        {/* Left block */}
                        <div className="flex items-center gap-4 min-w-[60px]">
                            <div className="h-4 w-4 bg-gray-200 rounded" />
                            <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                        </div>

                        {/* Main content */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4 space-y-2">
                                <div className="h-4 w-48 bg-gray-200 rounded" />
                                <div className="h-3 w-32 bg-gray-100 rounded" />
                            </div>

                            <div className="md:col-span-4 hidden md:block">
                                <div className="h-4 w-full bg-gray-100 rounded" />
                            </div>

                            <div className="md:col-span-2 hidden md:block">
                                <div className="h-4 w-24 bg-gray-100 rounded" />
                            </div>

                            <div className="md:col-span-2 flex md:justify-end">
                                <div className="h-6 w-20 bg-gray-200 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
