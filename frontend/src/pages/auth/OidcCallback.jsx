import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "@asgardeo/auth-react";
import { useAuthUser } from "../../context/useAuthUser.js";

export default function OidcCallback() {
  const { state, getAccessToken } = useAuthContext();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const { setUser } = useAuthUser();

  useEffect(() => {
    if (state.isLoading) return;
    if (hasRedirected) return;

    if (state.isAuthenticated) {
      const loadIdentity = async () => {
        try {
          const token = await getAccessToken();

          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/identity`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const data = await response.json();

          console.log("Identity Data:", data.data);

          // store if needed
          localStorage.setItem("peopleId", data.data.people_id);
          localStorage.setItem("email", data.data.email);
          localStorage.setItem("name", data.data.name);
          localStorage.setItem(
            "username",
            data.data.username ||
              data.data.preferred_username ||
              data.data.user_name ||
              "",
          );
          localStorage.setItem("gender", data.data.gender);
          localStorage.setItem("roles", JSON.stringify(data.data.roles));
          localStorage.setItem("identityData", JSON.stringify(data.data));

          setUser(data);
          setHasRedirected(true);

          navigate("/dashboard", { replace: true });
        } catch (error) {
          console.error("Identity fetch failed", error);
          navigate("/login");
        }
      };

      loadIdentity();
    }
  }, [state.isLoading, state.isAuthenticated]);

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
