import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "@asgardeo/auth-react";

export default function Logout() {
  const { signOut, state } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        console.log("Logging out user and clearing session...");

        // Clear local/session storage
        sessionStorage.clear();
        localStorage.clear();

        // Sign out from Asgardeo
        await signOut();

        console.log("Logout successful, redirecting to /");
      } catch (error) {
        console.error("Error during logout:", error);
        // Even if signOut fails, redirect to home
        navigate("/", { replace: true });
      }
    };

    // If already logged out, just redirect
    if (!state.isAuthenticated && !state.isLoading) {
      console.log("User already logged out, redirecting to /");
      navigate("/", { replace: true });
    } else if (!state.isLoading) {
      handleLogout();
    }
  }, [signOut, navigate, state.isAuthenticated, state.isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Logging out...
        </h1>
        <p className="text-gray-500 text-center">
          Please wait while we sign you out securely.
        </p>
      </div>
    </div>
  );
}
