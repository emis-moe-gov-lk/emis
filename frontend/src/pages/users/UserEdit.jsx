import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Label, Spinner, TextInput } from "flowbite-react";
import { HiArrowLeft, HiEye, HiEyeOff, HiPencilAlt } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getRoles } from "@/api/roleService";
import { getUserById, parseUserApiError, updateUser } from "@/api/userService";

const initialForm = {
  name: "",
  nic: "",
  contactNumber: "",
  email: "",
  password: "",
  confirmPassword: "",
  roles: [],
  reason: "",
};

const UserEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const userId = id ?? location.state?.userId;

  const [form, setForm] = useState(initialForm);
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialRoles, setInitialRoles] = useState([]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const userData = await getUserById(userId);
        if (mounted && userData) {
          const account = userData?.account ?? userData;
          const personal = userData?.personal ?? {};

          const roleNames = Array.isArray(account?.role)
            ? account.role.map((role) => (typeof role === "string" ? role : role?.name)).filter(Boolean)
            : Array.isArray(account?.roles)
              ? account.roles
                  .map((role) => (typeof role === "string" ? role : role?.name))
                  .filter(Boolean)
              : typeof account?.role === "string"
                ? [account.role]
                : [];


          setForm({
            name:
              account?.name ??
              personal?.name_with_initials ??
              personal?.full_name ??
              userData?.name ??
              userData?.full_name ??
              "",
            nic: account?.nic ?? userData?.nic ?? userData?.nic_no ?? "",
            contactNumber:
              account?.contact ??
              userData?.contact ??
              userData?.contact_number ??
              userData?.phone ??
              "",
            email: account?.email ?? userData?.email ?? "",
            password: "",
            confirmPassword: "",
            roles: roleNames,
            reason: "",
          });
          setInitialRoles(roleNames);
        }
      } catch (error) {
        console.error("Failed to load user details:", error);
        toast.error("Unable to load user details.");
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      setLoadingRoles(true);
      try {
        const roleList = await getRoles();
        if (mounted) {
          setRoles(roleList);
        }
      } catch (error) {
        console.error("Failed to load roles:", error);
        toast.error("Unable to load roles.");
      } finally {
        if (mounted) {
          setLoadingRoles(false);
        }
      }
    };

    loadRoles();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedRoleSet = useMemo(() => new Set(form.roles), [form.roles]);

  const normalizeRole = (value) => String(value ?? "").trim().toLowerCase();

  const hasPrincipalSelected = useMemo(
    () => form.roles.some((role) => normalizeRole(role) === "principal"),
    [form.roles],
  );

  const hadPrincipalInitially = useMemo(
    () => initialRoles.some((role) => normalizeRole(role) === "principal"),
    [initialRoles],
  );

  const hadTeacherInitially = useMemo(
    () => initialRoles.some((role) => normalizeRole(role) === "teacher"),
    [initialRoles],
  );

  const isTeacherToPrincipalPromotion =
    hasPrincipalSelected && hadTeacherInitially && !hadPrincipalInitially;

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleRole = (roleName) => {
    setForm((prev) => {
      const roleSet = new Set(prev.roles);
      if (roleSet.has(roleName)) {
        roleSet.delete(roleName);
      } else {
        roleSet.add(roleName);
      }

      return { ...prev, roles: Array.from(roleSet) };
    });
    setErrors((prev) => ({ ...prev, roles: undefined }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.nic.trim()) nextErrors.nic = "NIC is required.";
    if (!form.contactNumber.trim()) nextErrors.contactNumber = "Contact number is required.";

    const email = form.email.trim();
    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    const passwordEntered = Boolean(form.password || form.confirmPassword);
    if (passwordEntered) {
      if (form.password.length < 8) {
        nextErrors.password = "Password must be at least 8 characters.";
      }
      if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = "Passwords do not match.";
      }
    }

    if (form.roles.length === 0) {
      nextErrors.roles = "Select at least one role.";
    }

    if (isTeacherToPrincipalPromotion && !form.reason.trim()) {
      nextErrors.reason = "Reason is required when promoting teacher to principal.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      toast.error("User ID is missing. Please reopen edit from the users list.");
      return;
    }

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await updateUser(userId, form);
      toast.success("User updated successfully.");
      navigate("/users");
    } catch (error) {
      console.error("Failed to update user:", error);
      const { message, fieldErrors } = parseUserApiError(error, "Unable to update user.");

      setErrors((prev) => ({
        ...prev,
        name: fieldErrors?.name?.[0] ?? prev.name,
        nic: fieldErrors?.nic?.[0] ?? prev.nic,
        contactNumber:
          fieldErrors?.contact?.[0] ??
          fieldErrors?.contact_number?.[0] ??
          fieldErrors?.contactNumber?.[0] ??
          prev.contactNumber,
        email: fieldErrors?.email?.[0] ?? prev.email,
        password: fieldErrors?.password?.[0] ?? prev.password,
        confirmPassword:
          fieldErrors?.password_confirmation?.[0] ??
          fieldErrors?.confirmPassword?.[0] ??
          prev.confirmPassword,
        roles: fieldErrors?.roles?.[0] ?? prev.roles,
        reason: fieldErrors?.reason?.[0] ?? prev.reason,
      }));

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
        <div className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 px-6 sm:px-8 py-8 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100">User Management</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold">User Edit</h1>
          <p className="text-cyan-100 mt-2">Update user profile and account</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-7 space-y-7">
          {loadingUser && (
            <div className="rounded-xl border border-sky-100 bg-sky-50 text-sky-700 px-4 py-3 text-sm flex items-center gap-2">
              <Spinner size="sm" /> Loading user data...
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name" value="Name" />
              </div>
              <TextInput
                id="name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Full name"
                color={errors.name ? "failure" : "gray"}
                helperText={errors.name}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="nic" value="National identity card" />
              </div>
              <TextInput
                id="nic"
                value={form.nic}
                onChange={(event) => setField("nic", event.target.value)}
                placeholder="Your NIC number"
                color={errors.nic ? "failure" : "gray"}
                helperText={errors.nic}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="contactNumber" value="Contact Number" />
              </div>
              <TextInput
                id="contactNumber"
                value={form.contactNumber}
                onChange={(event) => setField("contactNumber", event.target.value)}
                placeholder="Your Mobile Number"
                color={errors.contactNumber ? "failure" : "gray"}
                helperText={errors.contactNumber}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email address" />
              </div>
              <TextInput
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                placeholder="email@example.com"
                color={errors.email ? "failure" : "gray"}
                helperText={errors.email}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password (optional)" />
              </div>
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setField("password", event.target.value)}
                  placeholder="Leave blank to keep current password"
                  color={errors.password ? "failure" : "gray"}
                  helperText={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="confirmPassword" value="Confirm password" />
              </div>
              <div className="relative">
                <TextInput
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => setField("confirmPassword", event.target.value)}
                  placeholder="Confirm password"
                  color={errors.confirmPassword ? "failure" : "gray"}
                  helperText={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Role</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select one or more roles for this account.</p>

            {loadingRoles ? (
              <div className="py-5 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Spinner size="sm" /> Loading roles...
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {roles.map((role) => {
                  const isChecked = selectedRoleSet.has(role.name);
                  return (
                    <label
                      key={role.id ?? role.name}
                      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? "border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-900/20"
                          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40"
                      }`}
                    >
                      <Checkbox checked={isChecked} onChange={() => toggleRole(role.name)} />
                      <span className="text-sm text-slate-700 dark:text-slate-200">{role.name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {errors.roles && <p className="text-sm text-red-600 mt-2">{errors.roles}</p>}

            {isTeacherToPrincipalPromotion && (
              <div className="mt-4 space-y-2">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  This change will promote a teacher to principal and update service to SLPS.
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="reason" value="Promotion Reason" />
                  </div>
                  <textarea
                    id="reason"
                    rows={3}
                    value={form.reason}
                    onChange={(event) => setField("reason", event.target.value)}
                    placeholder="Why is this user being promoted to principal?"
                    className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                      errors.reason
                        ? "border-red-500 bg-red-50 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/10"
                        : "border-gray-300 bg-white focus:ring-sky-200 dark:border-gray-600 dark:bg-gray-900"
                    }`}
                  />
                  {errors.reason && <p className="text-sm text-red-600 mt-1">{errors.reason}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
            <Button
              type="button"
              color="light"
              onClick={() => navigate("/users")}
              className="w-full sm:w-auto"
            >
              <HiArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>

            <Button
              type="submit"
              disabled={submitting || loadingUser || !userId}
              className="w-full sm:w-auto bg-slate-900 hover:bg-black"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <HiPencilAlt className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;
