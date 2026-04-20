import React from "react";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";

export const NotAuthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-800 mb-3">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-8">
          You don’t have permission to view this page.  
          Please contact your administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
