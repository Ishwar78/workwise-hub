import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Building2, BarChart3, CreditCard, Settings, Users, Package,
  LogOut, ChevronLeft, ShieldCheck, TrendingUp, TrendingDown, DollarSign,
  Activity, Ban, CheckCircle2, AlertTriangle, Plus, Search, MoreHorizontal,
  Eye, UserX, UserCheck, ArrowUpDown, Edit2, Trash2, Mail, Globe, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

// ─── Sidebar ───
const superAdminMenu = [
  { icon: BarChart3, label: "Overview", path: "/super-admin" },
  { icon: Building2, label: "Companies", path: "/super-admin/companies" },
  { icon: Users, label: "Users", path: "/super-admin/users" },
  { icon: Package, label: "Plans", path: "/super-admin/plans" },
  { icon: CreditCard, label: "Subscriptions", path: "/super-admin/subscriptions" },
  { icon: Activity, label: "Analytics", path: "/super-admin/analytics" },
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
  { id: 1, name: "Acme Corp", plan: "Professional", users: 18, maxUsers: 25, status: "active", mrr: 99, joined: "2025-11-12", email: "admin@acme.com", country: "US" },
  { id: 2, name: "TechFlow Inc", plan: "Team", users: 42, maxUsers: 50, status: "active", mrr: 199, joined: "2025-09-05", email: "ceo@techflow.io", country: "UK" },
  { id: 3, name: "StartupXYZ", plan: "Starter", users: 8, maxUsers: 10, status: "active", mrr: 49, joined: "2026-01-20", email: "hello@startupxyz.com", country: "IN" },
  { id: 4, name: "BigCo Ltd", plan: "Enterprise", users: 156, maxUsers: 200, status: "active", mrr: 499, joined: "2025-06-14", email: "ops@bigco.com", country: "DE" },
  { id: 5, name: "FreeTest", plan: "Free Trial", users: 3, maxUsers: 5, status: "trial", mrr: 0, joined: "2026-02-01", email: "test@free.com", country: "US" },
  { id: 6, name: "OldCompany", plan: "Starter", users: 5, maxUsers: 10, status: "suspended", mrr: 0, joined: "2025-03-10", email: "old@company.com", country: "CA" },
  { id: 7, name: "DesignHub", plan: "Professional", users: 22, maxUsers: 25, status: "active", mrr: 99, joined: "2025-08-22", email: "team@designhub.co", country: "AU" },
  { id: 8, name: "DevShop", plan: "Team", users: 38, maxUsers: 50, status: "active", mrr: 199, joined: "2025-10-01", email: "hello@devshop.dev", country: "US" },
];

const allUsers = [
  { id: "u1", name: "Alice Johnson", email: "alice@acme.com", company: "Acme Corp", role: "company_admin", status: "active", lastSeen: "2 min ago" },
  { id: "u2", name: "Bob Smith", email: "bob@acme.com", company: "Acme Corp", role: "user", status: "active", lastSeen: "5 min ago" },
  { id: "u3", name: "Carol White", email: "carol@acme.com", company: "Acme Corp", role: "sub_admin", status: "active", lastSeen: "1 hr ago" },
  { id: "u4", name: "David Lee", email: "david@techflow.io", company: "TechFlow Inc", role: "company_admin", status: "active", lastSeen: "Just now" },
  { id: "u5", name: "Eva Brown", email: "eva@techflow.io", company: "TechFlow Inc", role: "user", status: "active", lastSeen: "30 min ago" },
  { id: "u6", name: "Frank Chen", email: "frank@startupxyz.com", company: "StartupXYZ", role: "company_admin", status: "active", lastSeen: "3 hr ago" },
  { id: "u7", name: "Grace Kim", email: "grace@bigco.com", company: "BigCo Ltd", role: "company_admin", status: "active", lastSeen: "10 min ago" },
  { id: "u8", name: "Henry Park", email: "henry@bigco.com", company: "BigCo Ltd", role: "user", status: "suspended", lastSeen: "2 days ago" },
  { id: "u9", name: "Ivy Chen", email: "ivy@designhub.co", company: "DesignHub", role: "company_admin", status: "active", lastSeen: "15 min ago" },
  { id: "u10", name: "Jack Wilson", email: "jack@devshop.dev", company: "DevShop", role: "user", status: "active", lastSeen: "1 min ago" },
  { id: "u11", name: "Karen Lopez", email: "karen@devshop.dev", company: "DevShop", role: "sub_admin", status: "active", lastSeen: "45 min ago" },
  { id: "u12", name: "Leo Martinez", email: "leo@free.com", company: "FreeTest", role: "company_admin", status: "active", lastSeen: "1 hr ago" },
];

const plans = [
  { id: "free_trial", name: "Free Trial", price: 0, users: 5, screenshots: "12/hr", retention: "1 Month", active: 12 },
  { id: "starter", name: "Starter", price: 49, users: 10, screenshots: "12/hr", retention: "3 Months", active: 34 },
  { id: "professional", name: "Professional", price: 99, users: 25, screenshots: "12/hr", retention: "3 Months", active: 52 },
  { id: "team", name: "Team", price: 199, users: 50, screenshots: "12/hr", retention: "6 Months", active: 24 },
  { id: "enterprise", name: "Enterprise", price: 499, users: 200, screenshots: "Custom", retention: "1 Year", active: 5 },
];

const subscriptions = [
  { company: "Acme Corp", plan: "Professional", status: "active", nextBilling: "2026-03-12", amount: 99 },
  { company: "TechFlow Inc", plan: "Team", status: "active", nextBilling: "2026-03-05", amount: 199 },
  { company: "BigCo Ltd", plan: "Enterprise", status: "active", nextBilling: "2026-03-14", amount: 499 },
  { company: "StartupXYZ", plan: "Starter", status: "active", nextBilling: "2026-03-20", amount: 49 },
  { company: "DesignHub", plan: "Professional", status: "active", nextBilling: "2026-03-22", amount: 99 },
  { company: "DevShop", plan: "Team", status: "active", nextBilling: "2026-03-01", amount: 199 },
  { company: "FreeTest", plan: "Free Trial", status: "trial", nextBilling: "2026-02-15", amount: 0 },
  { company: "OldCompany", plan: "Starter", status: "overdue", nextBilling: "2026-01-10", amount: 49 },
];

const monthlyRevenue = [
  { month: "Mar", revenue: 15400, companies: 82 },
  { month: "Apr", revenue: 18200, companies: 89 },
  { month: "May", revenue: 21700, companies: 94 },
  { month: "Jun", revenue: 24300, companies: 98 },
  { month: "Jul", revenue: 28100, companies: 103 },
  { month: "Aug", revenue: 31500, companies: 107 },
  { month: "Sep", revenue: 34800, companies: 112 },
  { month: "Oct", revenue: 37200, companies: 116 },
  { month: "Nov", revenue: 40600, companies: 120 },
  { month: "Dec", revenue: 43100, companies: 123 },
  { month: "Jan", revenue: 45800, companies: 125 },
  { month: "Feb", revenue: 48250, companies: 127 },
];

const planDistribution = [
  { name: "Free Trial", value: 12, color: "hsl(215, 20%, 55%)" },
  { name: "Starter", value: 34, color: "hsl(38, 92%, 50%)" },
  { name: "Professional", value: 52, color: "hsl(192, 91%, 54%)" },
  { name: "Team", value: 24, color: "hsl(142, 71%, 45%)" },
  { name: "Enterprise", value: 5, color: "hsl(270, 60%, 55%)" },
];

const dailySignups = [
  { day: "Mon", signups: 4 }, { day: "Tue", signups: 7 }, { day: "Wed", signups: 3 },
  { day: "Thu", signups: 6 }, { day: "Fri", signups: 8 }, { day: "Sat", signups: 2 }, { day: "Sun", signups: 1 },
];

const userGrowth = [
  { month: "Sep", users: 2100 }, { month: "Oct", users: 2480 }, { month: "Nov", users: 2900 },
  { month: "Dec", users: 3200 }, { month: "Jan", users: 3550 }, { month: "Feb", users: 3842 },
];

const tooltipStyle = {
  backgroundColor: "hsl(222, 47%, 8%)",
  border: "1px solid hsl(222, 30%, 16%)",
  borderRadius: "8px",
  color: "hsl(210, 40%, 96%)",
  fontSize: "12px",
};

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  company_admin: "Company Admin",
  sub_admin: "Sub-Admin",
  user: "User",
};

const roleBadgeVariant = (role: string) => {
  if (role === "company_admin") return "default";
  if (role === "sub_admin") return "secondary";
  return "outline";
};

// ─── Overview Tab ───
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
            {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {stat.change}
          </div>
        </motion.div>
      ))}
    </div>

    {/* Revenue Chart */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl bg-gradient-card border border-border p-5"
    >
      <h2 className="font-semibold text-foreground mb-4">Monthly Recurring Revenue</h2>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={monthlyRevenue}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(192, 91%, 54%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(192, 91%, 54%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
          <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`$${value.toLocaleString()}`, "MRR"]} />
          <Area type="monotone" dataKey="revenue" stroke="hsl(192, 91%, 54%)" fill="url(#revenueGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>

    {/* Quick Stats Row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Recent Companies */}
      <div className="rounded-xl bg-gradient-card border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Recent Companies</h3>
        <div className="space-y-2">
          {companies.slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">
                  {c.name[0]}
                </div>
                <span className="text-foreground">{c.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">{c.plan}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="rounded-xl bg-gradient-card border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Plan Distribution</h3>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={planDistribution} innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
              {planDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: "10px", color: "hsl(215, 20%, 55%)" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Health */}
      <div className="rounded-xl bg-gradient-card border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Platform Health</h3>
        <div className="space-y-3">
          {[
            { label: "API Uptime", value: "99.97%", pct: 99.97 },
            { label: "Avg Response Time", value: "142ms", pct: 86 },
            { label: "Active Agents", value: "2,841", pct: 74 },
            { label: "Storage Used", value: "1.2 TB / 5 TB", pct: 24 },
          ].map((h, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{h.label}</span>
                <span className="text-foreground">{h.value}</span>
              </div>
              <Progress value={h.pct} className="h-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Companies Tab ───
const CompaniesTab = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<typeof companies[0] | null>(null);
  const [planDialog, setPlanDialog] = useState<typeof companies[0] | null>(null);
  const [newPlan, setNewPlan] = useState("");

  const filtered = companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handlePlanAssign = () => {
    toast({ title: "Plan Updated", description: `${planDialog?.name} moved to ${newPlan}` });
    setPlanDialog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Companies</h1>
          <p className="text-sm text-muted-foreground">{companies.length} registered companies</p>
        </div>
        <Button size="sm" className="gap-1"><Plus size={14} /> Add Company</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="p-4">Company</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Users</th>
                <th className="p-4">MRR</th>
                <th className="p-4">Country</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="text-[10px]">{c.plan}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground">{c.users}/{c.maxUsers}</span>
                      <Progress value={(c.users / c.maxUsers) * 100} className="w-12 h-1.5" />
                    </div>
                  </td>
                  <td className="p-4 text-foreground font-medium">${c.mrr}</td>
                  <td className="p-4 text-muted-foreground">{c.country}</td>
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
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedCompany(c)} title="View Details">
                        <Eye size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setPlanDialog(c); setNewPlan(c.plan); }} title="Change Plan">
                        <ArrowUpDown size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Suspend">
                        <Ban size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Detail Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" /> {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>Company details and configuration</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Email", value: selectedCompany.email },
                  { label: "Plan", value: selectedCompany.plan },
                  { label: "Users", value: `${selectedCompany.users} / ${selectedCompany.maxUsers}` },
                  { label: "MRR", value: `$${selectedCompany.mrr}` },
                  { label: "Country", value: selectedCompany.country },
                  { label: "Joined", value: selectedCompany.joined },
                  { label: "Status", value: selectedCompany.status },
                ].map(item => (
                  <div key={item.label}>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <p className="text-sm font-medium text-foreground capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">User Capacity</span>
                <Progress value={(selectedCompany.users / selectedCompany.maxUsers) * 100} className="h-2 mt-1" />
                <span className="text-xs text-muted-foreground">{Math.round((selectedCompany.users / selectedCompany.maxUsers) * 100)}% used</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Plan Assignment Dialog */}
      <Dialog open={!!planDialog} onOpenChange={() => setPlanDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan — {planDialog?.name}</DialogTitle>
            <DialogDescription>Assign a new plan to this company</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Current Plan: <span className="font-medium text-foreground">{planDialog?.plan}</span></Label>
            <Select value={newPlan} onValueChange={setNewPlan}>
              <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
              <SelectContent>
                {plans.map(p => (
                  <SelectItem key={p.id} value={p.name}>{p.name} — ${p.price}/mo</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog(null)}>Cancel</Button>
            <Button onClick={handlePlanAssign}>Assign Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Global Users Tab ───
const UsersTab = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleDialog, setRoleDialog] = useState<typeof allUsers[0] | null>(null);
  const [newRole, setNewRole] = useState("");
  const [removeDialog, setRemoveDialog] = useState<typeof allUsers[0] | null>(null);

  const uniqueCompanies = [...new Set(allUsers.map(u => u.company))];

  const filtered = allUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchCompany = companyFilter === "all" || u.company === companyFilter;
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchCompany && matchRole;
  });

  const handleRoleChange = () => {
    toast({ title: "Role Updated", description: `${roleDialog?.name} is now ${roleLabels[newRole]}` });
    setRoleDialog(null);
  };

  const handleRemove = () => {
    toast({ title: "User Removed", description: `${removeDialog?.name} has been removed`, variant: "destructive" });
    setRemoveDialog(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users size={22} className="text-primary" /> Global User Management
        </h1>
        <p className="text-sm text-muted-foreground">{allUsers.length} users across all companies</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {uniqueCompanies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="company_admin">Company Admin</SelectItem>
            <SelectItem value="sub_admin">Sub-Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="p-4">User</th>
                <th className="p-4">Company</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Seen</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{u.company}</td>
                  <td className="p-4">
                    <Badge variant={roleBadgeVariant(u.role)} className="text-[10px]">
                      {roleLabels[u.role]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${u.status === "active" ? "bg-status-active" : "bg-status-offline"}`} />
                      <span className="text-xs text-muted-foreground capitalize">{u.status}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{u.lastSeen}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setRoleDialog(u); setNewRole(u.role); }} title="Change Role">
                        <Edit2 size={13} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title={u.status === "active" ? "Suspend" : "Activate"}>
                        {u.status === "active" ? <UserX size={13} /> : <UserCheck size={13} />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setRemoveDialog(u)} title="Remove">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={() => setRoleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role — {roleDialog?.name}</DialogTitle>
            <DialogDescription>Update user's role at {roleDialog?.company}</DialogDescription>
          </DialogHeader>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="company_admin">Company Admin</SelectItem>
              <SelectItem value="sub_admin">Sub-Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>Cancel</Button>
            <Button onClick={handleRoleChange}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <Dialog open={!!removeDialog} onOpenChange={() => setRemoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{removeDialog?.name}</strong> from <strong>{removeDialog?.company}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRemove}>Remove User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Plans Tab ───
const PlansTab = () => {
  const [editDialog, setEditDialog] = useState<typeof plans[0] | null>(null);
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans</h1>
          <p className="text-sm text-muted-foreground">Manage pricing plans and limits</p>
        </div>
        <Button size="sm" className="gap-1"><Plus size={14} /> Create Plan</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl bg-gradient-card border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{p.name}</h3>
              <Badge variant="secondary" className="text-[10px]">{p.active} active</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-4">
              {p.price === 0 ? "Free" : `$${p.price}`}
              {p.price > 0 && <span className="text-sm text-muted-foreground font-normal">/mo</span>}
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Max Users</span><span className="text-foreground">{p.users}</span></div>
              <div className="flex justify-between"><span>Screenshots</span><span className="text-foreground">{p.screenshots}</span></div>
              <div className="flex justify-between"><span>Data Retention</span><span className="text-foreground">{p.retention}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditDialog(p)}>
                <Edit2 size={12} className="mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                <Trash2 size={12} />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plan — {editDialog?.name}</DialogTitle>
            <DialogDescription>Modify plan limits and pricing</DialogDescription>
          </DialogHeader>
          {editDialog && (
            <div className="space-y-3">
              <div>
                <Label>Price ($/month)</Label>
                <Input type="number" defaultValue={editDialog.price} className="mt-1" />
              </div>
              <div>
                <Label>Max Users</Label>
                <Input type="number" defaultValue={editDialog.users} className="mt-1" />
              </div>
              <div>
                <Label>Screenshot Frequency</Label>
                <Input defaultValue={editDialog.screenshots} className="mt-1" />
              </div>
              <div>
                <Label>Data Retention</Label>
                <Input defaultValue={editDialog.retention} className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(null)}>Cancel</Button>
            <Button onClick={() => { toast({ title: "Plan Updated" }); setEditDialog(null); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ─── Subscriptions Tab ───
const SubscriptionsTab = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
      <p className="text-sm text-muted-foreground">Active and past subscriptions across all companies</p>
    </div>

    {/* Summary cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Active", value: subscriptions.filter(s => s.status === "active").length, color: "text-status-active" },
        { label: "Trial", value: subscriptions.filter(s => s.status === "trial").length, color: "text-status-idle" },
        { label: "Overdue", value: subscriptions.filter(s => s.status === "overdue").length, color: "text-destructive" },
        { label: "Total MRR", value: `$${subscriptions.reduce((a, s) => a + s.amount, 0)}`, color: "text-primary" },
      ].map(s => (
        <div key={s.label} className="rounded-xl bg-gradient-card border border-border p-4">
          <span className="text-xs text-muted-foreground">{s.label}</span>
          <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
        </div>
      ))}
    </div>

    <div className="rounded-xl bg-gradient-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="p-4">Company</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Next Billing</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
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
                <td className="p-4">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── Analytics Tab ───
const AnalyticsTab = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Activity size={22} className="text-primary" /> Platform Analytics
      </h1>
      <p className="text-sm text-muted-foreground">Platform-wide growth and performance metrics</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-card border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Revenue & Company Growth</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(192, 91%, 54%)" strokeWidth={2} dot={false} name="Revenue" />
            <Line yAxisId="right" type="monotone" dataKey="companies" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} name="Companies" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* User Growth */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl bg-gradient-card border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">User Growth (6 months)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={userGrowth}>
            <defs>
              <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="users" stroke="hsl(142, 71%, 45%)" fill="url(#userGrowthGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Daily Signups */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl bg-gradient-card border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Daily Signups (This Week)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailySignups}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="signups" fill="hsl(192, 91%, 54%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Plan Distribution */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-gradient-card border border-border p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">Plan Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={planDistribution} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
              {planDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "hsl(215, 20%, 55%)" }} />
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>

    {/* Key Metrics Table */}
    <div className="rounded-xl bg-gradient-card border border-border p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">Key Metrics Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Revenue / Company", value: "$380", icon: DollarSign },
          { label: "Avg Users / Company", value: "30.2", icon: Users },
          { label: "Screenshots / Day", value: "48,210", icon: Globe },
          { label: "Agent Uptime", value: "99.4%", icon: Clock },
          { label: "Trial → Paid Rate", value: "34%", icon: TrendingUp },
          { label: "Avg Session Length", value: "7.2h", icon: Clock },
          { label: "Active Agents Now", value: "2,841", icon: Activity },
          { label: "Support Tickets", value: "23 open", icon: Mail },
        ].map(m => (
          <div key={m.label} className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <m.icon size={14} className="text-primary" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">{m.label}</span>
              <p className="text-sm font-semibold text-foreground">{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Settings Tab ───
const SettingsTab = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">Global configuration for the WEBMOK platform</p>
      </div>

      <div className="rounded-xl bg-gradient-card border border-border p-5 space-y-4">
        <h3 className="font-medium text-foreground">General</h3>
        <div className="space-y-3">
          <div>
            <Label>Platform Name</Label>
            <Input defaultValue="WEBMOK" className="mt-1" />
          </div>
          <div>
            <Label>Support Email</Label>
            <Input defaultValue="support@webmok.com" className="mt-1" />
          </div>
          <div>
            <Label>Default Timezone</Label>
            <Select defaultValue="UTC">
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="PST">PST</SelectItem>
                <SelectItem value="IST">IST</SelectItem>
                <SelectItem value="CET">CET</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-card border border-border p-5 space-y-4">
        <h3 className="font-medium text-foreground">Security & Access</h3>
        <div className="space-y-3">
          {[
            { label: "Enforce 2FA for Admins", desc: "Require two-factor authentication for all company admins", default: true },
            { label: "Allow User Self-Registration", desc: "Let users sign up without an invite", default: false },
            { label: "IP Whitelisting", desc: "Restrict API access to whitelisted IPs only", default: false },
            { label: "Audit Logging", desc: "Log all admin actions for compliance", default: true },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between">
              <div>
                <Label className="text-sm">{s.label}</Label>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Switch defaultChecked={s.default} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-gradient-card border border-border p-5 space-y-4">
        <h3 className="font-medium text-foreground">Data & Storage</h3>
        <div className="space-y-3">
          <div>
            <Label>Max Screenshot Size</Label>
            <Select defaultValue="2mb">
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1mb">1 MB</SelectItem>
                <SelectItem value="2mb">2 MB</SelectItem>
                <SelectItem value="5mb">5 MB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Default Data Retention</Label>
            <Select defaultValue="90">
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button onClick={() => toast({ title: "Settings Saved", description: "Platform settings updated successfully." })}>
        Save Settings
      </Button>
    </div>
  );
};

// ─── Main Component ───
const SuperAdmin = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderContent = () => {
    if (path.includes("/companies")) return <CompaniesTab />;
    if (path.includes("/users")) return <UsersTab />;
    if (path.includes("/plans")) return <PlansTab />;
    if (path.includes("/subscriptions")) return <SubscriptionsTab />;
    if (path.includes("/analytics")) return <AnalyticsTab />;
    if (path.includes("/settings")) return <SettingsTab />;
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
