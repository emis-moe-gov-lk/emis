import React from "react";
import { useAuthContext } from "@asgardeo/auth-react";
import { Button } from "flowbite-react";
import LogoutButton from "./LogoutButton";

export default function LoginButton() {
  const { state, signIn } = useAuthContext();

  if (state.isLoading) {
    return <button disabled>Loading...</button>;
  }

  if (state.isAuthenticated) {
    return <LogoutButton />;
  }

  return (
    <div className="flex justify-center items-center h-full py-4">
      <Button
        onClick={() => signIn()}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Login
      </Button>
    </div>
  );
}
