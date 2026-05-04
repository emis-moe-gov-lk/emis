import React from "react";

const defaultSurfaceClass = "rounded-2xl overflow-hidden border surface";
const defaultHeadClass = "bg-gray-50 dark:bg-gray-900/70 text-left";
const defaultHeadRowClass =
  "text-xs font-extrabold uppercase tracking-wide text-gray-600 dark:text-gray-300";
const defaultBodyClass = "divide-y divide-gray-200 dark:divide-gray-800";
const defaultEmptyCellClass = "px-5 py-6 text-gray-600 dark:text-gray-400";

const ProfileDataTable = ({
  columns = [],
  rows = [],
  renderRow,
  emptyMessage = "No data",
  emptyColSpan,
  surfaceClassName = defaultSurfaceClass,
  tableClassName = "min-w-full text-sm",
  headClassName = defaultHeadClass,
  headRowClassName = defaultHeadRowClass,
  bodyClassName = defaultBodyClass,
  emptyCellClassName = defaultEmptyCellClass,
}) => {
  const resolvedColSpan = emptyColSpan || columns.length || 1;

  return (
    <div className={surfaceClassName}>
      <div className="overflow-x-auto">
        <table className={tableClassName}>
          <thead className={headClassName}>
            <tr className={headRowClassName}>
              {columns.map((column) => (
                <th key={column.key || column.label} className={column.className || "px-5 py-4"}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={bodyClassName}>
            {rows?.length ? (
              rows.map((row, index) => renderRow(row, index))
            ) : (
              <tr>
                <td className={emptyCellClassName} colSpan={resolvedColSpan}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfileDataTable;
