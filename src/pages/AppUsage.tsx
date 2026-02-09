import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Monitor, Calendar, User, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";

const mockUsers = ["All Users", "Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Eva Brown"];

const topApps = [
  { name: "VS Code", hours: 42.5, users: 4, category: "Development" },
  { name: "Chrome", hours: 38.2, users: 5, category: "Browser" },
  { name: "Figma", hours: 22.8, users: 2, category: "Design" },
  { name: "Slack", hours: 18.4, users: 5, category: "Communication" },
  { name: "Terminal", hours: 15.6, users: 3, category: "Development" },
  { name: "Notion", hours: 12.3, users: 3, category: "Productivity" },
  { name: "Zoom", hours: 8.7, users: 4, category: "Communication" },
  { name: "Jira", hours: 7.2, users: 2, category: "Project Mgmt" },
];

const topUrls = [
  { url: "github.com", hours: 14.2, visits: 342, category: "Development" },
  { url: "stackoverflow.com", hours: 8.5, visits: 186, category: "Development" },
  { url: "docs.google.com", hours: 6.8, visits: 94, category: "Productivity" },
  { url: "figma.com", hours: 5.4, visits: 67, category: "Design" },
  { url: "slack.com", hours: 4.9, visits: 210, category: "Communication" },
  { url: "notion.so", hours: 4.1, visits: 85, category: "Productivity" },
  { url: "youtube.com", hours: 3.2, visits: 48, category: "Entertainment" },
  { url: "reddit.com", hours: 2.1, visits: 62, category: "Social" },
];

const categoryColors: Record<string, string> = {
  Development: "bg-primary/20 text-primary",
  Browser: "bg-blue-500/20 text-blue-400",
  Design: "bg-violet-500/20 text-violet-400",
  Communication: "bg-emerald-500/20 text-emerald-400",
  Productivity: "bg-amber-500/20 text-amber-400",
  "Project Mgmt": "bg-rose-500/20 text-rose-400",
  Entertainment: "bg-red-500/20 text-red-400",
  Social: "bg-orange-500/20 text-orange-400",
};

const maxAppHours = Math.max(...topApps.map(a => a.hours));
const maxUrlHours = Math.max(...topUrls.map(u => u.hours));

const AppUsage = () => {
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [period, setPeriod] = useState("today");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Globe size={22} className="text-primary" /> App & URL Usage
          </h1>
          <p className="text-sm text-muted-foreground">Track application and website usage across your team</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockUsers.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Applications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-gradient-card border border-border"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Monitor size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground text-sm">Top Applications</h2>
            </div>
            <div className="p-4 space-y-3">
              {topApps.map((app, i) => (
                <motion.div
                  key={app.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{app.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${categoryColors[app.category] || "bg-muted text-muted-foreground"}`}>
                        {app.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{app.hours}h</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{app.users} users</span>
                    </div>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden border border-border">
                    <motion.div
                      className="h-full rounded-full bg-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${(app.hours / maxAppHours) * 100}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top Websites */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-gradient-card border border-border"
          >
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground text-sm">Top Websites</h2>
            </div>
            <div className="p-4 space-y-3">
              {topUrls.map((site, i) => (
                <motion.div
                  key={site.url}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground flex items-center gap-1">
                        {site.url} <ExternalLink size={10} className="text-muted-foreground" />
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${categoryColors[site.category] || "bg-muted text-muted-foreground"}`}>
                        {site.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-foreground">{site.hours}h</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{site.visits} visits</span>
                    </div>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden border border-border">
                    <motion.div
                      className="h-full rounded-full bg-accent/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${(site.hours / maxUrlHours) * 100}%` }}
                      transition={{ delay: i * 0.04 + 0.2, duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-gradient-card border border-border p-6"
        >
          <h2 className="font-semibold text-foreground text-sm mb-4">Time by Category</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(
              [...topApps, ...topUrls].reduce<Record<string, number>>((acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.hours;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .map(([cat, hours]) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card"
                >
                  <span className={`w-2.5 h-2.5 rounded-sm ${categoryColors[cat]?.split(" ")[0] || "bg-muted"}`} />
                  <span className="text-sm text-foreground">{cat}</span>
                  <span className="text-xs text-muted-foreground font-mono">{hours.toFixed(1)}h</span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AppUsage;
