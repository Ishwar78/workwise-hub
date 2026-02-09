import { createContext, useContext, useState, ReactNode } from "react";
import { AppRole } from "@/lib/permissions";

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  companyName: string;
}

interface AuthContextValue {
  user: MockUser;
  setRole: (role: AppRole) => void;
}

const MOCK_USER: MockUser = {
  id: "u1",
  name: "Alice Johnson",
  email: "alice@acme.com",
  role: "company_admin",
  companyName: "Acme Corp",
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser>(MOCK_USER);

  const setRole = (role: AppRole) => {
    setUser((prev) => ({ ...prev, role }));
  };

  return (
    <AuthContext.Provider value={{ user, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
