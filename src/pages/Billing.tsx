import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, ArrowRight, Receipt, Calendar, Users, HardDrive, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";

const currentPlan = {
  name: "Professional",
  price: 99,
  cycle: "monthly",
  nextBilling: "2026-03-12",
  maxUsers: 25,
  currentUsers: 18,
  screenshotRate: "12/hr",
  storageUsed: 2.4,
  storageMax: 5,
};

const allPlans = [
  { name: "Starter", price: 49, users: 10, storage: "2 GB" },
  { name: "Professional", price: 99, users: 25, storage: "5 GB" },
  { name: "Team", price: 199, users: 50, storage: "15 GB" },
  { name: "Enterprise", price: 499, users: "100+", storage: "Unlimited" },
];

const invoices = [
  { id: "INV-2026-02", date: "2026-02-12", amount: 99, status: "paid" },
  { id: "INV-2026-01", date: "2026-01-12", amount: 99, status: "paid" },
  { id: "INV-2025-12", date: "2025-12-12", amount: 99, status: "paid" },
  { id: "INV-2025-11", date: "2025-11-12", amount: 49, status: "paid" },
  { id: "INV-2025-10", date: "2025-10-12", amount: 49, status: "paid" },
];

const Billing = () => {
  const userPct = (currentPlan.currentUsers / currentPlan.maxUsers) * 100;
  const storagePct = (currentPlan.storageUsed / currentPlan.storageMax) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CreditCard size={22} className="text-primary" /> Billing & Subscription
          </h1>
          <p className="text-sm text-muted-foreground">Manage your plan, usage, and payment history</p>
        </div>

        {/* Current Plan */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-card border border-border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-foreground">{currentPlan.name} Plan</h2>
                <Badge className="text-[10px]">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Next billing on {currentPlan.nextBilling}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-foreground">${currentPlan.price}<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Users size={14} /> Users</span>
                <span className="text-foreground font-medium">{currentPlan.currentUsers}/{currentPlan.maxUsers}</span>
              </div>
              <Progress value={userPct} className="h-2" />
              {userPct > 80 && <p className="text-[10px] text-status-idle flex items-center gap-1"><AlertTriangle size={10} /> Nearing limit</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><HardDrive size={14} /> Storage</span>
                <span className="text-foreground font-medium">{currentPlan.storageUsed}/{currentPlan.storageMax} GB</span>
              </div>
              <Progress value={storagePct} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Camera size={14} /> Screenshots</span>
                <span className="text-foreground font-medium">{currentPlan.screenshotRate}</span>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-[10px] text-muted-foreground">Max rate for this plan</p>
            </div>
          </div>
        </motion.div>

        {/* Plan Comparison */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-semibold text-foreground text-sm mb-3">Change Plan</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allPlans.map(plan => {
              const isCurrent = plan.name === currentPlan.name;
              return (
                <div key={plan.name} className={`rounded-xl border p-4 transition-all ${isCurrent ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-gradient-card hover:border-primary/30"}`}>
                  <h3 className="font-semibold text-foreground text-sm">{plan.name}</h3>
                  <div className="text-2xl font-bold text-foreground mt-1">${plan.price}<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div>{plan.users} users</div>
                    <div>{plan.storage} storage</div>
                  </div>
                  <Button variant={isCurrent ? "outline" : "default"} size="sm" className="w-full mt-3 gap-1" disabled={isCurrent}>
                    {isCurrent ? <><Check size={12} /> Current</> : <>Select <ArrowRight size={12} /></>}
                  </Button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl bg-gradient-card border border-border">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Receipt size={16} className="text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Payment History</h2>
          </div>
          <div className="divide-y divide-border">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                <div>
                  <div className="text-sm font-medium text-foreground">{inv.id}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={10} /> {inv.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">${inv.amount}</span>
                  <Badge variant="secondary" className="text-[10px] capitalize">{inv.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
