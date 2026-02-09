import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, MoreHorizontal, Trash2, Edit2, Ban, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { PageGuard, RoleGuard } from "@/components/RoleGuard";
import { usePermissions } from "@/hooks/usePermissions";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sub_admin" | "user";
  status: "active" | "suspended";
  joined: string;
  lastActive: string;
  hoursToday: string;
}

const initialMembers: TeamMember[] = [
  { id: "1", name: "Alice Johnson", email: "alice@acme.com", role: "admin", status: "active", joined: "2025-11-12", lastActive: "2 min ago", hoursToday: "7h 42m" },
  { id: "2", name: "Bob Smith", email: "bob@acme.com", role: "user", status: "active", joined: "2025-12-03", lastActive: "5 min ago", hoursToday: "6h 18m" },
  { id: "3", name: "Carol White", email: "carol@acme.com", role: "sub_admin", status: "active", joined: "2025-12-15", lastActive: "12 min ago", hoursToday: "5h 55m" },
  { id: "4", name: "David Lee", email: "david@acme.com", role: "user", status: "active", joined: "2026-01-05", lastActive: "1 min ago", hoursToday: "7h 12m" },
  { id: "5", name: "Eva Brown", email: "eva@acme.com", role: "user", status: "suspended", joined: "2026-01-10", lastActive: "3 days ago", hoursToday: "0h" },
  { id: "6", name: "Frank Chen", email: "frank@acme.com", role: "user", status: "active", joined: "2026-01-22", lastActive: "8 min ago", hoursToday: "6h 45m" },
];

const roleLabels: Record<string, string> = { admin: "Admin", sub_admin: "Sub-Admin", user: "Employee" };
const roleBadgeVariant = (role: string) => role === "admin" ? "default" : role === "sub_admin" ? "secondary" : "outline";

const TeamManagement = () => {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState("");
  const { can } = usePermissions();

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRemove = () => {
    if (!removeTarget) return;
    setMembers(members.filter(m => m.id !== removeTarget.id));
    toast({ title: "User removed", description: `${removeTarget.name} has been removed from the team.` });
    setRemoveTarget(null);
  };

  const handleToggleStatus = (member: TeamMember) => {
    setMembers(members.map(m =>
      m.id === member.id ? { ...m, status: m.status === "active" ? "suspended" : "active" } : m
    ));
    toast({ title: member.status === "active" ? "User suspended" : "User reactivated", description: member.name });
  };

  const handleSaveRole = () => {
    if (!editTarget || !editRole) return;
    setMembers(members.map(m => m.id === editTarget.id ? { ...m, role: editRole as TeamMember["role"] } : m));
    toast({ title: "Role updated", description: `${editTarget.name} is now ${roleLabels[editRole]}` });
    setEditTarget(null);
  };

  const canManage = can("manage_team");

  return (
    <DashboardLayout>
      <PageGuard permission="view_team">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users size={22} className="text-primary" /> Team Management
              </h1>
              <p className="text-sm text-muted-foreground">{members.length} members · {members.filter(m => m.status === "active").length} active</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search members..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="p-4">Member</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Hours Today</th>
                    <th className="p-4">Last Active</th>
                    <th className="p-4">Joined</th>
                    {canManage && <th className="p-4"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((member, i) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-secondary/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-foreground">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${member.status === "active" ? "bg-status-active" : "bg-status-offline"}`} />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{member.name}</div>
                            <div className="text-[10px] text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={roleBadgeVariant(member.role) as any} className="text-[10px]">
                          <Shield size={10} className="mr-1" />{roleLabels[member.role]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${member.status === "active" ? "text-status-active" : "text-status-offline"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === "active" ? "bg-status-active" : "bg-status-offline"}`} />
                          {member.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="p-4 text-foreground font-medium">{member.hoursToday}</td>
                      <td className="p-4 text-muted-foreground text-xs">{member.lastActive}</td>
                      <td className="p-4 text-muted-foreground text-xs">{member.joined}</td>
                      {canManage && (
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {can("assign_roles") && (
                                <DropdownMenuItem onClick={() => { setEditTarget(member); setEditRole(member.role); }}>
                                  <Edit2 size={12} className="mr-2" /> Change Role
                                </DropdownMenuItem>
                              )}
                              {can("suspend_users") && (
                                <DropdownMenuItem onClick={() => handleToggleStatus(member)}>
                                  {member.status === "active" ? <><Ban size={12} className="mr-2" /> Suspend</> : <><CheckCircle2 size={12} className="mr-2" /> Reactivate</>}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => setRemoveTarget(member)}>
                                <Trash2 size={12} className="mr-2" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-muted-foreground text-sm">No members found.</div>
            )}
          </motion.div>

          {/* Remove Confirmation Dialog */}
          <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Team Member</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove <span className="font-semibold text-foreground">{removeTarget?.name}</span> from the team? This action cannot be undone. Their tracking data will be retained.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleRemove}>Remove</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Role Dialog */}
          <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Role</DialogTitle>
                <DialogDescription>
                  Update role for <span className="font-semibold text-foreground">{editTarget?.name}</span>
                </DialogDescription>
              </DialogHeader>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin — Full company control</SelectItem>
                  <SelectItem value="sub_admin">Sub-Admin — View reports & screenshots</SelectItem>
                  <SelectItem value="user">Employee — Desktop tracking only</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
                <Button onClick={handleSaveRole}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageGuard>
    </DashboardLayout>
  );
};

export default TeamManagement;
