import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight, Monitor, CheckCircle2, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      const result = login(email.trim(), password);
      setIsLoading(false);

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Device bound. Tracking started.",
        });
        navigate(result.redirectTo || "/dashboard");
      } else {
        setError(result.error || "Login failed.");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="rounded-xl bg-gradient-card border border-border p-8">
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground mx-auto mb-3">W</div>
              <h1 className="text-2xl font-bold text-foreground">{isSignUp ? "Create your account" : "Welcome back"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{isSignUp ? "Start monitoring your team" : "Sign in to your dashboard"}</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isSignUp && (
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Acme Corp" className="mt-1.5" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" className="mt-1.5" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
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
                {isLoading ? "Signing in..." : isSignUp ? "Create Account" : "Sign In"} {!isLoading && <ArrowRight size={16} />}
              </Button>

              {!isSignUp && (
                <div className="rounded-lg border border-border bg-secondary/30 p-3 flex items-start gap-3">
                  <Monitor size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Desktop Agent Login</p>
                    <p className="text-[10px] text-muted-foreground">Use these same credentials in the desktop app. Your device will be auto-bound and tracking will start immediately.</p>
                  </div>
                </div>
              )}

              {!isSignUp && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                  <p className="text-[10px] font-medium text-primary">Demo Credentials</p>
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <p><span className="text-foreground font-medium">Admin:</span> alice@acme.com / admin123</p>
                    <p><span className="text-foreground font-medium">User:</span> bob@acme.com / user123</p>
                    <p><span className="text-foreground font-medium">Super Admin:</span> superadmin@webmok.com / super123</p>
                  </div>
                </div>
              )}
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              {isSignUp ? (
                <button onClick={() => setIsSignUp(false)} className="text-primary hover:underline">Sign in</button>
              ) : (
                <Link to="/onboarding" className="text-primary hover:underline">Sign up</Link>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
