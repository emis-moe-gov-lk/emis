import React, { useState } from "react";

const dummyMessages = [
  //   {
  //     id: 1,
  //     to: "John Doe",
  //     subject: "Meeting Update",
  //     message: "The meeting is rescheduled to 3 PM tomorrow.",
  //     date: "2026-06-18",
  //   },
  //   {
  //     id: 2,
  //     to: "HR Department",
  //     subject: "Leave Request",
  //     message: "I would like to request leave for next Monday.",
  //     date: "2026-06-17",
  //   },
  //   {
  //     id: 3,
  //     to: "Project Team",
  //     subject: "Sprint Plan",
  //     message: "Please review the sprint backlog before Friday.",
  //     date: "2026-06-16",
  //   },
];

export default function SentBox() {
  const [messages] = useState(dummyMessages);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = messages.filter(
    (m) =>
      m.to.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 flex p-4 gap-4">
      {/* LEFT PANEL */}
      <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white">
          <h2 className="text-xl font-bold">Message Inbox</h2>
          <p className="text-xs opacity-80">All your incoming messages</p>
        </div>

        {/* Search */}
        <div className="p-3 border-b dark:border-gray-700">
          <input
            type="text"
            placeholder="Search by recipient or subject..."
            className="w-full px-3 py-2 border dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelected(msg)}
              className={`p-3 rounded-xl cursor-pointer transition border
              ${
                selected?.id === msg.id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-transparent"
              }`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-gray-100">To: {msg.to}</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">{msg.date}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {msg.subject}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="hidden md:flex flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {selected ? (
          <div className="w-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {selected.subject}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                To: <span className="font-medium">{selected.to}</span> •{" "}
                {selected.date}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border dark:border-gray-700 text-gray-700 dark:text-gray-300 leading-relaxed">
                {selected.message}
              </div>
            </div>
          </div>
        ) : (
          <div className="m-auto text-center">
            <div className="text-gray-400 dark:text-gray-500 text-lg">📩 Select a message</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
