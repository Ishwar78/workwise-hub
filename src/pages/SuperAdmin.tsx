import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Building2, BarChart3, CreditCard, Settings, Users, Package,
  LogOut, ChevronLeft, ShieldCheck, TrendingUp, DollarSign,
  Activity, Ban, CheckCircle2, AlertTriangle, Plus, Search, MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Sidebar ───
const superAdminMenu = [
  { icon: BarChart3, label: "Overview", path: "/super-admin" },
  { icon: Building2, label: "Companies", path: "/super-admin/companies" },
  { icon: Package, label: "Plans", path: "/super-admin/plans" },
  { icon: CreditCard, label: "Subscriptions", path: "/super-admin/subscriptions" },
  { icon: Settings, label: "Settings", path: "/super-admin/settings" },
];

const SuperAdminSidebar = () => {
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
            <div>
              <span className="font-bold text-foreground text-sm block leading-tight">WEBMOK</span>
              <span className="text-[10px] text-primary">Super Admin</span>
            </div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">
          <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {superAdminMenu.map((item) => {
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

// ─── Mock Data ───
const revenueStats = [
  { label: "MRR", value: "$48,250", change: "+12%", icon: DollarSign, up: true },
  { label: "Active Companies", value: "127", change: "+8", icon: Building2, up: true },
  { label: "Total Users", value: "3,842", change: "+215", icon: Users, up: true },
  { label: "Churn Rate", value: "2.1%", change: "-0.3%", icon: Activity, up: false },
];

const companies = [
  { id: 1, name: "Acme Corp", plan: "Professional", users: 18, maxUsers: 25, status: "active", mrr: 99, joined: "2025-11-12" },
  { id: 2, name: "TechFlow Inc", plan: "Team", users: 42, maxUsers: 50, status: "active", mrr: 199, joined: "2025-09-05" },
  { id: 3, name: "StartupXYZ", plan: "Starter", users: 8, maxUsers: 10, status: "active", mrr: 49, joined: "2026-01-20" },
  { id: 4, name: "BigCo Ltd", plan: "Enterprise", users: 156, maxUsers: 200, status: "active", mrr: 499, joined: "2025-06-14" },
  { id: 5, name: "FreeTest", plan: "Free Trial", users: 3, maxUsers: 5, status: "trial", mrr: 0, joined: "2026-02-01" },
  { id: 6, name: "OldCompany", plan: "Starter", users: 5, maxUsers: 10, status: "suspended", mrr: 0, joined: "2025-03-10" },
];

const plans = [
  { name: "Free Trial", price: 0, users: 5, screenshots: "12/hr", storage: "1 Month", active: 12 },
  { name: "Starter", price: 49, users: 10, screenshots: "12/hr", storage: "3 Months", active: 34 },
  { name: "Professional", price: 99, users: 25, screenshots: "12/hr", storage: "3 Months", active: 52 },
  { name: "Team", price: 199, users: 50, screenshots: "12/hr", storage: "3 Months", active: 24 },
  { name: "Enterprise", price: 499, users: "100+", screenshots: "Custom", storage: "Custom", active: 5 },
];

const subscriptions = [
  { company: "Acme Corp", plan: "Professional", status: "active", nextBilling: "2026-03-12", amount: 99 },
  { company: "TechFlow Inc", plan: "Team", status: "active", nextBilling: "2026-03-05", amount: 199 },
  { company: "BigCo Ltd", plan: "Enterprise", status: "active", nextBilling: "2026-03-14", amount: 499 },
  { company: "StartupXYZ", plan: "Starter", status: "active", nextBilling: "2026-03-20", amount: 49 },
  { company: "FreeTest", plan: "Free Trial", status: "trial", nextBilling: "2026-02-15", amount: 0 },
  { company: "OldCompany", plan: "Starter", status: "overdue", nextBilling: "2026-01-10", amount: 49 },
];

// ─── Sub-pages ───
const OverviewTab = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <ShieldCheck size={22} className="text-primary" /> Super Admin Dashboard
      </h1>
      <p className="text-sm text-muted-foreground">Platform-wide overview and revenue</p>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {revenueStats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl bg-gradient-card border border-border p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <stat.icon size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          <div className={`text-xs flex items-center gap-1 mt-1 ${stat.up ? "text-status-active" : "text-status-idle"}`}>
            <TrendingUp size={12} /> {stat.change}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Revenue chart placeholder */}
    <div className="rounded-xl bg-gradient-card border border-border p-6">
      <h2 className="font-semibold text-foreground mb-4">Monthly Revenue</h2>
      <div className="h-48 flex items-end gap-2">
        {[32, 45, 38, 52, 61, 58, 72, 68, 85, 79, 92, 100].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-primary/20 hover:bg-primary/40 transition-colors relative group"
              style={{ height: `${h * 1.8}px` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${Math.round(h * 482)}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">
              {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CompaniesTab = () => {
  const [search, setSearch] = useState("");
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground">{companies.length} registered companies</p>
        </div>
        <Button size="sm" className="gap-1"><Plus size={14} /> Add Company</Button>
      </div>
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search companies..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-4">Company</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Users</th>
              <th className="p-4">MRR</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-medium text-foreground">{c.name}</td>
                <td className="p-4 text-muted-foreground">{c.plan}</td>
                <td className="p-4 text-muted-foreground">{c.users}/{c.maxUsers}</td>
                <td className="p-4 text-foreground">${c.mrr}</td>
                <td className="p-4">
                  <Badge variant={c.status === "active" ? "default" : c.status === "trial" ? "secondary" : "destructive"} className="text-[10px]">
                    {c.status === "active" && <CheckCircle2 size={10} className="mr-1" />}
                    {c.status === "suspended" && <Ban size={10} className="mr-1" />}
                    {c.status === "trial" && <AlertTriangle size={10} className="mr-1" />}
                    {c.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground text-xs">{c.joined}</td>
                <td className="p-4">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlansTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plans</h1>
        <p className="text-sm text-muted-foreground">Manage pricing plans</p>
      </div>
      <Button size="sm" className="gap-1"><Plus size={14} /> Create Plan</Button>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map(p => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-card border border-border p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{p.name}</h3>
            <Badge variant="secondary" className="text-[10px]">{p.active} active</Badge>
          </div>
          <div className="text-3xl font-bold text-foreground mb-3">
            {p.price === 0 ? "Free" : `$${p.price}`}
            {p.price > 0 && <span className="text-sm text-muted-foreground font-normal">/mo</span>}
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Max Users</span><span className="text-foreground">{p.users}</span></div>
            <div className="flex justify-between"><span>Screenshots</span><span className="text-foreground">{p.screenshots}</span></div>
            <div className="flex justify-between"><span>Storage</span><span className="text-foreground">{p.storage}</span></div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Edit Plan</Button>
        </motion.div>
      ))}
    </div>
  </div>
);

const SubscriptionsTab = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
      <p className="text-sm text-muted-foreground">Active and past subscriptions</p>
    </div>
    <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="p-4">Company</th>
            <th className="p-4">Plan</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Next Billing</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {subscriptions.map(s => (
            <tr key={s.company} className="hover:bg-secondary/20 transition-colors">
              <td className="p-4 font-medium text-foreground">{s.company}</td>
              <td className="p-4 text-muted-foreground">{s.plan}</td>
              <td className="p-4 text-foreground">{s.amount === 0 ? "Free" : `$${s.amount}/mo`}</td>
              <td className="p-4 text-muted-foreground text-xs">{s.nextBilling}</td>
              <td className="p-4">
                <Badge variant={s.status === "active" ? "default" : s.status === "trial" ? "secondary" : "destructive"} className="text-[10px] capitalize">
                  {s.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main Component ───
const SuperAdmin = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderContent = () => {
    if (path.includes("/companies")) return <CompaniesTab />;
    if (path.includes("/plans")) return <PlansTab />;
    if (path.includes("/subscriptions")) return <SubscriptionsTab />;
    return <OverviewTab />;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SuperAdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default SuperAdmin;
