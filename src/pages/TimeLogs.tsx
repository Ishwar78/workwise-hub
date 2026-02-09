import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, User, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";

const mockUsers = ["All Users", "Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Eva Brown"];
const mockDates = ["2026-02-09", "2026-02-08", "2026-02-07"];

interface TimeBlock {
  start: string;
  end: string;
  type: "active" | "idle" | "offline";
  app?: string;
}

const userTimelines: Record<string, TimeBlock[]> = {
  "Alice Johnson": [
    { start: "09:00", end: "10:30", type: "active", app: "VS Code" },
    { start: "10:30", end: "10:45", type: "idle" },
    { start: "10:45", end: "12:15", type: "active", app: "Chrome" },
    { start: "12:15", end: "13:00", type: "offline" },
    { start: "13:00", end: "15:30", type: "active", app: "VS Code" },
    { start: "15:30", end: "15:40", type: "idle" },
    { start: "15:40", end: "17:30", type: "active", app: "Terminal" },
  ],
  "Bob Smith": [
    { start: "09:30", end: "11:00", type: "active", app: "Figma" },
    { start: "11:00", end: "11:20", type: "idle" },
    { start: "11:20", end: "12:30", type: "active", app: "Slack" },
    { start: "12:30", end: "13:30", type: "offline" },
    { start: "13:30", end: "16:00", type: "active", app: "Figma" },
    { start: "16:00", end: "17:00", type: "active", app: "Chrome" },
  ],
  "Carol White": [
    { start: "08:30", end: "10:00", type: "active", app: "Notion" },
    { start: "10:00", end: "10:30", type: "active", app: "Zoom" },
    { start: "10:30", end: "10:50", type: "idle" },
    { start: "10:50", end: "12:00", type: "active", app: "Notion" },
    { start: "12:00", end: "13:00", type: "offline" },
    { start: "13:00", end: "16:30", type: "active", app: "Slack" },
  ],
  "David Lee": [
    { start: "09:00", end: "12:00", type: "active", app: "Terminal" },
    { start: "12:00", end: "12:45", type: "offline" },
    { start: "12:45", end: "17:00", type: "active", app: "VS Code" },
    { start: "17:00", end: "17:15", type: "idle" },
  ],
  "Eva Brown": [
    { start: "10:00", end: "11:30", type: "active", app: "Jira" },
    { start: "11:30", end: "12:00", type: "idle" },
    { start: "12:00", end: "13:00", type: "offline" },
    { start: "13:00", end: "15:00", type: "active", app: "Chrome" },
    { start: "15:00", end: "16:30", type: "active", app: "Jira" },
  ],
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const calcHours = (blocks: TimeBlock[], type?: "active" | "idle" | "offline") => {
  const filtered = type ? blocks.filter(b => b.type === type) : blocks;
  const mins = filtered.reduce((sum, b) => sum + timeToMinutes(b.end) - timeToMinutes(b.start), 0);
  return (mins / 60).toFixed(1);
};

const typeColors: Record<string, string> = {
  active: "bg-status-active",
  idle: "bg-status-idle",
  offline: "bg-muted",
};

const hours = Array.from({ length: 11 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

const TimeLogs = () => {
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedDate, setSelectedDate] = useState(mockDates[0]);

  const usersToShow = selectedUser === "All Users"
    ? Object.keys(userTimelines)
    : [selectedUser];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock size={22} className="text-primary" /> Time Logs
          </h1>
          <p className="text-sm text-muted-foreground">Daily timeline with active/idle breakdown</p>
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
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {mockDates.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-status-active" /> Active</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-status-idle" /> Idle</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-muted" /> Offline</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Active", value: usersToShow.reduce((s, u) => s + parseFloat(calcHours(userTimelines[u], "active")), 0).toFixed(1) + "h", color: "text-status-active" },
            { label: "Total Idle", value: usersToShow.reduce((s, u) => s + parseFloat(calcHours(userTimelines[u], "idle")), 0).toFixed(1) + "h", color: "text-status-idle" },
            { label: "Total Hours", value: usersToShow.reduce((s, u) => s + parseFloat(calcHours(userTimelines[u])), 0).toFixed(1) + "h", color: "text-primary" },
          ].map(c => (
            <div key={c.label} className="rounded-xl bg-gradient-card border border-border p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Timelines */}
        <div className="space-y-3">
          {/* Hour labels */}
          <div className="flex items-center gap-0 pl-36">
            {hours.map(h => (
              <div key={h} className="flex-1 text-[10px] text-muted-foreground">{h}</div>
            ))}
          </div>

          {usersToShow.map((userName, idx) => {
            const blocks = userTimelines[userName];
            const dayStart = timeToMinutes("08:00");
            const dayEnd = timeToMinutes("18:00");
            const totalRange = dayEnd - dayStart;

            return (
              <motion.div
                key={userName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 group"
              >
                {/* User info */}
                <div className="w-32 shrink-0">
                  <div className="text-sm font-medium text-foreground truncate">{userName}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {calcHours(blocks, "active")}h active · {calcHours(blocks, "idle")}h idle
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 h-10 bg-card rounded-lg border border-border relative overflow-hidden">
                  {blocks.map((block, bi) => {
                    const left = ((timeToMinutes(block.start) - dayStart) / totalRange) * 100;
                    const width = ((timeToMinutes(block.end) - timeToMinutes(block.start)) / totalRange) * 100;
                    return (
                      <div
                        key={bi}
                        className={`absolute top-1 bottom-1 rounded-md ${typeColors[block.type]} transition-opacity group-hover:opacity-90`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${block.start}-${block.end} ${block.type}${block.app ? ` (${block.app})` : ""}`}
                      >
                        {width > 8 && block.app && (
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-background/80 truncate px-1">
                            {block.app}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="w-14 text-right shrink-0">
                  <span className="text-sm font-semibold text-foreground">{calcHours(blocks)}h</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeLogs;
