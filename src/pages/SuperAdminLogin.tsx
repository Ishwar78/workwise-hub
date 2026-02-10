import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import OtpVerification from "@/components/OtpVerification";

const SuperAdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const navigate = useNavigate();
  const { login, completePendingAuth } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please enter both email and password."); return; }

    setIsLoading(true);
    setTimeout(() => {
      const result = login(email.trim(), password, { loginType: "super_admin" });
      setIsLoading(false);

      if (result.success) {
        if (result.requiresOtp) {
          setOtpStep(true);
        } else {
          toast({ title: "Welcome, Super Admin", description: "Redirecting to platform dashboard." });
          navigate("/super-admin");
        }
      } else {
        setError(result.error || "Login failed.");
      }
    }, 500);
  };

  const handleOtpVerified = () => {
    completePendingAuth();
    toast({ title: "Welcome, Super Admin", description: "Phone verified. Redirecting to platform dashboard." });
    navigate("/super-admin");
  };

  if (otpStep) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <OtpVerification
          phone="+91••••••••00"
          onVerified={handleOtpVerified}
          onCancel={() => setOtpStep(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-xl bg-gradient-card border border-border p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={24} className="text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Super Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform management access only</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="superadmin@domain.com" className="mt-1.5" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle size={14} /> {error}
              </p>
            )}

            <Button className="w-full gap-2" size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In as Super Admin"} {!isLoading && <ArrowRight size={16} />}
            </Button>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 space-y-1.5">
              <p className="text-[10px] font-medium text-destructive">⚠️ Restricted Access</p>
              <p className="text-[10px] text-muted-foreground">
                This portal is exclusively for platform Super Admins. Company Admins must use <a href="/admin/login" className="text-primary hover:underline">/admin/login</a>.
              </p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
              <p className="text-[10px] font-medium text-primary">Demo Credentials</p>
              <p className="text-[10px] text-muted-foreground">
                <span className="text-foreground font-medium">Email:</span> superadminmok@gmail.com<br />
                <span className="text-foreground font-medium">Password:</span> mok@webteam
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
