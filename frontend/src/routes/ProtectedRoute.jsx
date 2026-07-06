import { useAuthContext } from "@asgardeo/auth-react";
import { Navigate, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthUser } from "@/context/useAuthUser";

export default function ProtectedRoute({ roles, permissions, anyPermissions, children }) {
  const { state } = useAuthContext();
  const { hasPermission, hasRole, isLoading, mustChangePassword } = useAuthUser();
  const location = useLocation();

  if (state.isLoading || isLoading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-vh-100 min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden relative"
        >
          {/* Decorative background elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative z-10 px-10 py-12 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 dark:border-gray-700/30 flex flex-col items-center text-center"
          >
            {/* Elegant Loading Animation */}
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-gray-100 dark:border-gray-700 rounded-full"></div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="absolute top-0 w-20 h-20 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_-4px_10px_-2px_rgba(37,99,235,0.4)]"
              ></motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
              </div>
            </div>

            <h1 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white mb-2">
              Authenticating
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm animate-pulse">
              Checking authorization...
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isPasswordRoute = location.pathname === "/force-password-change";
  const isLogoutRoute = location.pathname === "/logout";
  const shouldForcePasswordChange = mustChangePassword;

  if (shouldForcePasswordChange && !isPasswordRoute && !isLogoutRoute) {
    return <Navigate to="/force-password-change" replace />;
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.some((role) => hasRole(role))) {
    return <Navigate to="/not-authorized" replace />;
  }

  if (
    Array.isArray(permissions) &&
    permissions.length > 0 &&
    !permissions.every((permission) => hasPermission(permission))
  ) {
    return <Navigate to="/not-authorized" replace />;
  }

  if (
    Array.isArray(anyPermissions) &&
    anyPermissions.length > 0 &&
    !anyPermissions.some((permission) => hasPermission(permission))
  ) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children ?? <Outlet />;
}
