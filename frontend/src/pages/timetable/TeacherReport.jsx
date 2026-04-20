import { useState } from "react";
import { Link } from "react-router-dom";
import { useTimetable } from "../../context/TimetableContext";
import { fetchReport } from "../../api/timetableApi";
import { toLocalISO, formatDateShort, splitIntoMonths } from "../../utils/time";

/* -------- duration helpers -------- */

const getDuration = (periodTime) => {
  if (!periodTime) return 0;
  const [start, end] = periodTime.split(" - ");
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
};

const formatDuration = (mins) => {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
};

/* -------- reusable section components -------- */

function OverviewCard({ report }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-400 mb-4">
        {formatDateShort(report.period.startDate)} —{" "}
        {formatDateShort(report.period.endDate)} &middot;{" "}
        {report.period.totalDays} days
      </p>
      <div className="text-center grid grid-cols-4 gap-y-4 gap-x-6">
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {report.summary.totalOccurrences}
          </p>
          <p className="text-xs text-gray-400">Total periods taught</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {report.summary.uniqueSubjects}
          </p>
          <p className="text-xs text-gray-400">Subjects</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">
            {report.summary.uniqueClasses}
          </p>
          <p className="text-xs text-gray-400">Classes</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-orange-600">
            {report.summary.specialCount}
          </p>
          <p className="text-xs text-gray-400">Special classes</p>
        </div>
      </div>
    </div>
  );
}

function RegularClassesSection({ report, subjectColors }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Regular Classes
        <span className="ml-2 text-xs font-normal text-gray-400">
          {report.summary.regularCount} subject
          {report.summary.regularCount !== 1 ? "s" : ""} per week
        </span>
      </h3>

      {report.regular.slots.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center bg-white rounded-xl border border-dashed border-gray-200">
          No regular classes in this period.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">
                  Subject
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400">
                  Class
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 hidden sm:table-cell">
                  Day
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-400 hidden sm:table-cell">
                  Time
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-400">
                  Times Taught
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-400 hidden sm:table-cell">
                  Students
                </th>
              </tr>
            </thead>
            <tbody>
              {report.regular.slots.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700">
                      {subjectColors?.[s.subject] && (
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: subjectColors[s.subject] }}
                        />
                      )}
                      {s.subject}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-gray-500">
                    {s.class}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-gray-500 hidden sm:table-cell">
                    {s.day}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-gray-400 hidden sm:table-cell">
                    {s.periodTime}
                  </td>
                  <td className="text-right px-4 py-2.5 text-[13px] font-semibold text-gray-700 tabular-nums">
                    {s.occurrences}
                  </td>
                  <td className="text-right px-4 py-2.5 text-[13px] text-gray-500 tabular-nums hidden sm:table-cell">
                    {s.students}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Subject summary under the table */}
      {Object.keys(report.regular.bySubject).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(report.regular.bySubject).map(([name, vals]) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1"
            >
              {subjectColors?.[name] && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: subjectColors[name] }}
                />
              )}
              {name}
              <span className="text-gray-400">&middot;</span>
              <span className="tabular-nums">{vals.occurrences} periods</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function SpecialClassesSection({ report }) {
  const totalMins = report.special.slots.reduce(
    (sum, s) => sum + getDuration(s.periodTime),
    0,
  );

  return (
    <section>
      <h3 className="text-sm font-semibold text-orange-700 mb-3">
        Special Classes
        <span className="ml-2 text-xs font-normal text-orange-400">
          {report.summary.specialCount} subject
          {report.summary.specialCount !== 1 ? "s" : ""} on off days
        </span>
      </h3>

      {report.special.slots.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center bg-white rounded-xl border border-dashed border-orange-200">
          No special classes in this period.
        </p>
      ) : (
        <div className="bg-white rounded-xl border border-orange-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50 border-b border-orange-100">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-orange-400">
                  Date
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-orange-400">
                  Subject
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-orange-400">
                  Class
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-orange-400 hidden sm:table-cell">
                  Purpose
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-orange-400 hidden sm:table-cell">
                  Time
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-orange-400 hidden sm:table-cell">
                  Students
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-orange-400">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {report.special.slots.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-orange-50 last:border-0"
                >
                  <td className="px-4 py-2.5 text-[13px] font-medium text-gray-700 tabular-nums">
                    {formatDateShort(s.date)}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] font-medium text-gray-700">
                    {s.subject}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-gray-500">
                    {s.class}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-orange-600 italic hidden sm:table-cell">
                    {s.purpose || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-gray-400 hidden sm:table-cell">
                    {s.periodTime}
                  </td>
                  <td className="text-right px-4 py-2.5 text-[13px] text-gray-500 tabular-nums hidden sm:table-cell">
                    {s.students}
                  </td>
                  <td className="text-right px-4 py-2.5 text-[13px] font-medium text-gray-700 tabular-nums">
                    {formatDuration(getDuration(s.periodTime))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-orange-50 border-t border-orange-200">
                <td
                  colSpan={6}
                  className="px-4 py-2.5 text-[13px] font-semibold text-orange-700 text-right"
                >
                  Total
                </td>
                <td className="text-right px-4 py-2.5 text-[13px] font-bold text-orange-700 tabular-nums">
                  {formatDuration(totalMins)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}

/* -------- aggregation helper -------- */

function aggregateReports(reports) {
  const summary = {
    totalOccurrences: 0,
    uniqueSubjects: 0,
    uniqueClasses: 0,
    specialCount: 0,
    regularCount: reports[0]?.summary.regularCount ?? 0,
  };

  const subjectSet = new Set();
  const classSet = new Set();
  const bySubject = {};
  let totalDays = 0;
  let totalSpecialMins = 0;

  for (const r of reports) {
    summary.totalOccurrences += r.summary.totalOccurrences;
    summary.specialCount += r.summary.specialCount;
    totalDays += r.period.totalDays;

    // collect unique subjects/classes from regular slots
    for (const s of r.regular.slots) {
      subjectSet.add(s.subject);
      classSet.add(s.class);
    }
    // collect from special slots too
    for (const s of r.special.slots) {
      subjectSet.add(s.subject);
      classSet.add(s.class);
      totalSpecialMins += getDuration(s.periodTime);
    }

    // merge bySubject occurrences
    for (const [name, vals] of Object.entries(r.regular.bySubject)) {
      if (!bySubject[name]) bySubject[name] = { occurrences: 0 };
      bySubject[name].occurrences += vals.occurrences;
    }
  }

  summary.uniqueSubjects = subjectSet.size;
  summary.uniqueClasses = classSet.size;

  const weeks = Math.max(totalDays / 7, 1);
  const avgPerWeek = Math.round((summary.totalOccurrences / weeks) * 10) / 10;

  return { summary, bySubject, avgPerWeek, totalSpecialMins };
}

/* -------- main component -------- */

function TeacherReport() {
  const { subjectColors } = useTimetable();

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 29);

  const [startDate, setStartDate] = useState(toLocalISO(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(toLocalISO(today));
  const [report, setReport] = useState(null); // single-month data
  const [monthReports, setMonthReports] = useState(null); // multi-month array of { label, data }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMultiMonth = monthReports && monthReports.length > 1;
  const hasReport = report || isMultiMonth;

  const handleGenerate = async () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (e < s) {
      setError("Start date must be before end date.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setMonthReports(null);

    try {
      const chunks = splitIntoMonths(startDate, endDate);

      if (chunks.length === 1) {
        // Single month — current behavior
        const data = await fetchReport(startDate, endDate);
        setReport(data);
      } else {
        // Multi-month — fetch each month in parallel
        const results = await Promise.all(
          chunks.map(async (chunk) => {
            const data = await fetchReport(chunk.start, chunk.end);
            return { label: chunk.label, data };
          }),
        );
        setMonthReports(results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Teaching Report
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Teaching Report</p>
        </div>
        <div className="flex items-center gap-3">
          {hasReport && (
            <button
              onClick={() => window.print()}
              className="no-print px-3 py-1.5 rounded-md text-xs font-medium bg-gray-800 text-white hover:bg-gray-700 transition"
            >
              Print
            </button>
          )}
          <Link
            to="../weekly"
            className="no-print text-[13px] font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="no-print bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex gap-3 flex-1">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50 transition"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {/* Single-month Report (unchanged layout) */}
      {report && !isMultiMonth && (
        <div className="print-area space-y-8">
          {/* Print-only header */}
          <div className="print-only hidden print-area-title py-4 px-6 relative">
            <h1 className="text-xl font-bold tracking-wide text-center">
              abc college
            </h1>
            <p className="text-sm mt-1 text-center">Teaching Report</p>
            <p className="absolute left-6 top-4 text-base font-bold">
              Teacher Name:
            </p>
          </div>

          <OverviewCard report={report} />
          <RegularClassesSection
            report={report}
            subjectColors={subjectColors}
          />
          <SpecialClassesSection
            report={report}
            subjectColors={subjectColors}
          />
        </div>
      )}

      {/* Multi-month Report */}
      {isMultiMonth && (
        <div className="print-area space-y-10">
          {/* Print-only header */}
          <div className="print-only hidden print-area-title py-4 px-6 relative">
            <h1 className="text-xl font-bold tracking-wide text-center">
              abc college
            </h1>
            <p className="text-sm mt-1 text-center">Teaching Report</p>
            <p className="absolute left-6 top-4 text-base font-bold">
              Teacher Name:
            </p>
          </div>

          {/* Per-month sections */}
          {monthReports.map(({ label, data }) => (
            <div key={label} className="space-y-6">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2">
                {label}
              </h2>
              <OverviewCard report={data} />
              <RegularClassesSection
                report={data}
                subjectColors={subjectColors}
              />
              <SpecialClassesSection
                report={data}
                subjectColors={subjectColors}
              />
            </div>
          ))}

          {/* Aggregated Summary */}
          {(() => {
            const allData = monthReports.map((m) => m.data);
            const { summary, bySubject, avgPerWeek, totalSpecialMins } =
              aggregateReports(allData);
            const firstStart = monthReports[0].data.period.startDate;
            const lastEnd =
              monthReports[monthReports.length - 1].data.period.endDate;

            return (
              <div className="space-y-6 border-t-2 border-gray-300 pt-8">
                <h2 className="text-base font-bold text-gray-800">
                  Full Period Summary
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {formatDateShort(firstStart)} — {formatDateShort(lastEnd)}
                  </span>
                </h2>

                {/* Aggregated overview metrics */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="text-center grid grid-cols-3 sm:grid-cols-6 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {summary.totalOccurrences}
                      </p>
                      <p className="text-xs text-gray-400">
                        Total periods taught
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {avgPerWeek}
                      </p>
                      <p className="text-xs text-gray-400">
                        Avg periods / week
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {summary.uniqueSubjects}
                      </p>
                      <p className="text-xs text-gray-400">Subjects</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">
                        {summary.uniqueClasses}
                      </p>
                      <p className="text-xs text-gray-400">Classes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {summary.specialCount}
                      </p>
                      <p className="text-xs text-gray-400">Special classes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatDuration(totalSpecialMins)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Special class hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Aggregated subject breakdown */}
                {Object.keys(bySubject).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(bySubject).map(([name, vals]) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1"
                      >
                        {subjectColors?.[name] && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: subjectColors[name] }}
                          />
                        )}
                        {name}
                        <span className="text-gray-400">&middot;</span>
                        <span className="tabular-nums">
                          {vals.occurrences} periods
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {!hasReport && !loading && (
        <div className="text-center py-16 text-gray-400 text-sm">
          Select a date range and click "Generate" to view your teaching
          summary.
        </div>
      )}
    </div>
  );
}

export default TeacherReport;
