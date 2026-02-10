import { useAuth } from "@/contexts/AuthContext";
import { Permission, hasPermission, getPermissions } from "@/lib/permissions";

export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role ?? "user";

  return {
    can: (permission: Permission) => hasPermission(role, permission),
    canAll: (...perms: Permission[]) => perms.every((p) => hasPermission(role, p)),
    canAny: (...perms: Permission[]) => perms.some((p) => hasPermission(role, p)),
    permissions: getPermissions(role),
    role,
  };
};
