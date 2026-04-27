import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "@asgardeo/auth-react";
import { useAuthUser } from "../../context/useAuthUser.js";

export default function OidcCallback() {
  const { state } = useAuthContext();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const { hydrateIdentity } = useAuthUser();

  useEffect(() => {
    if (state.isLoading) return;
    if (hasRedirected) return;

    if (state.isAuthenticated) {
      const loadIdentity = async () => {
        try {
          await hydrateIdentity();
          setHasRedirected(true);
          navigate("/dashboard", { replace: true });
        } catch (error) {
          console.error("Identity fetch failed", error);
          navigate("/login");
        }
      };

      loadIdentity();
    }
  }, [hasRedirected, hydrateIdentity, navigate, state.isAuthenticated, state.isLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md flex flex-col items-center">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Processing Login...
        </h1>
        <p className="text-gray-500 text-center">
          Please wait while we log you in securely.
        </p>
      </div>
    </div>
  );
}
