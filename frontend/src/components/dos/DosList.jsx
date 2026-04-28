import DosCard from "./DosCard";
import EmptyState from "./EmptyState";

export default function DosList({ employees }) {
  if (!employees.length) return <EmptyState />;

  return (
    <div className="space-y-4">
      {employees.map((emp) => (
        <DosCard key={emp.id} employee={emp} />
      ))}
    </div>
  );
}
