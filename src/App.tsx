import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Screenshots from "./pages/Screenshots";
import TimeLogs from "./pages/TimeLogs";
import AppUsage from "./pages/AppUsage";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import InviteMembers from "./pages/InviteMembers";
import SuperAdmin from "./pages/SuperAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/download" element={<Download />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/screenshots" element={<Screenshots />} />
          <Route path="/dashboard/time" element={<TimeLogs />} />
          <Route path="/dashboard/usage" element={<AppUsage />} />
          <Route path="/dashboard/invite" element={<InviteMembers />} />
          <Route path="/dashboard/billing" element={<Billing />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/super-admin/*" element={<SuperAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
