import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthUser } from "@/context/useAuthUser";
import {
    createRole,
    getPermissions,
    getRolePermissions,
    parseRoleApiError,
    updateRole,
} from "@/api/roleService";

const CreateRole = () => {
    const navigate = useNavigate();
    const { hydrateIdentity } = useAuthUser();
    const [searchParams] = useSearchParams();
    const roleId = searchParams.get("roleId");
    const isEditMode = Boolean(roleId);
    const [roleName, setRoleName] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [search, setSearch] = useState("");
    const [nameError, setNameError] = useState("");
    const [permissionError, setPermissionError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [permissionGroups, setPermissionGroups] = useState([]);

    const loadPermissionCatalog = useCallback(async () => {
        try {
            const groupedPermissions = await getPermissions();
            setPermissionGroups(
                Object.entries(groupedPermissions).map(([title, permissions]) => ({
                    title,
                    permissions: permissions.map((permission) => `${title}.${permission}`),
                }))
            );
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Unable to load permissions.");
        }
    }, []);

    const loadRoleDetails = useCallback(async () => {
        if (!roleId) {
            return;
        }

        setIsDetailsLoading(true);

        try {
            const roleDetails = await getRolePermissions(roleId);

            setRoleName(roleDetails.name ?? "");
            setSelectedPermissions(roleDetails.selectedPermissions ?? []);
        } catch (error) {
            console.error("Error fetching role details:", error);
            toast.error("Unable to load role details.");
        } finally {
            setIsDetailsLoading(false);
        }
    }, [roleId]);

    useEffect(() => {
        loadRoleDetails();
    }, [loadRoleDetails]);

    useEffect(() => {
        loadPermissionCatalog();
    }, [loadPermissionCatalog]);

    const selectedSet = useMemo(
        () => new Set(selectedPermissions),
        [selectedPermissions]
    );

    const filteredPermissionGroups = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) {
            return permissionGroups;
        }

        return permissionGroups
            .map((group) => ({
                ...group,
                permissions: group.permissions.filter((permission) =>
                    permission.toLowerCase().includes(term)
                ),
            }))
            .filter((group) => group.permissions.length > 0);
    }, [permissionGroups, search]);

    const permissionStats = useMemo(() => {
        const total = permissionGroups.reduce(
            (count, group) => count + group.permissions.length,
            0
        );

        return {
            total,
            selected: selectedPermissions.length,
        };
    }, [permissionGroups, selectedPermissions.length]);

    const togglePermission = (permissionName) => {
        setPermissionError("");
        setSelectedPermissions((current) =>
            current.includes(permissionName)
                ? current.filter((permission) => permission !== permissionName)
                : [...current, permissionName]
        );
    };

    const toggleGroup = (permissions) => {
        const allSelected = permissions.every((permission) => selectedSet.has(permission));

        setPermissionError("");
        setSelectedPermissions((current) => {
            if (allSelected) {
                return current.filter((permission) => !permissions.includes(permission));
            }

            return Array.from(new Set([...current, ...permissions]));
        });
    };

    const validate = () => {
        const trimmedName = roleName.trim();
        let valid = true;

        if (!trimmedName) {
            setNameError("Role name is required.");
            valid = false;
        } else if (trimmedName.length < 3) {
            setNameError("Role name must be at least 3 characters.");
            valid = false;
        } else {
            setNameError("");
        }

        if (selectedPermissions.length === 0) {
            setPermissionError("Select at least one permission.");
            valid = false;
        } else {
            setPermissionError("");
        }

        return valid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            toast.error("Please fix the form errors.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (isEditMode) {
                await updateRole(roleId, roleName, selectedPermissions);
                await hydrateIdentity().catch(() => {});

                toast.success(`Role \"${roleName.trim()}\" updated successfully.`);
                navigate("/roles");
                return;
            }

            await createRole(roleName, selectedPermissions);
            await hydrateIdentity().catch(() => {});

            toast.success(
                `Role \"${roleName.trim()}\" created successfully.`
            );
            navigate("/roles");
        } catch (error) {
            console.error("Error saving role:", error);

            const { fieldErrors, message } = parseRoleApiError(
                error,
                isEditMode ? "Unable to update role." : "Unable to save role."
            );

            if (fieldErrors?.role_name?.[0] || fieldErrors?.roleName?.[0]) {
                setNameError(fieldErrors.role_name?.[0] ?? fieldErrors.roleName?.[0]);
            }

            if (
                fieldErrors?.selectedPermissions?.[0] ||
                fieldErrors?.permissions?.[0]
            ) {
                setPermissionError(
                    fieldErrors.selectedPermissions?.[0] ?? fieldErrors.permissions?.[0]
                );
            }

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRoleNameChange = (event) => {
        setRoleName(event.target.value);

        if (nameError) {
            setNameError("");
        }
    };

    return (
        <div className="w-full bg-white px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full">
                <div className="pb-6">
                    <h1 className="text-[18px] font-semibold text-slate-900">
                        {isEditMode ? "Edit Role" : "Create Role"}
                    </h1>
                    <p className="mt-2 text-[14px] text-slate-500">
                        {isEditMode
                            ? "Update role profile and assigned permissions"
                            : "Create role profile and permissions"}
                    </p>
                </div>

                {isEditMode && isDetailsLoading ? (
                    <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Loading role details...
                    </div>
                ) : null}

                <div className="border-t border-slate-200" />

                <form onSubmit={handleSubmit} className="w-full">
                    <fieldset disabled={isSubmitting || (isEditMode && isDetailsLoading)}>
                    <section className="py-6">
                        <label
                            htmlFor="role-name"
                            className="block text-[14px] font-semibold text-slate-800"
                        >
                            Role Name
                        </label>
                        <input
                            id="role-name"
                            value={roleName}
                            onChange={handleRoleNameChange}
                            placeholder="Enter role name"
                            aria-invalid={Boolean(nameError)}
                            className={`mt-3 h-10 w-full max-w-[440px] rounded-md border px-4 text-[14px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400 ${
                                nameError ? "border-rose-400" : "border-slate-300"
                            }`}
                        />
                        {nameError ? (
                            <p className="mt-2 text-xs text-rose-600">{nameError}</p>
                        ) : null}
                    </section>

                    <div className="border-t border-slate-200" />

                    <section className="py-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-[14px] font-semibold text-slate-800">Permissions</h2>
                                <p className="text-xs text-slate-500">
                                    Selected {permissionStats.selected} of {permissionStats.total}
                                </p>
                            </div>

                            <div className="w-full md:w-80">
                                <label htmlFor="permission-search" className="sr-only">
                                    Search permissions
                                </label>
                                <input
                                    id="permission-search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search permission"
                                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        {permissionError ? (
                            <p className="mt-3 text-xs text-rose-600">{permissionError}</p>
                        ) : null}

                        <div className="mt-6 space-y-6">
                            {filteredPermissionGroups.map((group) => (
                                <div key={group.title}>
                                    <div className="mb-3 flex items-center justify-between gap-4">
                                        <h3 className="text-[12px] font-medium uppercase tracking-normal text-slate-500">
                                            {group.title}
                                        </h3>
                                        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={group.permissions.every((permission) =>
                                                    selectedSet.has(permission)
                                                )}
                                                onChange={() => toggleGroup(group.permissions)}
                                                className="h-4 w-4 rounded border-slate-300 accent-black focus:ring-0"
                                            />
                                            Select group
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-14 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
                                        {group.permissions.map((permission) => {
                                            const checked = selectedSet.has(permission);

                                            return (
                                                <label
                                                    key={permission}
                                                    className="flex items-center gap-2 text-[14px] text-slate-700"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => togglePermission(permission)}
                                                        className="h-4 w-4 rounded border-slate-300 accent-black focus:ring-0"
                                                    />
                                                    <span>{permission}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {filteredPermissionGroups.length === 0 ? (
                                <p className="text-sm text-slate-500">No permissions match your search.</p>
                            ) : null}
                        </div>
                    </section>

                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                        <NavLink
                            to="/roles"
                            aria-disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </NavLink>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Saving..."
                                : isEditMode
                                  ? "Update Role"
                                  : "Save Role"}
                        </button>
                    </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};

export default CreateRole;
