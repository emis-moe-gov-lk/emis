import { createContext, useState } from "react";

// Context
export const AuthUserContext = createContext(null);

// Provider
export function AuthUserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthUserContext.Provider>
  );
}
