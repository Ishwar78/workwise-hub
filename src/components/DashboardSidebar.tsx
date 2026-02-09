import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Clock, Camera, Globe, BarChart3,
  Settings, CreditCard, LogOut, ChevronLeft, UserPlus, Building2,
  Activity, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Team", path: "/dashboard/team" },
  { icon: Clock, label: "Time Logs", path: "/dashboard/time" },
  { icon: Camera, label: "Screenshots", path: "/dashboard/screenshots" },
  { icon: Globe, label: "App & URL Usage", path: "/dashboard/usage" },
  { icon: Activity, label: "Activity Feed", path: "/dashboard/activity" },
  { icon: BarChart3, label: "Reports", path: "/dashboard/reports" },
  { icon: UserPlus, label: "Invite Members", path: "/dashboard/invite" },
  { icon: FileText, label: "API Spec", path: "/dashboard/api-spec" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      "h-screen sticky top-0 border-r border-border bg-sidebar flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs">W</div>
            <span className="font-bold text-foreground text-sm">WEBMOK</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Acme Corp</span>
          </div>
          <span className="text-[10px] text-primary">Professional Plan</span>
        </div>
      )}

      <nav className="flex-1 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon size={18} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary">
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
