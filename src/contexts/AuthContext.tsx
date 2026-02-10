import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AppRole } from "@/lib/permissions";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
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

interface OtpState {
  phone: string;
  code: string;
  expiresAt: number;
}

interface AuthContextValue {
  user: MockUser | null;
  isAuthenticated: boolean;
  invites: PendingInvite[];
  login: (email: string, password: string) => { success: boolean; error?: string; redirectTo?: string; requiresOtp?: boolean };
  logout: () => void;
  setRole: (role: AppRole) => void;
  acceptInvite: (token: string, name: string, password: string, phone: string) => { success: boolean; error?: string; requiresOtp?: boolean };
  addInvite: (invite: Omit<PendingInvite, "status" | "sent">) => void;
  bindDevice: (deviceId: string) => void;
  sendOtp: (phone: string) => { success: boolean; code: string };
  verifyOtp: (phone: string, code: string) => { success: boolean; error?: string };
  pendingOtp: OtpState | null;
  pendingAuth: { type: "login" | "invite"; redirectTo?: string } | null;
  completePendingAuth: () => void;
}

const MOCK_CREDENTIALS: Record<string, { password: string; user: MockUser }> = {
  "alice@acme.com": {
    password: "admin123",
    user: { id: "u1", name: "Alice Johnson", email: "alice@acme.com", phone: "+919876543210", phoneVerified: true, role: "company_admin", companyName: "Acme Corp", companyId: 1 },
  },
  "bob@acme.com": {
    password: "user123",
    user: { id: "u2", name: "Bob Smith", email: "bob@acme.com", phone: "+919876543211", phoneVerified: true, role: "user", companyName: "Acme Corp", companyId: 1 },
  },
  "david@techflow.io": {
    password: "admin123",
    user: { id: "u4", name: "David Lee", email: "david@techflow.io", phone: "+919876543212", phoneVerified: true, role: "company_admin", companyName: "TechFlow Inc", companyId: 2 },
  },
  "superadmin@webmok.com": {
    password: "super123",
    user: { id: "sa1", name: "Super Admin", email: "superadmin@webmok.com", phone: "+919876543200", phoneVerified: true, role: "company_admin", companyName: "WebMok", companyId: 0 },
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
  const [pendingOtp, setPendingOtp] = useState<OtpState | null>(null);
  const [pendingAuth, setPendingAuth] = useState<{ type: "login" | "invite"; redirectTo?: string } | null>(null);
  const [pendingUser, setPendingUser] = useState<MockUser | null>(null);

  const sendOtp = useCallback((phone: string) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOtp({ phone, code, expiresAt: Date.now() + 5 * 60 * 1000 });
    return { success: true, code };
  }, []);

  const verifyOtp = useCallback((phone: string, code: string) => {
    if (!pendingOtp) return { success: false, error: "No OTP was sent." };
    if (pendingOtp.phone !== phone) return { success: false, error: "Phone number mismatch." };
    if (Date.now() > pendingOtp.expiresAt) return { success: false, error: "OTP has expired. Please resend." };
    if (pendingOtp.code !== code) return { success: false, error: "Invalid OTP. Please try again." };
    setPendingOtp(null);

    // Mark phone as verified on pending user
    if (pendingUser) {
      const verifiedUser = { ...pendingUser, phoneVerified: true };
      setUser(verifiedUser);
      setPendingUser(null);
    }
    return { success: true };
  }, [pendingOtp, pendingUser]);

  const completePendingAuth = useCallback(() => {
    setPendingAuth(null);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const cred = credentials[email.toLowerCase()];
    if (!cred) return { success: false, error: "No account found with this email." };
    if (cred.password !== password) return { success: false, error: "Incorrect password." };

    const loggedInUser: MockUser = {
      ...cred.user,
      deviceId: `device_${Math.random().toString(36).slice(2, 8)}`,
      isTracking: true,
    };

    const redirectTo = email === "superadmin@webmok.com" ? "/super-admin" : "/dashboard";

    // For demo: existing users already have phoneVerified=true, so skip OTP
    if (loggedInUser.phoneVerified) {
      setUser(loggedInUser);
      return { success: true, redirectTo };
    }

    // Otherwise require OTP
    setPendingUser(loggedInUser);
    setPendingAuth({ type: "login", redirectTo });
    sendOtp(loggedInUser.phone);
    return { success: true, requiresOtp: true, redirectTo };
  }, [credentials, sendOtp]);

  const logout = useCallback(() => {
    setUser(null);
    setPendingOtp(null);
    setPendingAuth(null);
    setPendingUser(null);
  }, []);

  const setRole = useCallback((role: AppRole) => {
    setUser(prev => prev ? { ...prev, role } : prev);
  }, []);

  const acceptInvite = useCallback((token: string, name: string, password: string, phone: string) => {
    const invite = invites.find(i => i.token === token);
    if (!invite) return { success: false, error: "Invalid invite link." };
    if (invite.status === "expired") return { success: false, error: "This invite has expired." };
    if (invite.status === "accepted") return { success: false, error: "This invite has already been used." };

    const newUser: MockUser = {
      id: `u_${Math.random().toString(36).slice(2, 8)}`,
      name,
      email: invite.email,
      phone,
      phoneVerified: false,
      role: invite.role,
      companyName: invite.companyName,
      companyId: invite.companyId,
      deviceId: `device_${Math.random().toString(36).slice(2, 8)}`,
      isTracking: true,
    };

    setCredentials(prev => ({
      ...prev,
      [invite.email.toLowerCase()]: { password, user: newUser },
    }));

    setInvites(prev => prev.map(i => i.token === token ? { ...i, status: "accepted" as const } : i));

    // Require OTP before completing
    setPendingUser(newUser);
    setPendingAuth({ type: "invite" });
    sendOtp(phone);
    return { success: true, requiresOtp: true };
  }, [invites, sendOtp]);

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
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, invites, login, logout, setRole,
      acceptInvite, addInvite, bindDevice, sendOtp, verifyOtp,
      pendingOtp, pendingAuth, completePendingAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
