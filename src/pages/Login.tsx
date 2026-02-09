import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {isSignUp && (
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Acme Corp" className="mt-1.5" />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button className="w-full gap-2" size="lg">
                {isSignUp ? "Create Account" : "Sign In"} <ArrowRight size={16} />
              </Button>
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
