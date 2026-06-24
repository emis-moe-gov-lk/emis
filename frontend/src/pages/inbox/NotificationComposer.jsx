import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getScopeProvinces,
  getScopeZones,
  getScopeDivisions,
  getScopeSchools,
  estimateReach,
  sendNotification,
} from "../../api/messageService";

const SCOPE_TYPES = [
  { id: "all",      label: "All" },
  { id: "province", label: "Province" },
  { id: "zone",     label: "Zone" },
  { id: "division", label: "Division" },
  { id: "school",   label: "School" },
];

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// Defined outside the parent component so React doesn't remount it on every render.
function ScopeDropdown({ options, value, onChange, placeholder, disabled, loadingOptions }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loadingOptions}
      className="w-full mt-2 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 transition"
    >
      <option value="">{loadingOptions ? "Loading…" : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.workplaceId} value={opt.workplaceId}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}

export default function NotificationComposer({ isOpen, onClose, onSent, currentUser = {} }) {
  // Scope
  const [scopeType, setScopeType] = useState("all");
  const [scopeWorkplaceId, setScopeWorkplaceId] = useState("");

  // Cascade selections for zone/division/school
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");

  // Option lists
  const [provinces, setProvinces] = useState([]);
  const [zones, setZones] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Message
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [requireAck, setRequireAck] = useState(false);

  // Channels — in_app always on
  const [channels, setChannels] = useState(["in_app"]);

  // Estimated reach
  const [estimatedReach, setEstimatedReach] = useState(null);
  const [loadingReach, setLoadingReach] = useState(false);

  // Send
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const reachTimerRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Reset when drawer opens
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    setScopeType("all");
    setScopeWorkplaceId("");
    setSelectedProvinceId("");
    setSelectedZoneId("");
    setSelectedDivisionId("");
    setProvinces([]);
    setZones([]);
    setDivisions([]);
    setSchools([]);
    setSubject("");
    setBody("");
    setIsUrgent(false);
    setRequireAck(false);
    setChannels(["in_app"]);
    setEstimatedReach(null);
    setError(null);
    setSending(false);
  }, [isOpen]);

  // ---------------------------------------------------------------------------
  // Load top-level options when scope type changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    setScopeWorkplaceId("");
    setSelectedProvinceId("");
    setSelectedZoneId("");
    setSelectedDivisionId("");
    setProvinces([]);
    setZones([]);
    setDivisions([]);
    setSchools([]);
    setEstimatedReach(null);

    if (scopeType === "all") return;

    async function loadTopLevel() {
      setLoadingOptions(true);
      try {
        if (scopeType === "province") {
          const data = await getScopeProvinces();
          setProvinces(data);
        } else if (scopeType === "zone") {
          const [provData, zoneData] = await Promise.all([getScopeProvinces(), getScopeZones()]);
          setProvinces(provData);
          setZones(zoneData);
        } else if (scopeType === "division") {
          const [provData, divData] = await Promise.all([getScopeProvinces(), getScopeDivisions()]);
          setProvinces(provData);
          setDivisions(divData);
        } else if (scopeType === "school") {
          const provData = await getScopeProvinces();
          setProvinces(provData);
        }
      } catch {
        // swallow — user can retry by switching scope
      } finally {
        setLoadingOptions(false);
      }
    }

    loadTopLevel();
  }, [scopeType, isOpen]);

  // ---------------------------------------------------------------------------
  // Load zones when province selected
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedProvinceId) return;
    if (scopeType !== "zone" && scopeType !== "division" && scopeType !== "school") return;

    setSelectedZoneId("");
    setSelectedDivisionId("");
    setScopeWorkplaceId("");
    setZones([]);
    setDivisions([]);
    setSchools([]);

    async function loadZones() {
      setLoadingOptions(true);
      try {
        const data = await getScopeZones(selectedProvinceId);
        setZones(data);
      } catch {
        // swallow
      } finally {
        setLoadingOptions(false);
      }
    }

    loadZones();
  }, [selectedProvinceId, scopeType]);

  // ---------------------------------------------------------------------------
  // Load divisions when zone selected
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedZoneId) return;
    if (scopeType !== "division" && scopeType !== "school") return;

    setSelectedDivisionId("");
    setScopeWorkplaceId("");
    setDivisions([]);
    setSchools([]);

    async function loadDivisions() {
      setLoadingOptions(true);
      try {
        const data = await getScopeDivisions(selectedZoneId);
        setDivisions(data);
      } catch {
        // swallow
      } finally {
        setLoadingOptions(false);
      }
    }

    loadDivisions();
  }, [selectedZoneId, scopeType]);

  // ---------------------------------------------------------------------------
  // Load schools when division selected
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!selectedDivisionId) return;
    if (scopeType !== "school") return;

    setScopeWorkplaceId("");
    setSchools([]);

    async function loadSchools() {
      setLoadingOptions(true);
      try {
        const data = await getScopeSchools(selectedDivisionId);
        setSchools(data);
      } catch {
        // swallow
      } finally {
        setLoadingOptions(false);
      }
    }

    loadSchools();
  }, [selectedDivisionId, scopeType]);

  // ---------------------------------------------------------------------------
  // Debounced estimated reach
  // ---------------------------------------------------------------------------
  const fetchReach = useCallback(async (scope) => {
    setLoadingReach(true);
    try {
      const result = await estimateReach(scope);
      setEstimatedReach(result?.count ?? result ?? null);
    } catch {
      setEstimatedReach(null);
    } finally {
      setLoadingReach(false);
    }
  }, []);

  useEffect(() => {
    const readyForAll = scopeType === "all";
    const readyForOther = scopeType !== "all" && scopeWorkplaceId;

    if (!readyForAll && !readyForOther) {
      setEstimatedReach(null);
      return;
    }

    const scope =
      scopeType === "all"
        ? { type: "all" }
        : { type: scopeType, workplaceId: scopeWorkplaceId };

    if (reachTimerRef.current) clearTimeout(reachTimerRef.current);
    reachTimerRef.current = setTimeout(() => fetchReach(scope), 500);

    return () => {
      if (reachTimerRef.current) clearTimeout(reachTimerRef.current);
    };
  }, [scopeType, scopeWorkplaceId, fetchReach]);

  // ---------------------------------------------------------------------------
  // Channel toggle
  // ---------------------------------------------------------------------------
  function toggleChannel(ch) {
    if (ch === "in_app") return;
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  // ---------------------------------------------------------------------------
  // Send
  // ---------------------------------------------------------------------------
  async function handleSend() {
    setError(null);

    if (!subject.trim()) { setError("Subject is required."); return; }
    if (!body.trim())    { setError("Message body is required."); return; }
    if (channels.length === 0) { setError("At least one delivery channel is required."); return; }
    if (scopeType !== "all" && !scopeWorkplaceId) { setError("Please select a scope target."); return; }

    const scope =
      scopeType === "all"
        ? { type: "all" }
        : { type: scopeType, workplaceId: scopeWorkplaceId };

    setSending(true);
    try {
      await sendNotification({
        subject: subject.trim(),
        body: body.trim(),
        senderName: currentUser?.name || "",
        senderRoleLabel: currentUser?.roleLabel || "",
        isUrgent,
        requireAck,
        channels,
        scope,
      });
      onSent && onSent();
      onClose && onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Failed to send notification. Please try again.";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Scope pickers
  // ---------------------------------------------------------------------------
  function renderScopePickers() {
    if (scopeType === "all") return null;

    if (scopeType === "province") {
      return (
        <ScopeDropdown
          options={provinces}
          value={scopeWorkplaceId}
          onChange={setScopeWorkplaceId}
          placeholder="Select province…"
          loadingOptions={loadingOptions}
        />
      );
    }

    if (scopeType === "zone") {
      return (
        <>
          <ScopeDropdown
            options={provinces}
            value={selectedProvinceId}
            onChange={setSelectedProvinceId}
            placeholder="Filter by province (optional)…"
            loadingOptions={loadingOptions}
          />
          <ScopeDropdown
            options={zones}
            value={scopeWorkplaceId}
            onChange={setScopeWorkplaceId}
            placeholder="Select zone…"
            loadingOptions={loadingOptions}
          />
        </>
      );
    }

    if (scopeType === "division") {
      return (
        <>
          <ScopeDropdown
            options={provinces}
            value={selectedProvinceId}
            onChange={setSelectedProvinceId}
            placeholder="Filter by province (optional)…"
            loadingOptions={loadingOptions}
          />
          <ScopeDropdown
            options={zones}
            value={selectedZoneId}
            onChange={setSelectedZoneId}
            placeholder="Filter by zone (optional)…"
            disabled={!selectedProvinceId && zones.length === 0}
            loadingOptions={loadingOptions}
          />
          <ScopeDropdown
            options={divisions}
            value={scopeWorkplaceId}
            onChange={setScopeWorkplaceId}
            placeholder="Select division…"
            loadingOptions={loadingOptions}
          />
        </>
      );
    }

    if (scopeType === "school") {
      return (
        <>
          <ScopeDropdown
            options={provinces}
            value={selectedProvinceId}
            onChange={setSelectedProvinceId}
            placeholder="Select province…"
            loadingOptions={loadingOptions}
          />
          <ScopeDropdown
            options={zones}
            value={selectedZoneId}
            onChange={setSelectedZoneId}
            placeholder="Select zone…"
            disabled={!selectedProvinceId}
            loadingOptions={loadingOptions}
          />
          <ScopeDropdown
            options={divisions}
            value={selectedDivisionId}
            onChange={setSelectedDivisionId}
            placeholder="Select division…"
            disabled={!selectedZoneId}
            loadingOptions={loadingOptions}
          />
          <ScopeDropdown
            options={schools}
            value={scopeWorkplaceId}
            onChange={setScopeWorkplaceId}
            placeholder="Select school…"
            disabled={!selectedDivisionId}
            loadingOptions={loadingOptions}
          />
        </>
      );
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — explicit text-gray-900 so dark-mode parent color doesn't bleed in */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New Notification"
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-[640px] bg-white text-gray-900 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">New Notification</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Section 1 — Scope */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Scope
            </h3>

            <div className="flex flex-wrap gap-2">
              {SCOPE_TYPES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setScopeType(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    scopeType === id
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-2 space-y-2">
              {renderScopePickers()}
            </div>

            <div className="mt-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 flex items-center gap-2">
              {loadingReach ? (
                <>
                  <Spinner className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Estimating reach…</span>
                </>
              ) : estimatedReach !== null ? (
                <span className="text-xs text-gray-600">
                  Estimated reach:{" "}
                  <span className="font-semibold text-gray-900">{estimatedReach.toLocaleString()}</span>{" "}
                  recipient{estimatedReach !== 1 ? "s" : ""}
                </span>
              ) : (
                <span className="text-xs text-gray-400">— select scope to estimate reach</span>
              )}
            </div>
          </div>

          {/* Section 2 — Message */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Message
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={255}
                  placeholder="Enter subject…"
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter message body…"
                  rows={5}
                  className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none min-h-30"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-xs font-medium text-gray-700">Mark urgent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requireAck}
                    onChange={(e) => setRequireAck(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-xs font-medium text-gray-700">Require acknowledgement</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3 — Delivery channels */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Delivery Channels
            </h3>

            <div className="flex items-center gap-6">
              {[
                { id: "in_app", label: "In-app", alwaysOn: true },
                { id: "email",  label: "Email",  alwaysOn: false },
                { id: "sms",    label: "SMS",    alwaysOn: false },
              ].map(({ id, label, alwaysOn }) => (
                <label
                  key={id}
                  className={`flex items-center gap-2 select-none ${alwaysOn ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <input
                    type="checkbox"
                    checked={channels.includes(id)}
                    onChange={() => toggleChannel(id)}
                    disabled={alwaysOn}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
          >
            {sending && <Spinner className="w-4 h-4 text-white" />}
            {sending ? "Sending…" : "Send Notification"}
          </button>
        </div>
      </div>
    </>
  );
}
