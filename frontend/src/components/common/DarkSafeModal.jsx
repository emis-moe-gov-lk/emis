/**
 * DarkSafeModal - Reusable dark-safe modal component
 * Provides consistent styling, Escape key handling, focus management, and dark mode support
 * Used across: TeacherUpdateModal, RejectReasonModal, UpdateCommentModal, and other edit forms
 */

import { useEffect } from "react";
import { HiX } from "react-icons/hi";

export default function DarkSafeModal({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "md",
  isDismissible = true,
}) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth] || "max-w-md";

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === "Escape" && isDismissible) onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, isDismissible, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark overlay with backdrop blur */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        onClick={isDismissible ? onClose : undefined}
      />

      {/* Modal container */}
      <div
        className={`relative z-10 flex w-full ${maxWidthClass} flex-col rounded-3xl 
          bg-white dark:bg-gray-800 
          border border-gray-100 dark:border-gray-700
          shadow-2xl dark:shadow-2xl 
          max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-5">
          <div>
            {subtitle && (
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {subtitle}
              </p>
            )}
            {title && (
              <h2
                className={`${
                  subtitle ? "mt-0.5" : ""
                } text-lg font-black text-gray-900 dark:text-white`}
              >
                {title}
              </h2>
            )}
          </div>

          {isDismissible && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1.5 text-gray-400 dark:text-gray-500 transition-colors 
                hover:bg-gray-100 dark:hover:bg-gray-700 
                hover:text-gray-700 dark:hover:text-gray-300"
            >
              <HiX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex shrink-0 gap-3 border-t border-gray-100 dark:border-gray-700 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dark-safe input field class
 * Use this for consistent input styling across all modals
 */
export const darkSafeInputClass =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-900/50 " +
  "px-3 py-2.5 text-sm " +
  "text-gray-800 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:border-blue-500 dark:focus:border-blue-600 " +
  "focus:outline-none focus:ring-1 " +
  "focus:ring-blue-500 dark:focus:ring-blue-600 " +
  "disabled:cursor-not-allowed " +
  "disabled:bg-gray-50 dark:disabled:bg-gray-900/30 " +
  "disabled:text-gray-500 dark:disabled:text-gray-600 " +
  "transition-colors";

/**
 * Dark-safe select field class
 */
export const darkSafeSelectClass =
  "w-full appearance-none rounded-xl border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-900/50 " +
  "px-3 py-2.5 text-sm " +
  "text-gray-800 dark:text-gray-100 " +
  "focus:border-blue-500 dark:focus:border-blue-600 " +
  "focus:outline-none focus:ring-1 " +
  "focus:ring-blue-500 dark:focus:ring-blue-600 " +
  "disabled:cursor-not-allowed " +
  "disabled:bg-gray-50 dark:disabled:bg-gray-900/30 " +
  "disabled:text-gray-500 dark:disabled:text-gray-600 " +
  "transition-colors";

/**
 * Dark-safe textarea class
 */
export const darkSafeTextareaClass =
  "w-full rounded-xl border border-gray-200 dark:border-gray-700 " +
  "bg-white dark:bg-gray-900/50 " +
  "px-3 py-2.5 text-sm " +
  "text-gray-800 dark:text-gray-100 " +
  "placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:border-blue-500 dark:focus:border-blue-600 " +
  "focus:outline-none focus:ring-1 " +
  "focus:ring-blue-500 dark:focus:ring-blue-600 " +
  "disabled:cursor-not-allowed " +
  "disabled:bg-gray-50 dark:disabled:bg-gray-900/30 " +
  "disabled:text-gray-500 dark:disabled:text-gray-600 " +
  "resize-none transition-colors";

/**
 * Label component for dark-safe forms
 */
export function FormLabel({ text, required = false }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
      {text}
      {required && <span className="ml-0.5 text-rose-500 dark:text-rose-400">*</span>}
    </label>
  );
}

/**
 * Button styles for dark-safe modals
 */
export const darkSafeButtonClasses = {
  cancel:
    "flex-1 rounded-xl border border-gray-200 dark:border-gray-700 " +
    "bg-white dark:bg-gray-800 " +
    "py-2.5 text-sm font-semibold " +
    "text-gray-700 dark:text-gray-300 " +
    "hover:bg-gray-50 dark:hover:bg-gray-700 " +
    "disabled:opacity-50 disabled:cursor-not-allowed " +
    "transition-colors",

  primary:
    "flex-1 rounded-xl " +
    "bg-blue-600 dark:bg-blue-700 " +
    "py-2.5 text-sm font-semibold " +
    "text-white " +
    "hover:bg-blue-700 dark:hover:bg-blue-800 " +
    "disabled:opacity-60 disabled:cursor-not-allowed " +
    "transition-colors",

  danger:
    "flex-1 rounded-xl " +
    "bg-rose-600 dark:bg-rose-700 " +
    "py-2.5 text-sm font-semibold " +
    "text-white " +
    "hover:bg-rose-700 dark:hover:bg-rose-800 " +
    "disabled:opacity-60 disabled:cursor-not-allowed " +
    "transition-colors",

  warning:
    "flex-1 rounded-xl " +
    "bg-amber-600 dark:bg-amber-700 " +
    "py-2.5 text-sm font-semibold " +
    "text-white " +
    "hover:bg-amber-700 dark:hover:bg-amber-800 " +
    "disabled:opacity-60 disabled:cursor-not-allowed " +
    "transition-colors",
};
