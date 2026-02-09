import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Calendar, User, ZoomIn, ZoomOut, EyeOff, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";

const mockUsers = ["All Users", "Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Eva Brown"];
const mockDates = ["2026-02-09", "2026-02-08", "2026-02-07", "2026-02-06"];

const timeSlots = [
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30",
];

const mockScreenshots = timeSlots.map((time, i) => ({
  id: i,
  time,
  user: mockUsers[1 + (i % 5)],
  app: ["VS Code", "Chrome", "Slack", "Figma", "Terminal"][i % 5],
  title: ["main.tsx - WEBMOK", "Dashboard - Google", "team-chat", "UI Design", "npm run dev"][i % 5],
}));

const colors = [
  "from-blue-900/40 to-cyan-900/30",
  "from-emerald-900/40 to-teal-900/30",
  "from-violet-900/40 to-indigo-900/30",
  "from-amber-900/40 to-orange-900/30",
  "from-rose-900/40 to-pink-900/30",
];

const Screenshots = () => {
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedDate, setSelectedDate] = useState(mockDates[0]);
  const [zoom, setZoom] = useState(1);
  const [blurred, setBlurred] = useState(false);
  const [selectedShot, setSelectedShot] = useState<number | null>(null);

  const filtered = mockScreenshots.filter(
    (s) => selectedUser === "All Users" || s.user === selectedUser
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Camera size={22} className="text-primary" /> Screenshots
          </h1>
          <p className="text-sm text-muted-foreground">Timeline view of captured screenshots</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-gradient-card border border-border">
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockUsers.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockDates.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 mr-4">
              <Switch id="blur" checked={blurred} onCheckedChange={setBlurred} />
              <Label htmlFor="blur" className="text-sm text-muted-foreground flex items-center gap-1">
                {blurred ? <EyeOff size={14} /> : <Eye size={14} />} Blur
              </Label>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
              <ZoomOut size={14} />
            </Button>
            <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
              <ZoomIn size={14} />
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {filtered.map((shot, i) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex gap-4 items-start pl-2"
              >
                {/* Time dot */}
                <div className="flex flex-col items-center shrink-0 w-10">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
                  <span className="text-[10px] text-muted-foreground mt-1 font-mono">{shot.time}</span>
                </div>

                {/* Screenshot card */}
                <div
                  className="flex-1 cursor-pointer group"
                  onClick={() => setSelectedShot(selectedShot === shot.id ? null : shot.id)}
                >
                  <div className={`rounded-xl border border-border overflow-hidden transition-all duration-200 ${
                    selectedShot === shot.id ? "ring-2 ring-primary shadow-glow" : "hover:border-primary/30"
                  }`}>
                    {/* Mock screenshot placeholder */}
                    <div
                      className={`bg-gradient-to-br ${colors[i % 5]} aspect-video relative`}
                      style={{ transform: `scale(${zoom > 1 ? 1 : 1})`, maxHeight: `${160 * zoom}px` }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center transition-all ${blurred ? "blur-lg" : ""}`}>
                        <div className="text-center">
                          <div className="text-xs font-mono text-foreground/60 mb-1">{shot.app}</div>
                          <div className="text-[10px] text-muted-foreground">{shot.title}</div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full glass text-[10px] text-muted-foreground">
                        {shot.time}
                      </div>
                    </div>

                    {/* Info bar */}
                    <div className="p-3 bg-card flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{shot.user}</div>
                        <div className="text-xs text-muted-foreground">{shot.app} — {shot.title}</div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{selectedDate} {shot.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Camera size={40} className="mx-auto mb-3 opacity-30" />
            <p>No screenshots found for this filter.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Screenshots;
