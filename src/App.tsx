import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlatformProvider } from "@/contexts/PlatformContext";
import { SuperAdminAuthGuard, CompanyAdminAuthGuard } from "@/components/AuthGuards";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import CompanyAdminLogin from "./pages/CompanyAdminLogin";
import Download from "./pages/Download";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Screenshots from "./pages/Screenshots";
import TimeLogs from "./pages/TimeLogs";
import AppUsage from "./pages/AppUsage";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import InviteMembers from "./pages/InviteMembers";
import TeamManagement from "./pages/TeamManagement";
import SettingsPage from "./pages/SettingsPage";
import SuperAdmin from "./pages/SuperAdmin";
import ActivityDashboard from "./pages/ActivityDashboard";
import ApiSpecification from "./pages/ApiSpecification";
import NotificationsPage from "./pages/NotificationsPage";
import Onboarding from "./pages/Onboarding";
import AppRestrictions from "./pages/AppRestrictions";
import IdleJustification from "./pages/IdleJustification";
import Attendance from "./pages/Attendance";
import AcceptInvite from "./pages/AcceptInvite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlatformProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<CompanyAdminLogin />} />
              <Route path="/super/admin/login" element={<SuperAdminLogin />} />
              <Route path="/invite/:token" element={<AcceptInvite />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/download" element={<Download />} />
              <Route path="/contact" element={<Contact />} />

              {/* Company Dashboard — protected */}
              <Route path="/dashboard" element={<CompanyAdminAuthGuard><Dashboard /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/screenshots" element={<CompanyAdminAuthGuard><Screenshots /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/time" element={<CompanyAdminAuthGuard><TimeLogs /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/usage" element={<CompanyAdminAuthGuard><AppUsage /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/invite" element={<CompanyAdminAuthGuard><InviteMembers /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/billing" element={<CompanyAdminAuthGuard><Billing /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/reports" element={<CompanyAdminAuthGuard><Reports /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/team" element={<CompanyAdminAuthGuard><TeamManagement /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/settings" element={<CompanyAdminAuthGuard><SettingsPage /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/activity" element={<CompanyAdminAuthGuard><ActivityDashboard /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/api-spec" element={<CompanyAdminAuthGuard><ApiSpecification /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/notifications" element={<CompanyAdminAuthGuard><NotificationsPage /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/restrictions" element={<CompanyAdminAuthGuard><AppRestrictions /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/justifications" element={<CompanyAdminAuthGuard><IdleJustification /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/attendance" element={<CompanyAdminAuthGuard><Attendance /></CompanyAdminAuthGuard>} />
              <Route path="/dashboard/*" element={<CompanyAdminAuthGuard><Dashboard /></CompanyAdminAuthGuard>} />

              {/* Super Admin — protected */}
              <Route path="/super-admin" element={<SuperAdminAuthGuard><SuperAdmin /></SuperAdminAuthGuard>} />
              <Route path="/super-admin/*" element={<SuperAdminAuthGuard><SuperAdmin /></SuperAdminAuthGuard>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </PlatformProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
