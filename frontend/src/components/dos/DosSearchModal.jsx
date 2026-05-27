import { useState } from "react";

export default function DosSearchModal({ open, onClose, employees }) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  const list = Array.isArray(employees) ? employees : [];

  const filtered = list.filter((e) =>
    (String(e?.name || '')).toLowerCase().includes(String(query || '').toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end">
      <div className="bg-white w-96 p-6 h-full">
        <h2 className="font-bold text-lg mb-4">Search</h2>

        <input
          type="text"
          placeholder="Search..."
          className="w-full border p-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="mt-4 space-y-2">
          {filtered.map((e) => (
            <div key={e.id} className="p-2 border rounded">
              {e.name}
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-4 text-red-500">
          Close
        </button>
      </div>
    </div>
  );
}
