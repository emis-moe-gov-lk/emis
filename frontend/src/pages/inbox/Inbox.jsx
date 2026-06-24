import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getThreadList,
  getThreadMessages,
  getSentNotifications,
  getSentById,
  acknowledge,
} from "../../api/messageService";
import NotificationComposer from "./NotificationComposer";
import { useAuthUser } from "@/context/useAuthUser";

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
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
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
  for (let i = 0; i < (id || "").length; i++) n += id.charCodeAt(i);
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

function SentDetailSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-3 bg-gray-100 rounded w-4/6" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between gap-2">
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline shrink-0 font-medium">Retry</button>
      )}
    </div>
  );
}

export default function Inbox() {
  const [tab, setTab] = useState("inbox");

  // Inbox state
  const [allThreads, setAllThreads] = useState([]);
  const [selectedSenderId, setSelectedSenderId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [threadsError, setThreadsError] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [acking, setAcking] = useState({});

  // Sent state
  const [sentItems, setSentItems] = useState([]);
  const [selectedSentId, setSelectedSentId] = useState(null);
  const [loadingSent, setLoadingSent] = useState(false);
  const [sentError, setSentError] = useState(null);
  const [sentDetail, setSentDetail] = useState(null);
  const [loadingSentDetail, setLoadingSentDetail] = useState(false);

  // Search (debounced server-side for >= 3 chars, client-side otherwise)
  const [search, setSearch] = useState("");
  const searchTimerRef = useRef(null);

  // Composer
  const [composerOpen, setComposerOpen] = useState(false);
  const { user: authUser, officeLevel } = useAuthUser();
  const currentUser = { name: authUser?.name ?? "", roleLabel: officeLevel ?? "" };

  // --- data fetching -------------------------------------------------------

  const fetchThreads = useCallback(async (q = "") => {
    setLoadingThreads(true);
    setThreadsError(null);
    try {
      const data = await getThreadList(q ? { q } : {});
      setAllThreads(data);
    } catch {
      setThreadsError("Could not load conversations. Check your connection.");
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  const fetchMessages = useCallback(async (senderId) => {
    setLoadingMessages(true);
    setMessagesError(null);
    setMessages([]);
    try {
      const data = await getThreadMessages(senderId);
      setMessages(data);
      // Server auto-marks as read; mirror that in thread list immediately
      setAllThreads((prev) =>
        prev.map((t) => (t.senderId === senderId ? { ...t, unreadCount: 0 } : t)),
      );
    } catch {
      setMessagesError("Could not load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const fetchSent = useCallback(async () => {
    setLoadingSent(true);
    setSentError(null);
    try {
      const data = await getSentNotifications();
      setSentItems(data.items ?? []);
    } catch {
      setSentError("Could not load sent messages.");
    } finally {
      setLoadingSent(false);
    }
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  useEffect(() => {
    if (tab === "sent" && sentItems.length === 0 && !loadingSent) {
      fetchSent();
    }
  }, [tab]);

  // Debounced server-side search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    const q = search.trim();
    if (q.length >= 3) {
      searchTimerRef.current = setTimeout(() => {
        fetchThreads(q);
      }, 400);
    } else {
      // Re-fetch full list when search is cleared
      searchTimerRef.current = setTimeout(() => {
        fetchThreads();
      }, 400);
    }

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search, fetchThreads]);

  // --- handlers ------------------------------------------------------------

  function handleSelectThread(senderId) {
    if (senderId === selectedSenderId) return;
    setSelectedSenderId(senderId);
    fetchMessages(senderId);
  }

  async function handleSelectSent(id) {
    setSelectedSentId(id);
    setSentDetail(null);
    setLoadingSentDetail(true);
    try {
      const detail = await getSentById(id);
      setSentDetail(detail);
    } catch {
      // If detail fetch fails, we fall back to list item below
    } finally {
      setLoadingSentDetail(false);
    }
  }

  async function handleAcknowledge(messageId) {
    if (acking[messageId]) return;
    setAcking((prev) => ({ ...prev, [messageId]: true }));
    try {
      await acknowledge(messageId);
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, acknowledgedAt: now } : m)),
      );
    } catch {
      // leave button active so user can retry
    } finally {
      setAcking((prev) => ({ ...prev, [messageId]: false }));
    }
  }

  // --- derived state -------------------------------------------------------

  const selectedThread = allThreads.find((t) => t.senderId === selectedSenderId);
  const selectedSentItem = sentItems.find((s) => s.id === selectedSentId);
  const totalUnread = allThreads.reduce((sum, t) => sum + t.unreadCount, 0);

  // Client-side filter for short queries (< 3 chars)
  const filteredThreads = search.trim().length < 3
    ? allThreads.filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (t.senderName ?? "").toLowerCase().includes(q) ||
          (t.senderId ?? "").toLowerCase().includes(q) ||
          (t.senderRoleLabel ?? "").toLowerCase().includes(q) ||
          (t.latestSubject ?? "").toLowerCase().includes(q) ||
          (t.latestPreview ?? "").toLowerCase().includes(q)
        );
      })
    : allThreads; // server already filtered

  // -------------------------------------------------------------------------

  return (
    <>
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
                onClick={() => setComposerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-medium rounded-lg transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>

            {/* Search — only shown on inbox tab */}
            {tab === "inbox" && (
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
            )}
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

          {/* List */}
          <div className="flex-1 overflow-y-auto">

            {/* ── INBOX TAB ── */}
            {tab === "inbox" && (
              <>
                {threadsError && <ErrorBanner message={threadsError} onRetry={fetchThreads} />}
                {loadingThreads ? (
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
              </>
            )}

            {/* ── SENT TAB ── */}
            {tab === "sent" && (
              <>
                {sentError && <ErrorBanner message={sentError} onRetry={fetchSent} />}
                {loadingSent ? (
                  <ThreadSkeleton />
                ) : sentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 p-6 text-center">
                    <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <p className="text-xs">No sent messages yet</p>
                  </div>
                ) : (
                  sentItems.map((item) => {
                    const isSelected = item.id === selectedSentId;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSent(item.id)}
                        className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${
                          isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-1 mb-0.5">
                            <p className="text-sm font-medium text-gray-700 truncate">{item.subject}</p>
                            <span className="text-xs text-gray-400 shrink-0">{timeAgo(item.sentAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {item.isUrgent && (
                              <span className="text-xs font-medium text-orange-600">Urgent</span>
                            )}
                            <span className="text-xs text-gray-400">
                              {item.recipientCount} recipient{item.recipientCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{item.preview}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}

          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* INBOX right panel */}
          {tab === "inbox" && (
            selectedThread ? (
              <>
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
                  <Avatar name={selectedThread.senderName} senderId={selectedThread.senderId} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">
                      {selectedThread.senderName}
                    </p>
                    <p className="text-xs text-gray-500">{selectedThread.senderRoleLabel}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {selectedThread.messageCount} message{selectedThread.messageCount !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messagesError && <ErrorBanner message={messagesError} onRetry={() => fetchMessages(selectedSenderId)} />}
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
                        {msg.isUrgent && <div className="h-1 bg-orange-400" />}

                        <div className="p-4">
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

                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                            {msg.body}
                          </p>

                          {msg.requireAck && !msg.acknowledgedAt && (
                            <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                              This message requires your acknowledgement.
                            </div>
                          )}

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
            )
          )}

          {/* SENT right panel */}
          {tab === "sent" && (
            selectedSentItem ? (
              <>
                <div className="bg-white border-b border-gray-200 px-6 py-3 shrink-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {selectedSentItem.isUrgent && <UrgentBadge />}
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {sentDetail?.subject ?? selectedSentItem.subject}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Sent {formatDateTime(selectedSentItem.sentAt)} · {selectedSentItem.recipientCount} recipient{selectedSentItem.recipientCount !== 1 ? "s" : ""}
                        {selectedSentItem.requireAck && " · Acknowledgement required"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {loadingSentDetail ? (
                    <SentDetailSkeleton />
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {sentDetail?.body ?? selectedSentItem.preview}
                        {!sentDetail && selectedSentItem.preview?.length >= 120 && (
                          <span className="text-gray-400 italic"> …(truncated)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
                <svg className="w-14 h-14 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium">Select a sent message</p>
                  <p className="text-xs mt-1 text-gray-300">Choose a message from the left to view its details</p>
                </div>
              </div>
            )
          )}

        </div>
      </div>

      <NotificationComposer
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSent={() => { setComposerOpen(false); fetchSent(); }}
        currentUser={currentUser}
      />
    </>
  );
}
