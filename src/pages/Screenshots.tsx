import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Camera, Calendar, User, ZoomIn, ZoomOut, EyeOff, Eye, Download, Trash2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard } from "@/components/RoleGuard";

const mockUsers = ["All Users", "Alice Johnson", "Bob Smith", "Carol White", "David Lee", "Eva Brown"];

const RETENTION_DAYS = 90; // 3 months

const timeSlots = [
  "09:00", "09:15", "09:30", "09:45",
  "10:00", "10:15", "10:30", "10:45",
  "11:00", "11:15", "11:30", "11:45",
  "12:00", "12:15", "12:30",
];

// Generate screenshots with created_at dates spanning several months
const generateScreenshots = () => {
  const now = new Date("2026-02-10");
  const dates = [
    "2026-02-09", "2026-02-08", "2026-02-07", "2026-02-06",
    "2026-01-15", "2026-01-10",
    "2025-12-20", "2025-12-01",
    "2025-11-15", "2025-11-01", // Older than 3 months → expired
    "2025-10-20", "2025-10-05", // Older than 3 months → expired
  ];

  let id = 0;
  const shots: Array<{
    id: number;
    time: string;
    date: string;
    createdAt: Date;
    user: string;
    app: string;
    title: string;
    isExpired: boolean;
    daysUntilExpiry: number;
  }> = [];

  for (const date of dates) {
    const slotsForDay = timeSlots.slice(0, 3 + Math.floor(Math.random() * 5));
    for (const time of slotsForDay) {
      const createdAt = new Date(`${date}T${time}:00`);
      const ageMs = now.getTime() - createdAt.getTime();
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
      const daysUntilExpiry = RETENTION_DAYS - ageDays;
      shots.push({
        id: id++,
        time,
        date,
        createdAt,
        user: mockUsers[1 + (id % 5)],
        app: ["VS Code", "Chrome", "Slack", "Figma", "Terminal"][id % 5],
        title: ["main.tsx - WEBMOK", "Dashboard - Google", "team-chat", "UI Design", "npm run dev"][id % 5],
        isExpired: daysUntilExpiry <= 0,
        daysUntilExpiry,
      });
      id++;
    }
  }
  return shots;
};

const allScreenshots = generateScreenshots();

const colors = [
  "from-blue-900/40 to-cyan-900/30",
  "from-emerald-900/40 to-teal-900/30",
  "from-violet-900/40 to-indigo-900/30",
  "from-amber-900/40 to-orange-900/30",
  "from-rose-900/40 to-pink-900/30",
];

const uniqueDates = [...new Set(allScreenshots.map(s => s.date))];

const Screenshots = () => {
  const [selectedUser, setSelectedUser] = useState("All Users");
  const [selectedDate, setSelectedDate] = useState(uniqueDates[0]);
  const [zoom, setZoom] = useState(1);
  const [blurred, setBlurred] = useState(false);
  const [selectedShot, setSelectedShot] = useState<number | null>(null);
  const [showExpired, setShowExpired] = useState(false);

  // Filter active (non-expired) screenshots unless showExpired is toggled
  const filtered = useMemo(() => {
    return allScreenshots.filter(s => {
      if (!showExpired && s.isExpired) return false;
      if (selectedDate !== "all" && s.date !== selectedDate) return false;
      if (selectedUser !== "All Users" && s.user !== selectedUser) return false;
      return true;
    });
  }, [selectedUser, selectedDate, showExpired]);

  const expiredCount = allScreenshots.filter(s => s.isExpired).length;
  const activeCount = allScreenshots.filter(s => !s.isExpired).length;

  const handleDownload = (shot: typeof allScreenshots[0]) => {
    toast({ title: "Download Started", description: `Downloading screenshot from ${shot.date} ${shot.time} — ${shot.user}` });
  };

  const handleBulkDownload = () => {
    toast({ title: "Bulk Download", description: `Downloading ${filtered.length} screenshots as ZIP...` });
  };

  const handlePurgeExpired = () => {
    toast({
      title: "Auto-Delete Complete",
      description: `${expiredCount} screenshots older than 3 months have been permanently deleted.`,
      variant: "destructive",
    });
  };

  return (
    <DashboardLayout>
      <PageGuard permission="view_screenshots">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Camera size={22} className="text-primary" /> Screenshots
            </h1>
            <p className="text-sm text-muted-foreground">Timeline view with 3-month retention policy</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleBulkDownload}>
              <Download size={14} /> Download All
            </Button>
            {expiredCount > 0 && (
              <Button variant="destructive" size="sm" className="gap-1.5" onClick={handlePurgeExpired}>
                <Trash2 size={14} /> Purge {expiredCount} Expired
              </Button>
            )}
          </div>
        </div>

        {/* Retention Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-gradient-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Camera size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Active Screenshots</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
            <p className="text-[10px] text-muted-foreground">Within retention period</p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-amber-500" />
              <span className="text-xs text-muted-foreground">Retention Period</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{RETENTION_DAYS} Days</p>
            <p className="text-[10px] text-muted-foreground">3 months auto-delete policy</p>
          </div>
          <div className="rounded-xl border border-border bg-gradient-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trash2 size={14} className="text-destructive" />
              <span className="text-xs text-muted-foreground">Expired / Pending Delete</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{expiredCount}</p>
            <p className="text-[10px] text-muted-foreground">Older than 3 months</p>
          </div>
        </div>

        {/* Filters Bar */}
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
                <SelectItem value="all">All Dates</SelectItem>
                {uniqueDates.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="expired" checked={showExpired} onCheckedChange={setShowExpired} />
            <Label htmlFor="expired" className="text-sm text-muted-foreground">Show Expired</Label>
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
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-3">
            {filtered.map((shot, i) => (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex gap-4 items-start pl-2"
              >
                <div className="flex flex-col items-center shrink-0 w-10">
                  <div className={`w-3 h-3 rounded-full border-2 border-background z-10 ${shot.isExpired ? "bg-destructive" : "bg-primary"}`} />
                  <span className="text-[10px] text-muted-foreground mt-1 font-mono">{shot.time}</span>
                </div>

                <div className="flex-1 cursor-pointer group" onClick={() => setSelectedShot(selectedShot === shot.id ? null : shot.id)}>
                  <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                    shot.isExpired ? "border-destructive/30 opacity-60" : "border-border"
                  } ${selectedShot === shot.id ? "ring-2 ring-primary shadow-glow" : "hover:border-primary/30"}`}>
                    <div
                      className={`bg-gradient-to-br ${colors[i % 5]} aspect-video relative`}
                      style={{ maxHeight: `${160 * zoom}px` }}
                    >
                      <div className={`absolute inset-0 flex items-center justify-center transition-all ${blurred ? "blur-lg" : ""}`}>
                        <div className="text-center">
                          <div className="text-xs font-mono text-foreground/60 mb-1">{shot.app}</div>
                          <div className="text-[10px] text-muted-foreground">{shot.title}</div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        {shot.isExpired && (
                          <Badge variant="destructive" className="text-[9px] px-1.5 py-0">EXPIRED</Badge>
                        )}
                        {!shot.isExpired && shot.daysUntilExpiry <= 14 && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/50 text-amber-400">
                            {shot.daysUntilExpiry}d left
                          </Badge>
                        )}
                        <span className="px-2 py-0.5 rounded-full glass text-[10px] text-muted-foreground">{shot.time}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-card flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{shot.user}</div>
                        <div className="text-xs text-muted-foreground">{shot.app} — {shot.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{shot.date} {shot.time}</span>
                        {!shot.isExpired && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); handleDownload(shot); }}
                          >
                            <Download size={12} />
                          </Button>
                        )}
                      </div>
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
      </PageGuard>
    </DashboardLayout>
  );
};

export default Screenshots;
