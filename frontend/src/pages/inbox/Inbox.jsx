import React, { useState, useEffect, useCallback } from "react";
import { acknowledge } from "../../api/messageService";

// ---------------------------------------------------------------------------
// Flip USE_MOCK to false and implement fetchThreads / fetchMessages below
// once GET /api/messages/threads and GET /api/messages/threads/:senderId exist.
// ---------------------------------------------------------------------------
const USE_MOCK = true;

const MOCK_THREADS = [
  {
    senderId: "e491043c-4de9-4102-adaa-4ee2f95dd8d3",
    senderName: "Kamal Perera",
    senderRoleLabel: "Ministry Officer",
    latestSubject: "URGENT: Reminder — policy compliance deadline",
    latestPreview: "This is a reminder to acknowledge the policy update. Deadline is approaching.",
    latestSentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    unreadCount: 2,
    totalMessages: 3,
  },
  {
    senderId: "f72a91bc-1234-5678-abcd-ef0123456789",
    senderName: "Nimal Silva",
    senderRoleLabel: "Zonal Director — Colombo",
    latestSubject: "Staff meeting — June 30",
    latestPreview: "All principals are required to attend the zonal staff meeting.",
    latestSentAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    totalMessages: 1,
  },
  {
    senderId: "a1b2c3d4-0000-0000-0000-111122223333",
    senderName: "Samanthi Perera",
    senderRoleLabel: "Provincial Director — Western",
    latestSubject: "Circular 2026/12 — Teacher transfers",
    latestPreview: "Please note the updated transfer guidelines effective from July 2026.",
    latestSentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    totalMessages: 2,
  },
];

const MOCK_MESSAGES = {
  "e491043c-4de9-4102-adaa-4ee2f95dd8d3": [
    {
      id: 101,
      subject: "New appointment guidelines — Circular 2026/08",
      body: "Please be informed that new appointment guidelines have been issued effective from 1st July 2026. All institutions must comply with the updated procedures for teacher appointment and confirmation.",
      isUrgent: false,
      requireAck: false,
      readAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: null,
      sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 102,
      subject: "Policy update for Western Province schools",
      body: "Please review the updated appointment circular (Circular 2026/08). All principals must ensure compliance by 1st July 2026. Contact the Zonal Education Office if you have any questions.",
      isUrgent: false,
      requireAck: true,
      readAt: null,
      acknowledgedAt: null,
      sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 103,
      subject: "URGENT: Reminder — policy compliance deadline",
      body: "This is a reminder to acknowledge the policy update sent earlier. The acknowledgement deadline is today. Please read Circular 2026/08 and click Acknowledge.",
      isUrgent: true,
      requireAck: false,
      readAt: null,
      acknowledgedAt: null,
      sentAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
  ],
  "f72a91bc-1234-5678-abcd-ef0123456789": [
    {
      id: 201,
      subject: "Staff meeting — June 30",
      body: "All principals are required to attend the Zonal Staff Meeting on June 30th, 2026 at 9:00 AM at the Colombo Zonal Education Office, No. 12, Baseline Road, Colombo 09.\n\nAgenda:\n1. Q2 performance review\n2. New appointment guidelines\n3. Transfer requests — July cycle\n\nPlease confirm your attendance by June 28th.",
      isUrgent: true,
      requireAck: true,
      readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 27 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "a1b2c3d4-0000-0000-0000-111122223333": [
    {
      id: 301,
      subject: "Provincial education meeting — May summary",
      body: "Please find attached the summary of the Provincial Education Meeting held on 20th May 2026. Key action items have been highlighted.",
      isUrgent: false,
      requireAck: false,
      readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: null,
      sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 302,
      subject: "Circular 2026/12 — Teacher transfers",
      body: "Please note the updated teacher transfer guidelines effective from July 2026. All transfer requests must be submitted through the EMIS system by 15th June 2026.\n\nInstitutions that have not yet completed the Q1 staff verification must do so before submitting transfer requests.",
      isUrgent: false,
      requireAck: true,
      readAt: null,
      acknowledgedAt: null,
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};
// ---------------------------------------------------------------------------

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatDateTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function avatarColor(id) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function Avatar({ name, senderId, size = "md" }) {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sz} ${avatarColor(senderId)} rounded-full flex items-center justify-center font-semibold shrink-0`}>
      {initials(name)}
    </div>
  );
}

function UrgentBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
      Urgent
    </span>
  );
}

function AckBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Acknowledged
    </span>
  );
}

function ThreadSkeleton() {
  return (
    <div className="animate-pulse space-y-0">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1.5 py-0.5">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-2.5 bg-gray-100 rounded w-1/3" />
            <div className="h-2.5 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 space-y-2 border border-gray-100">
          <div className="h-3.5 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

export default function Inbox() {
  const [tab, setTab] = useState("inbox");
  const [threads, setThreads] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [acking, setAcking] = useState({});

  // --- data fetching -------------------------------------------------------

  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true);
    try {
      if (USE_MOCK) {
        await delay(500);
        setThreads(MOCK_THREADS);
      } else {
        // const data = await getThreads({ q: search });
        // setThreads(data.items);
      }
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  const fetchMessages = useCallback(async (senderId) => {
    setLoadingMessages(true);
    setMessages([]);
    try {
      if (USE_MOCK) {
        await delay(250);
        setMessages(MOCK_MESSAGES[senderId] ?? []);
        setThreads((prev) =>
          prev.map((t) => (t.senderId === senderId ? { ...t, unreadCount: 0 } : t)),
        );
      } else {
        // const data = await getThreadMessages(senderId);
        // setMessages(data.items);
      }
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  // --- handlers ------------------------------------------------------------

  function handleSelectThread(senderId) {
    if (senderId === selectedSenderId) return;
    setSelectedSenderId(senderId);
    fetchMessages(senderId);
  }

  async function handleAcknowledge(messageId) {
    if (acking[messageId]) return;
    setAcking((prev) => ({ ...prev, [messageId]: true }));
    try {
      if (USE_MOCK) {
        await delay(600);
      } else {
        await acknowledge(messageId);
      }
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, acknowledgedAt: now } : m)),
      );
    } finally {
      setAcking((prev) => ({ ...prev, [messageId]: false }));
    }
  }

  // --- derived state -------------------------------------------------------

  const selectedThread = threads.find((t) => t.senderId === selectedSenderId);
  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  const filteredThreads = threads.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      t.senderName.toLowerCase().includes(q) ||
      t.senderId.toLowerCase().includes(q) ||
      t.senderRoleLabel.toLowerCase().includes(q) ||
      t.latestSubject.toLowerCase().includes(q) ||
      t.latestPreview.toLowerCase().includes(q)
    );
  });

  // -------------------------------------------------------------------------

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">

      {/* ── LEFT PANEL ── */}
      <div className="w-72 xl:w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">Messages</h1>
              {totalUnread > 0 && (
                <p className="text-xs text-blue-600 font-medium">{totalUnread} unread</p>
              )}
            </div>
            <button
              onClick={() => alert("Message composer — coming soon")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-medium rounded-lg transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name, ID or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: "inbox", label: "Inbox" },
            { id: "sent",  label: "Sent" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2 text-xs font-medium transition border-b-2 ${
                tab === id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto">
          {tab === "sent" ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 p-6 text-center">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <p className="text-xs">Sent view coming soon</p>
            </div>
          ) : loadingThreads ? (
            <ThreadSkeleton />
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 p-6 text-center">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">{search ? "No results" : "No messages yet"}</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.senderId === selectedSenderId;
              const hasUnread = thread.unreadCount > 0;
              return (
                <button
                  key={thread.senderId}
                  onClick={() => handleSelectThread(thread.senderId)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar name={thread.senderName} senderId={thread.senderId} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1 mb-0.5">
                      <p className={`text-sm truncate ${hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}>
                        {thread.senderName}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0">{timeAgo(thread.latestSentAt)}</span>
                    </div>

                    <p className="text-xs text-gray-400 truncate mb-1">{thread.senderRoleLabel}</p>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate ${hasUnread ? "text-gray-700" : "text-gray-400"}`}>
                        {thread.latestPreview}
                      </p>
                      {thread.unreadCount > 0 && (
                        <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center leading-none">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedThread ? (
          <>
            {/* Thread header */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
              <Avatar name={selectedThread.senderName} senderId={selectedThread.senderId} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {selectedThread.senderName}
                </p>
                <p className="text-xs text-gray-500">{selectedThread.senderRoleLabel}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {selectedThread.totalMessages} message{selectedThread.totalMessages !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {loadingMessages ? (
                <MessageSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  No messages in this thread.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
                      msg.isUrgent ? "border-orange-200" : "border-gray-100"
                    }`}
                  >
                    {/* Urgent stripe */}
                    {msg.isUrgent && <div className="h-1 bg-orange-400" />}

                    <div className="p-4">
                      {/* Message header row */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          {msg.isUrgent && <UrgentBadge />}
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {msg.subject}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                          {formatDateTime(msg.sentAt)}
                        </span>
                      </div>

                      {/* Body */}
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                        {msg.body}
                      </p>

                      {/* Pending ack notice */}
                      {msg.requireAck && !msg.acknowledgedAt && (
                        <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          This message requires your acknowledgement.
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-2 flex-wrap">
                          {msg.readAt && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Read
                            </span>
                          )}
                          {msg.requireAck && msg.acknowledgedAt && <AckBadge />}
                        </div>

                        {msg.requireAck && !msg.acknowledgedAt && (
                          <button
                            onClick={() => handleAcknowledge(msg.id)}
                            disabled={acking[msg.id]}
                            className="text-xs font-medium px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition disabled:opacity-60 shrink-0"
                          >
                            {acking[msg.id] ? "Confirming..." : "Acknowledge"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <svg className="w-14 h-14 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1 text-gray-300">Choose a sender from the left to read their messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
