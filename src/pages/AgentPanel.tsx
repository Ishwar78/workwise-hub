import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, LogOut, Camera, Monitor, Globe, MousePointer, Clock, Coffee, AlertTriangle, CheckCircle2, XCircle, Timer, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type AgentStatus = "idle" | "active" | "paused" | "logged_out";

interface SessionLog {
  type: "start" | "pause" | "resume" | "idle" | "logout" | "screenshot";
  time: Date;
  detail?: string;
}

interface SessionSummary {
  totalActive: number;
  totalPaused: number;
  totalIdle: number;
  screenshotCount: number;
  startTime: Date | null;
  endTime: Date | null;
}

const STATUS_CONFIG: Record<AgentStatus, { color: string; bg: string; label: string; dot: string }> = {
  active: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", label: "Active — Tracking", dot: "bg-green-500" },
  paused: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", label: "Paused", dot: "bg-yellow-500" },
  idle: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", label: "Idle — No Activity", dot: "bg-red-500" },
  logged_out: { color: "text-muted-foreground", bg: "bg-muted/50 border-border", label: "Logged Out", dot: "bg-muted-foreground" },
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const AgentPanel = () => {
  const [status, setStatus] = useState<AgentStatus>("logged_out");
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [screenshotCount, setScreenshotCount] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [showIdleDialog, setShowIdleDialog] = useState(false);
  const [idleReason, setIdleReason] = useState("");
  const [showStartReminder, setShowStartReminder] = useState(false);
  const [loginTime, setLoginTime] = useState<Date | null>(null);
  const [forceLogoutTriggered, setForceLogoutTriggered] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenshotTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  const addLog = useCallback((log: Omit<SessionLog, "time">) => {
    setSessionLogs((prev) => [{ ...log, time: new Date() }, ...prev]);
  }, []);

  // Simulate idle detection — resets on mouse/key
  const resetIdleTimer = useCallback(() => {
    lastActivityRef.current = new Date();
    if (status === "idle") {
      setStatus("active");
      addLog({ type: "resume", detail: "Activity resumed" });
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (status === "active" || status === "idle") {
      idleTimerRef.current = setTimeout(() => {
        setStatus("idle");
        addLog({ type: "idle", detail: "No input detected" });
        setShowIdleDialog(true);
      }, 60000); // 1 min for demo (configurable)
    }
  }, [status, addLog]);

  useEffect(() => {
    if (status === "active") {
      window.addEventListener("mousemove", resetIdleTimer);
      window.addEventListener("keydown", resetIdleTimer);
      resetIdleTimer();
    }
    return () => {
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [status, resetIdleTimer]);

  // Main timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (status === "active") {
      timerRef.current = setInterval(() => setActiveSeconds((s) => s + 1), 1000);
    } else if (status === "paused") {
      timerRef.current = setInterval(() => setPausedSeconds((s) => s + 1), 1000);
    } else if (status === "idle") {
      timerRef.current = setInterval(() => setIdleSeconds((s) => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // Screenshot scheduler — 12/hr = every 5 min, randomized ±90s
  useEffect(() => {
    if (screenshotTimerRef.current) clearInterval(screenshotTimerRef.current);
    if (status === "active") {
      const scheduleNext = () => {
        const base = 300; // 5 min
        const jitter = Math.floor(Math.random() * 180) - 90; // ±90s
        return Math.max(10, base + jitter) * 1000; // min 10s
      };
      const capture = () => {
        setScreenshotCount((c) => c + 1);
        addLog({ type: "screenshot", detail: "Screenshot captured" });
        // For demo speed, use shorter interval
        screenshotTimerRef.current = setTimeout(capture, Math.min(scheduleNext(), 15000));
      };
      screenshotTimerRef.current = setTimeout(capture, 5000); // first after 5s demo
    }
    return () => { if (screenshotTimerRef.current) clearTimeout(screenshotTimerRef.current); };
  }, [status, addLog]);

  // Login state — auto reminder if Start not clicked
  const handleLogin = () => {
    const now = new Date();
    setLoginTime(now);
    setStatus("logged_out"); // logged in but not started
    setSessionLogs([]);
    setActiveSeconds(0);
    setPausedSeconds(0);
    setIdleSeconds(0);
    setScreenshotCount(0);
    setWorkStartTime(null);
    setSummary(null);
    setShowSummary(false);
    toast.success("Logged in successfully");

    // Remind if Start not clicked in 2 min (demo: 30s)
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    reminderTimerRef.current = setTimeout(() => {
      if (!workStartTime) setShowStartReminder(true);
    }, 30000);
  };

  const handleStart = () => {
    const now = new Date();
    setStatus("active");
    setWorkStartTime(now);
    setShowStartReminder(false);
    if (reminderTimerRef.current) clearTimeout(reminderTimerRef.current);
    addLog({ type: "start", detail: "Work session started" });
    toast.success("Work started — all tracking modules enabled");
  };

  const handlePause = () => {
    setStatus("paused");
    addLog({ type: "pause", detail: "Work paused" });
    toast("Work paused — tracking stopped", { icon: "⏸️" });
  };

  const handleResume = () => {
    setStatus("active");
    addLog({ type: "resume", detail: "Work resumed" });
    toast.success("Work resumed — tracking re-enabled");
  };

  const handleLogout = () => {
    const now = new Date();
    const sessionSummary: SessionSummary = {
      totalActive: activeSeconds,
      totalPaused: pausedSeconds,
      totalIdle: idleSeconds,
      screenshotCount,
      startTime: workStartTime,
      endTime: now,
    };
    setSummary(sessionSummary);
    setStatus("logged_out");
    setWorkStartTime(null);
    setLoginTime(null);
    addLog({ type: "logout", detail: "Session ended" });
    setShowSummary(true);
    toast("Logged out — session ended", { icon: "⏹️" });
  };

  // Simulate admin force logout — in real app this comes via WebSocket/push
  const handleForceLogout = () => {
    setForceLogoutTriggered(true);
    addLog({ type: "logout", detail: "⚠️ Force logout by admin" });
    toast.error("Your session was ended remotely by an administrator.");
    setTimeout(() => {
      handleLogout();
      setForceLogoutTriggered(false);
    }, 1500);
  };

  const handleIdleSubmit = () => {
    addLog({ type: "idle", detail: `Idle reason: ${idleReason || "No reason given"}` });
    setIdleReason("");
    setShowIdleDialog(false);
    setStatus("active");
    toast.success("Idle reason submitted");
  };

  const isLoggedIn = loginTime !== null || status !== "logged_out";
  const isWorking = status === "active" || status === "paused" || status === "idle";
  const statusCfg = STATUS_CONFIG[status];

  const totalSeconds = activeSeconds + pausedSeconds + idleSeconds;
  const activePercent = totalSeconds > 0 ? (activeSeconds / totalSeconds) * 100 : 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Agent Window */}
        <Card className="border-border/60 shadow-2xl overflow-hidden">
          {/* Title Bar */}
          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">TeamTreck Agent</span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">v2.1.0</Badge>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
          </div>

          <CardContent className="p-5 space-y-5">
            {/* Status Indicator */}
            <div className={`flex items-center gap-3 rounded-lg border p-3 ${statusCfg.bg}`}>
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${statusCfg.dot}`} />
                {status === "active" && (
                  <div className={`absolute inset-0 w-3 h-3 rounded-full ${statusCfg.dot} animate-ping`} />
                )}
              </div>
              <span className={`text-sm font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
            </div>

            {/* Timer Display */}
            {isWorking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Active Time</p>
                <p className="text-3xl font-mono font-bold text-foreground tracking-wider">
                  {formatDuration(activeSeconds)}
                </p>
                {totalSeconds > 0 && (
                  <div className="mt-2 space-y-1">
                    <Progress value={activePercent} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">
                      {activePercent.toFixed(0)}% productive
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Control Buttons */}
            <div className="space-y-2">
              {!isLoggedIn && (
                <Button onClick={handleLogin} className="w-full gap-2" size="lg">
                  <Monitor className="h-4 w-4" /> Login to Agent
                </Button>
              )}

              {isLoggedIn && !isWorking && status === "logged_out" && (
                <Button onClick={handleStart} className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white" size="lg">
                  <Play className="h-4 w-4" /> Start Work
                </Button>
              )}

              {status === "active" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handlePause} variant="outline" className="gap-2 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10">
                    <Pause className="h-4 w-4" /> Pause
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </div>
              )}

              {status === "paused" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleResume} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Play className="h-4 w-4" /> Resume
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </div>
              )}

              {status === "idle" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setShowIdleDialog(true)} variant="outline" className="gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10">
                    <AlertTriangle className="h-4 w-4" /> Justify
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </div>
              )}
            </div>

            {/* Tracking Modules Status */}
            {isWorking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Separator className="mb-3" />
                <p className="text-xs text-muted-foreground mb-2 font-medium">Tracking Modules</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Clock, label: "Time Tracking", active: status === "active" },
                    { icon: Camera, label: "Screenshots", active: status === "active" },
                    { icon: Monitor, label: "App Tracking", active: status === "active" },
                    { icon: Globe, label: "URL Tracking", active: status === "active" },
                    { icon: MousePointer, label: "Idle Detection", active: status === "active" || status === "idle" },
                  ].map((mod) => (
                    <div key={mod.label} className="flex items-center gap-2 text-xs">
                      {mod.active ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      <mod.icon className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className={mod.active ? "text-foreground" : "text-muted-foreground"}>{mod.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Session Stats */}
            {isWorking && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Separator className="mb-3" />
                <p className="text-xs text-muted-foreground mb-2 font-medium">Session Stats</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-green-500/10 p-2">
                    <p className="text-[10px] text-green-400">Active</p>
                    <p className="text-sm font-mono font-semibold text-green-400">{formatDuration(activeSeconds)}</p>
                  </div>
                  <div className="rounded-md bg-yellow-500/10 p-2">
                    <p className="text-[10px] text-yellow-400">Paused</p>
                    <p className="text-sm font-mono font-semibold text-yellow-400">{formatDuration(pausedSeconds)}</p>
                  </div>
                  <div className="rounded-md bg-red-500/10 p-2">
                    <p className="text-[10px] text-red-400">Idle</p>
                    <p className="text-sm font-mono font-semibold text-red-400">{formatDuration(idleSeconds)}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> {screenshotCount} screenshots</span>
                  <span className="flex items-center gap-1"><Timer className="h-3 w-3" /> 12/hr rate</span>
                </div>
              </motion.div>
            )}

            {/* Activity Log */}
            {sessionLogs.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Separator className="mb-3" />
                <p className="text-xs text-muted-foreground mb-2 font-medium">Activity Log</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {sessionLogs.slice(0, 10).map((log, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground font-mono w-16 shrink-0">
                        {log.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span className="text-foreground">{log.detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Tracking is managed by your organization. User cannot disable monitoring permanently.
        </p>

        {/* Admin Force Logout Simulation */}
        {isWorking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium">🔧 Admin Simulation</p>
              <Button
                onClick={handleForceLogout}
                variant="destructive"
                size="sm"
                className="w-full gap-2 text-xs"
                disabled={forceLogoutTriggered}
              >
                <LogOut className="h-3 w-3" />
                {forceLogoutTriggered ? "Force Logout In Progress..." : "Simulate Admin Force Logout"}
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Idle Justification Dialog */}
      <Dialog open={showIdleDialog} onOpenChange={setShowIdleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Idle Time Detected
            </DialogTitle>
            <DialogDescription>
              No mouse or keyboard activity detected. Please provide a reason for the idle time.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., In a meeting, Phone call, Training session..."
            value={idleReason}
            onChange={(e) => setIdleReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowIdleDialog(false); setStatus("active"); }}>
              Dismiss
            </Button>
            <Button onClick={handleIdleSubmit}>Submit Reason</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Reminder Dialog */}
      <Dialog open={showStartReminder} onOpenChange={setShowStartReminder}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-yellow-500" /> Reminder
            </DialogTitle>
            <DialogDescription>
              You logged in but haven't started work yet. Click "Start Work" to begin tracking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowStartReminder(false); handleStart(); }} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Play className="h-4 w-4" /> Start Work Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Daily Session Summary
            </DialogTitle>
          </DialogHeader>
          {summary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                  <p className="text-xs text-green-400 mb-1">Active Time</p>
                  <p className="text-lg font-mono font-bold text-green-400">{formatDuration(summary.totalActive)}</p>
                </div>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
                  <p className="text-xs text-yellow-400 mb-1">Paused Time</p>
                  <p className="text-lg font-mono font-bold text-yellow-400">{formatDuration(summary.totalPaused)}</p>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                  <p className="text-xs text-red-400 mb-1">Idle Time</p>
                  <p className="text-lg font-mono font-bold text-red-400">{formatDuration(summary.totalIdle)}</p>
                </div>
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
                  <p className="text-xs text-primary mb-1">Screenshots</p>
                  <p className="text-lg font-mono font-bold text-primary">{summary.screenshotCount}</p>
                </div>
              </div>
              {summary.startTime && summary.endTime && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Session: {summary.startTime.toLocaleTimeString()} — {summary.endTime.toLocaleTimeString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSummary(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentPanel;
