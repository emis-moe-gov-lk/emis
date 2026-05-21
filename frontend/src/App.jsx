import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";
import { useAuthContext } from "@asgardeo/auth-react";
import "./App.css";

function App() {
  const { state } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isLoading) return;

    if (state.isAuthenticated) {
      if (window.location.pathname === "/") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [state.isLoading, state.isAuthenticated, navigate]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#020617] text-white">
        Loading...
      </div>
    );
  }

  return <Outlet />;
}

export default App;
