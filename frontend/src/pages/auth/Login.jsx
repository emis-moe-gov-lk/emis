import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "@asgardeo/auth-react";
import LoginButton from "../../components/auth/LoginButton";
import emblem from "../../assets/images/Emblem_of_Sri_Lanka.svg"; // import image

export const Login = () => {
  const { state } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (state.isAuthenticated && !state.isLoading) {
      console.log("User already authenticated, redirecting to /dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [state.isAuthenticated, state.isLoading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md text-center">
        {/* Logo or App Name */}
        <div className="mb-6">
          {/* Emblem */}
          <img
            src={emblem}
            alt="Emblem of Sri Lanka"
            className="w-10 h-auto mb-4 m-auto"
          />
          <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
          <p className="text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* Login Button */}
        <div className=" flex items-center justify-center">
          <LoginButton />
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-400 mt-8">
          © {new Date().getFullYear()} Ministry of Education - EMIS
        </p>
      </div>
    </div>
  );
};
