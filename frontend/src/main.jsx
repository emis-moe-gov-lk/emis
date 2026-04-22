import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router"; // use react-router-dom, not react-router
import { AuthProvider } from "@asgardeo/auth-react";
import AppRoutes from "./routes/AppRoutes.jsx";
import { asgardeoConfig } from "./authConfig.js";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { AuthUserProvider } from "./context/AuthUserContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider config={asgardeoConfig}>
      <AuthUserProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthUserProvider>
    </AuthProvider>
  </StrictMode>,
);
