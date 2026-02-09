import { motion } from "framer-motion";
import { Users, Clock, Camera, Activity, TrendingUp, TrendingDown, Monitor } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 } as const,
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const statCards = [
  { label: "Active Now", value: "18", change: "+3", up: true, icon: Activity, color: "text-status-active" },
  { label: "Idle", value: "4", change: "-1", up: false, icon: Monitor, color: "text-status-idle" },
  { label: "Hours Today", value: "142.5h", change: "+12%", up: true, icon: Clock, color: "text-primary" },
  { label: "Screenshots", value: "1,284", change: "+8%", up: true, icon: Camera, color: "text-primary" },
];

const teamMembers = [
  { name: "Alice Johnson", role: "Developer", status: "active", hours: "7h 42m", apps: "VS Code, Chrome" },
  { name: "Bob Smith", role: "Designer", status: "active", hours: "6h 18m", apps: "Figma, Slack" },
  { name: "Carol White", role: "PM", status: "idle", hours: "5h 55m", apps: "Notion, Zoom" },
  { name: "David Lee", role: "Developer", status: "active", hours: "7h 12m", apps: "Terminal, Chrome" },
  { name: "Eva Brown", role: "QA", status: "offline", hours: "4h 30m", apps: "Jira, Chrome" },
  { name: "Frank Chen", role: "Developer", status: "active", hours: "6h 45m", apps: "VS Code, Slack" },
];

const statusColors: Record<string, string> = {
  active: "bg-status-active",
  idle: "bg-status-idle",
  offline: "bg-status-offline",
};

const Dashboard = () => {
  return (
    <DashboardLayout>
      <motion.div initial="hidden" animate="visible">
        <motion.div variants={fadeUp} custom={0} className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time team activity overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i + 1}
              className="rounded-xl bg-gradient-card border border-border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className={`text-xs flex items-center gap-1 mt-1 ${stat.up ? "text-status-active" : "text-status-idle"}`}>
                {stat.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Team */}
        <motion.div variants={fadeUp} custom={5} className="rounded-xl bg-gradient-card border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Users size={18} className="text-primary" /> Live Team Activity
            </h2>
            <span className="text-xs text-muted-foreground">{teamMembers.filter(m => m.status === "active").length} active</span>
          </div>
          <div className="divide-y divide-border">
            {teamMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${statusColors[member.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-foreground">{member.hours}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px]">{member.apps}</div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                  member.status === "active" ? "bg-status-active/10 text-status-active" :
                  member.status === "idle" ? "bg-status-idle/10 text-status-idle" :
                  "bg-status-offline/10 text-status-offline"
                }`}>
                  {member.status}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
