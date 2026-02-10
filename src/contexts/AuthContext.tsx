import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AppRole } from "@/lib/permissions";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  companyName: string;
  companyId: number;
  deviceId?: string;
  isTracking?: boolean;
}

export interface PendingInvite {
  token: string;
  email: string;
  role: AppRole;
  companyId: number;
  companyName: string;
  status: "pending" | "accepted" | "expired";
  sent: string;
}

interface AuthContextValue {
  user: MockUser | null;
  isAuthenticated: boolean;
  invites: PendingInvite[];
  login: (email: string, password: string) => { success: boolean; error?: string; redirectTo?: string };
  logout: () => void;
  setRole: (role: AppRole) => void;
  acceptInvite: (token: string, name: string, password: string) => { success: boolean; error?: string };
  addInvite: (invite: Omit<PendingInvite, "status" | "sent">) => void;
  bindDevice: (deviceId: string) => void;
}

// Simulated user database (email -> credentials)
const MOCK_CREDENTIALS: Record<string, { password: string; user: MockUser }> = {
  "alice@acme.com": {
    password: "admin123",
    user: { id: "u1", name: "Alice Johnson", email: "alice@acme.com", role: "company_admin", companyName: "Acme Corp", companyId: 1 },
  },
  "bob@acme.com": {
    password: "user123",
    user: { id: "u2", name: "Bob Smith", email: "bob@acme.com", role: "user", companyName: "Acme Corp", companyId: 1 },
  },
  "david@techflow.io": {
    password: "admin123",
    user: { id: "u4", name: "David Lee", email: "david@techflow.io", role: "company_admin", companyName: "TechFlow Inc", companyId: 2 },
  },
  "superadmin@webmok.com": {
    password: "super123",
    user: { id: "sa1", name: "Super Admin", email: "superadmin@webmok.com", role: "company_admin", companyName: "WebMok", companyId: 0 },
  },
};

const DEFAULT_INVITES: PendingInvite[] = [
  { token: "inv_a1b2c3", email: "john@acme.com", role: "user", companyId: 1, companyName: "Acme Corp", status: "pending", sent: "2026-02-08" },
  { token: "inv_d4e5f6", email: "sarah@acme.com", role: "sub_admin", companyId: 1, companyName: "Acme Corp", status: "pending", sent: "2026-02-07" },
  { token: "inv_g7h8i9", email: "mike@acme.com", role: "user", companyId: 1, companyName: "Acme Corp", status: "expired", sent: "2026-01-25" },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(MOCK_CREDENTIALS["alice@acme.com"].user);
  const [credentials, setCredentials] = useState(MOCK_CREDENTIALS);
  const [invites, setInvites] = useState<PendingInvite[]>(DEFAULT_INVITES);

  const login = useCallback((email: string, password: string) => {
    const cred = credentials[email.toLowerCase()];
    if (!cred) return { success: false, error: "No account found with this email." };
    if (cred.password !== password) return { success: false, error: "Incorrect password." };

    const loggedInUser: MockUser = {
      ...cred.user,
      deviceId: `device_${Math.random().toString(36).slice(2, 8)}`,
      isTracking: true,
    };
    setUser(loggedInUser);

    // Determine redirect based on role/company
    const redirectTo = email === "superadmin@webmok.com" ? "/super-admin" : "/dashboard";
    return { success: true, redirectTo };
  }, [credentials]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const setRole = useCallback((role: AppRole) => {
    setUser(prev => prev ? { ...prev, role } : prev);
  }, []);

  const acceptInvite = useCallback((token: string, name: string, password: string) => {
    const invite = invites.find(i => i.token === token);
    if (!invite) return { success: false, error: "Invalid invite link." };
    if (invite.status === "expired") return { success: false, error: "This invite has expired." };
    if (invite.status === "accepted") return { success: false, error: "This invite has already been used." };

    // Create user account
    const newUser: MockUser = {
      id: `u_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email: invite.email,
      role: invite.role,
      companyName: invite.companyName,
      companyId: invite.companyId,
      deviceId: `device_${Math.random().toString(36).slice(2, 8)}`,
      isTracking: true,
    };

    // Add to credentials
    setCredentials(prev => ({
      ...prev,
      [invite.email.toLowerCase()]: { password, user: newUser },
    }));

    // Mark invite as accepted
    setInvites(prev => prev.map(i => i.token === token ? { ...i, status: "accepted" as const } : i));

    // Auto-login
    setUser(newUser);
    return { success: true };
  }, [invites]);

  const addInvite = useCallback((invite: Omit<PendingInvite, "status" | "sent">) => {
    setInvites(prev => [
      { ...invite, status: "pending", sent: new Date().toISOString().split("T")[0] },
      ...prev,
    ]);
  }, []);

  const bindDevice = useCallback((deviceId: string) => {
    setUser(prev => prev ? { ...prev, deviceId, isTracking: true } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, invites, login, logout, setRole, acceptInvite, addInvite, bindDevice }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
