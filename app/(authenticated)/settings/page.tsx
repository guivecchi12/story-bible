"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Trash2, Mail, Copy, Check, Users } from "lucide-react";
import { useBook } from "@/lib/contexts/book-context";
import { apiFetch } from "@/lib/api";

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
  inviter: { name: string | null; email: string };
}

interface Member {
  bookId: string;
  userId: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

export default function SettingsPage() {
  const { activeBook } = useBook();
  const isOwner = activeBook?.role === "owner";

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("collaborator");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner && activeBook) {
      fetchData();
    }
  }, [isOwner, activeBook?.id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [invRes, memRes] = await Promise.all([
        apiFetch("/api/invitations"),
        apiFetch(`/api/books/${activeBook!.id}/members`),
      ]);
      if (invRes.ok) setInvitations(await invRes.json());
      if (memRes.ok) setMembers(await memRes.json());
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await apiFetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create invitation");
        return;
      }
      setEmail("");
      setRole("collaborator");
      setDialogOpen(false);
      fetchData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(id: string) {
    await apiFetch(`/api/invitations/${id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleRemoveMember(userId: string) {
    await apiFetch(`/api/books/${activeBook!.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    fetchData();
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  if (!isOwner) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Only owners can manage settings.</p>
      </div>
    );
  }

  const activeInvitations = invitations.filter(
    (i) => !i.usedAt && new Date(i.expiresAt) > new Date()
  );
  const pastInvitations = invitations.filter(
    (i) => i.usedAt || new Date(i.expiresAt) <= new Date()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage {activeBook?.name || "book"} members and invitations
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Members */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No members</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {member.user.name || member.user.email}
                      </p>
                      {member.user.name && (
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      )}
                    </div>
                    <Badge variant={member.role === "owner" ? "default" : "secondary"} className="capitalize">
                      {member.role}
                    </Badge>
                  </div>
                  {member.role !== "owner" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId)}
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : activeInvitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active invitations</p>
          ) : (
            <div className="space-y-3">
              {activeInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(inv.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {inv.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteLink(inv.token)}
                      title="Copy invite link"
                    >
                      {copiedToken === inv.token ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(inv.id)}
                      title="Revoke invitation"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pastInvitations.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Past Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-md border p-3 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.usedAt ? "Accepted" : "Expired"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {inv.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation to collaborate on {activeBook?.name || "this book"}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "collaborator", label: "Collaborator (read & write)" },
                { value: "viewer", label: "Viewer (read only)" },
              ]}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
