import { useAuth } from "@/contexts/AuthContext";
import { Permission, hasPermission, getPermissions } from "@/lib/permissions";

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    can: (permission: Permission) => hasPermission(user.role, permission),
    canAll: (...perms: Permission[]) => perms.every((p) => hasPermission(user.role, p)),
    canAny: (...perms: Permission[]) => perms.some((p) => hasPermission(user.role, p)),
    permissions: getPermissions(user.role),
    role: user.role,
  };
};
