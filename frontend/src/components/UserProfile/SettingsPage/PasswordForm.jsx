import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { changeOwnPassword } from "@/api/auth";
import { useAuthUser } from "@/context/useAuthUser";

const PasswordForm = ({ forceMode = false }) => {
  const navigate = useNavigate();
  const { hydrateIdentity } = useAuthUser();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      await changeOwnPassword({
        new_password: formData.newPassword,
        new_password_confirmation: formData.confirmPassword,
      });
      await hydrateIdentity();
      toast.success("Password changed successfully.");
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
      if (forceMode) {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Change Password</h3>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword.new ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={saving}
            className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => togglePassword("new")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword.new ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showPassword.confirm ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={saving}
            className="w-full border border-gray-300 rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            onClick={() => togglePassword("confirm")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword.confirm ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};

export default PasswordForm;
