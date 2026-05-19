import { HiArrowLeft } from "react-icons/hi";
import { NavLink } from "react-router-dom";

export default function BackToListButton({
  to,
  onClick,
  label = "Back to List",
  className = "",
}) {
  const baseClass =
    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50";

  if (to) {
    return (
      <NavLink to={to} className={`${baseClass} ${className}`.trim()}>
        <HiArrowLeft className="h-4 w-4" />
        {label}
      </NavLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClass} ${className}`.trim()}>
      <HiArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
