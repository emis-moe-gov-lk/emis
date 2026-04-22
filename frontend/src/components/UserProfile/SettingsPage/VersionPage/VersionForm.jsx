import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function NewVersion() {
  const [version, setVersion] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [changes, setChanges] = useState([""]);
  const [submitted, setSubmitted] = useState(false);

  const handleChangeInput = (index, value) => {
    const newChanges = [...changes];
    newChanges[index] = value;
    setChanges(newChanges);
  };

  const addChangeField = () => {
    setChanges([...changes, ""]);
  };

  const removeChangeField = (index) => {
    const newChanges = changes.filter((_, i) => i !== index);
    setChanges(newChanges);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVersion = {
      version,
      date,
      time,
      title,
      description,
      changes: changes.filter((c) => c.trim() !== ""),
    };
    console.log("New Version Data:", newVersion);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen p-10 bg-slate-50 text-slate-900">
      <h1 className="text-3xl font-semibold mb-6">Add New Version</h1>

      {submitted && (
        <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg">
          Version added successfully! Check console for data.
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md space-y-6"
      >
        {/* Version, Date, Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 1.2.1"
              className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Version title"
            className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this version update"
            className="mt-1 w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        {/* Changes */}
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Changes
          </label>
          <div className="space-y-2 mt-1">
            {changes.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={c}
                  onChange={(e) => handleChangeInput(i, e.target.value)}
                  placeholder="Describe a change"
                  className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {changes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChangeField(i)}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addChangeField}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Change
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
        >
          Save Version
        </button>
      </form>
    </div>
  );
}
