import React from "react";

const STATUS_STYLES = {
  confirm: { bg: "#28A745", color: "#ffffff" },
  confirmed: { bg: "#28A745", color: "#ffffff" },
  verify: { bg: "#007BFF", color: "#ffffff" },
  verified: { bg: "#007BFF", color: "#ffffff" },
  reject: { bg: "#DC3545", color: "#ffffff" },
  rejected: { bg: "#DC3545", color: "#ffffff" },
  pending: { bg: "#FFC107", color: "#1f2937" },
  revised: { bg: "#6F42C1", color: "#ffffff" },
};

function resolveStyle(status) {
  if (!status) return { bg: "#e5e7eb", color: "#111827" };
  const key = String(status).trim().toLowerCase();
  // try exact match first
  if (STATUS_STYLES[key]) return STATUS_STYLES[key];

  // fallback: match by keyword
  if (key.includes("confirm")) return STATUS_STYLES.confirmed;
  if (key.includes("verify")) return STATUS_STYLES.verified;
  if (key.includes("reject")) return STATUS_STYLES.rejected;
  if (key.includes("pending")) return STATUS_STYLES.pending;
  if (key.includes("revise")) return STATUS_STYLES.revised;

  return { bg: "#e5e7eb", color: "#111827" };
}

const StatusBadge = ({ status, className = "", style = {}, children }) => {
  const resolved = resolveStyle(status || children);

  return (
    <div
      className={["inline-block px-3 py-1 text-xs font-bold rounded-full", className].join(" ")}
      style={{ backgroundColor: resolved.bg, color: resolved.color, ...style }}
    >
      {String(status || children || "").trim() || "—"}
    </div>
  );
};

export default StatusBadge;
