import React, { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiMoreVertical,
  FiShield,
  FiKey,
  FiChevronDown,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { deleteRole, getRoles, parseRoleApiError } from "@/api/roleService";
import { useAuthUser } from "@/context/useAuthUser";

const sortRolesById = (roles) =>
  [...roles].sort((a, b) => {
    const aId = Number(a?.id);
    const bId = Number(b?.id);

    if (Number.isFinite(aId) && Number.isFinite(bId)) {
      return aId - bId;
    }

    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });

const RolesList = () => {
  const { hydrateIdentity } = useAuthUser();
  const [openRole, setOpenRole] = useState(null);
  const [openMenuRole, setOpenMenuRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingRoleId, setDeletingRoleId] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const rolesData = await getRoles();
      setRoles(sortRolesById(rolesData));
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Unable to load roles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const togglePermissions = (id) => {
    setOpenRole(openRole === id ? null : id);
  };

  const toggleActionMenu = (id) => {
    setOpenMenuRole((currentOpenMenu) => (currentOpenMenu === id ? null : id));
  };

  const handleDeleteRole = async (roleId, roleName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the role \"${roleName}\"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingRoleId(roleId);

    try {
      await deleteRole(roleId);
      await hydrateIdentity().catch(() => {});
      setRoles((currentRoles) =>
        sortRolesById(currentRoles.filter((role) => role.id !== roleId)),
      );
      setOpenMenuRole(null);
      setOpenRole((currentOpenRole) => (currentOpenRole === roleId ? null : currentOpenRole));
      toast.success("Role deleted successfully.");
    } catch (deleteError) {
      console.error("Error deleting role:", deleteError);
      const { message } = parseRoleApiError(deleteError, "Unable to delete role.");
      toast.error(message);
    } finally {
      setDeletingRoleId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-left px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Roles List
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">
            Manage role profiles and permissions
          </p>
        </div>

        <NavLink
          to="/roles/create"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-white shadow-sm transition hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          <FiPlus />
          Create New Role
        </NavLink>
      </header>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Role Cards */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Loading roles...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-red-50 dark:bg-red-900/20 rounded-[2.5rem] border-2 border-dashed border-red-200 dark:border-red-900/40 text-center">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Failed to load roles</h3>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            <button
              onClick={fetchRoles}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-red-700 dark:bg-red-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 dark:hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : roles.length > 0 ? (
          roles.map((role) => {
            const grouped = role.groupedPermissions;
            const permissionCount = role.permissionCount;

            return (
              <div
                key={role.id}
                className="group bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl dark:hover:shadow-slate-900/50"
              >
                <div className="flex flex-col space-y-4">
                  {/* Role Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <FiShield className="text-indigo-600 dark:text-indigo-400" size={20} />
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          {role.name}
                        </h3>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          ID: {role.id}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => toggleActionMenu(role.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        aria-haspopup="menu"
                        aria-expanded={openMenuRole === role.id}
                        aria-label={`Open actions for ${role.name}`}
                      >
                        <FiMoreVertical />
                      </button>

                      {openMenuRole === role.id && (
                        <div
                          className="absolute right-0 top-11 z-20 w-36 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 py-1 shadow-lg dark:shadow-slate-900/50"
                          role="menu"
                        >
                          <NavLink
                            to={`/roles/create?roleId=${role.id}`}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-700"
                            role="menuitem"
                            onClick={() => setOpenMenuRole(null)}
                          >
                            <FiEdit2 className="text-slate-500 dark:text-slate-400" />
                            Edit
                          </NavLink>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            disabled={deletingRoleId === role.id}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <FiTrash2 />
                            {deletingRoleId === role.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Permissions Collapse */}
                  <div className="border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => togglePermissions(role.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700/50 hover:bg-slate-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-2">
                        <FiKey className="text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          {permissionCount} Permissions
                        </span>
                      </div>

                      <FiChevronDown
                        className={`transition-transform ${
                          openRole === role.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openRole === role.id && (
                      <div className="p-4 bg-white dark:bg-gray-800 border-t border-slate-100 dark:border-slate-700">
                        {permissionCount > 0 ? (
                          <div className="space-y-4">
                            {Object.keys(grouped).map((prefix) => (
                              <div key={prefix}>
                                <div className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
                                  {prefix}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {grouped[prefix].map((perm) => (
                                    <span
                                      key={`${prefix}.${perm}`}
                                      className="text-[10px] py-0 px-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-md"
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs italic text-gray-400 dark:text-gray-500">
                            No permissions assigned to this role.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <FiShield className="text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Roles Defined
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Get started by creating your first security role.
            </p>
            <NavLink
              to="/roles/create"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 dark:bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-700"
            >
              <FiPlus />
              Create New Role
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesList;
