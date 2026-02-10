import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/** Requires authenticated super_admin — redirects others to /super/admin/login */
export const SuperAdminAuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/super/admin/login" replace />;
  }

  if (user.role !== "super_admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

/** Requires authenticated company user (company_admin/sub_admin/user) — redirects others to /admin/login */
export const CompanyAdminAuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }

  if (user.companyId === null) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
