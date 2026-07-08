import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  fetchVersions,
  createVersion,
  updateVersion,
  deleteVersion,
} from "@/api/VersionService";

import Can from "@/components/common/Can";
import { PermissionGroups } from "@/data/permissionGroups";
import Button from "@/components/UiComponents/Button";

export default function VersionPage() {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  /* ---------------- FORMAT DATE ---------------- */

  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    const d = new Date(dateString);

    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0") +
      ":" +
      String(d.getSeconds()).padStart(2, "0")
    );
  };

  /* ---------------- FETCH ---------------- */

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchVersions();

      const rawData = Array.isArray(response?.data)
        ? response.data
        : (response?.data?.data ?? []);

      const formatted = rawData.map((item) => ({
        id: item.id,
        version: item.version ?? "",
        title: item.title ?? "",
        description: item.description ?? "",
        changes: Array.isArray(item.changes)
          ? item.changes
          : typeof item.changes === "string"
            ? item.changes.split("\n").filter(Boolean)
            : [],
        created_at: formatDateTime(item.created_at),
        updated_at: formatDateTime(item.updated_at),
        isEditing: false,
        isNew: false,
        errors: {},
      }));

      setVersions(formatted);
    } catch (err) {
      setError("Failed to load versions");
    } finally {
      setLoading(false);
    }
  };

  /* Run only once when page loads */
  useEffect(() => {
    loadVersions();
  }, []);

  /* ---------------- VALIDATION ---------------- */

  const validateVersion = (v) => {
    const errors = {};

    if (!v.version?.trim()) errors.version = "Version is required";
    if (!v.title?.trim()) errors.title = "Title is required";
    if (!v.description?.trim()) errors.description = "Description is required";
    if (!v.changes?.length || v.changes.every((c) => !c.trim()))
      errors.changes = "At least one change is required";

    return errors;
  };

  /* ---------------- ADD NEW ---------------- */

  const handleNewVersionClick = () => {
    setVersions((prev) => [
      {
        id: Date.now(),
        version: "",
        title: "",
        description: "",
        changes: [""],
        created_at: "",
        updated_at: "",
        isEditing: true,
        isNew: true,
        errors: {},
      },
      ...prev,
    ]);
  };

  /* ---------------- UPDATE FIELD ---------------- */

  const updateField = (id, field, value, index = null) => {
    setVersions((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;

        if (field === "changes" && index !== null) {
          const newChanges = [...v.changes];
          newChanges[index] = value;
          return { ...v, changes: newChanges };
        }

        return { ...v, [field]: value };
      }),
    );
  };

  const addChangeField = (id) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, changes: [...v.changes, ""] } : v,
      ),
    );
  };

  const removeChangeField = (id, index) => {
    setVersions((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, changes: v.changes.filter((_, i) => i !== index) }
          : v,
      ),
    );
  };

  /* ---------------- SAVE ---------------- */

  const saveVersion = async (id) => {
    const versionToSave = versions.find((v) => v.id === id);
    const errors = validateVersion(versionToSave);

    if (Object.keys(errors).length > 0) {
      setVersions((prev) =>
        prev.map((v) => (v.id === id ? { ...v, errors } : v)),
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        version: versionToSave.version,
        title: versionToSave.title,
        description: versionToSave.description,
        changes: versionToSave.changes,
      };

      if (versionToSave.isNew) {
        await createVersion(payload);
      } else {
        await updateVersion(id, payload);
      }

      await loadVersions();
    } catch {
      alert("Failed to save version");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */

  const openDeleteModal = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteVersion(deleteTargetId);

      setVersions((prev) => prev.filter((v) => v.id !== deleteTargetId));
      setShowDeleteModal(false);
    } catch {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (id) => {
    setVersions((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isEditing: true } : v)),
    );
  };

  const cancelEdit = (id) => {
    setVersions((prev) =>
      prev
        .map((v) => (v.id === id ? { ...v, isEditing: false } : v))
        .filter((v) => !(v.isNew && v.id === id)),
    );
  };

  /* ---------------- UI ---------------- */

  if (loading) return <p className="p-10 text-gray-900 dark:text-gray-100">Loading...</p>;
  if (error) return <p className="p-10 text-red-500 dark:text-red-400">{error}</p>;

  return (
    <div className="min-h-screen p-10 bg-slate-50 dark:bg-gray-900">
      <div className="flex justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">What's New</h1>
          <h5 className="text-black dark:text-gray-300">
            Follow Our latest Updates and Improvements
          </h5>
        </div>

        <Can permission={PermissionGroups.SETTINGS.VERSION_ADD}>
          <Button
            onClick={handleNewVersionClick}
            variant="secondary"
            size="md"
            className="rounded-xl px-5"
          >
            <Plus className="w-4 h-4" />
            New Version
          </Button>
        </Can>
      </div>

      <div className="space-y-6">
        {versions.map((v) => (
          <div key={v.id} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow relative">
            {v.isEditing ? (
              <div className="space-y-4">
                <input
                  value={v.version}
                  onChange={(e) => updateField(v.id, "version", e.target.value)}
                  placeholder="Version"
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />

                <input
                  value={v.title}
                  onChange={(e) => updateField(v.id, "title", e.target.value)}
                  placeholder="Title"
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />

                <textarea
                  value={v.description}
                  onChange={(e) =>
                    updateField(v.id, "description", e.target.value)
                  }
                  placeholder="Description"
                  className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />

                {v.changes.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={c}
                      onChange={(e) =>
                        updateField(v.id, "changes", e.target.value, i)
                      }
                      className="w-full border dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />

                    <button
                      onClick={() => removeChangeField(v.id, i)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addChangeField(v.id)}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
                >
                  + Add Change
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => saveVersion(v.id)}
                    className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => cancelEdit(v.id)}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                    {v.version}
                  </span>

                  <div className="flex items-start gap-6">
                    <div className="text-sm text-gray-400 dark:text-gray-500 text-right">
                      <div>Created: {v.created_at}</div>

                      {v.updated_at && v.updated_at !== v.created_at && (
                        <div>Updated: {v.updated_at}</div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Can permission={PermissionGroups.SETTINGS.VERSION_EDIT}>
                        <button onClick={() => handleEdit(v.id)}>
                          <Pencil className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        </button>
                      </Can>
                      <Can
                        permission={PermissionGroups.SETTINGS.VERSION_DELETE}
                      >
                        <button onClick={() => openDeleteModal(v.id)}>
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </Can>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{v.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">{v.description}</p>

                <ul className="mt-3 space-y-1 text-gray-900 dark:text-gray-200">
                  {v.changes.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80">
            <p className="mb-4 text-gray-900 dark:text-gray-100">
              Are you sure you want to delete this version?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
