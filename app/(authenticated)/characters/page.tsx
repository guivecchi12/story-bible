"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormField } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared";
import { TableSkeleton } from "@/components/layout";
import { useToast } from "@/components/ui/toast";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useTimeline } from "@/lib/contexts/timeline-context";

interface Character {
  id: string;
  name: string;
  nicknames?: string[];
  type: string;
  description?: string;
  backstory?: string;
  factions?: { factionId: string; faction: { id: string; name: string } }[];
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [deleting, setDeleting] = useState<Character | null>(null);
  const [form, setForm] = useState({
    name: "",
    nicknames: "",
    type: "main",
    description: "",
    backstory: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();

  const fetchData = async () => {
    try {
      const charRes = await apiFetch("/api/characters");
      if (charRes.ok) setCharacters(await charRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTimeline?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      nicknames: "",
      type: "main",
      description: "",
      backstory: "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (char: Character) => {
    setEditing(char);
    setForm({
      name: char.name,
      nicknames: (char.nicknames || []).join(", "),
      type: char.type,
      description: char.description || "",
      backstory: char.backstory || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      const nicknames = form.nicknames
        ? form.nicknames.split(",").map((n) => n.trim()).filter(Boolean)
        : [];
      let res: Response;

      if (editing && activeTimeline) {
        // Save as timeline override
        const tlPayload: any = {
          characterId: editing.id,
          name: form.name !== editing.name ? form.name : null,
          nicknames,
          nicknamesOverridden: form.nicknames !== (editing.nicknames || []).join(", "),
          type: form.type !== editing.type ? form.type : null,
          description: form.description || null,
          backstory: form.backstory || null,
        };
        res = await apiFetch(`/api/timeline/${activeTimeline.id}/characters`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tlPayload),
        });
      } else if (editing) {
        const payload = { ...form, nicknames };
        res = await apiFetch(`/api/characters/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const payload = { ...form, nicknames };
        res = await apiFetch("/api/characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        addToast({
          title: editing
            ? activeTimeline ? "Timeline state updated" : "Character updated"
            : "Character created",
        });
        setDialogOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        addToast({
          title: "Error",
          description: JSON.stringify(data.error),
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/characters/${deleting.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast({ title: "Character deleted" });
        setDeleteDialogOpen(false);
        setDeleting(null);
        fetchData();
      }
    } finally {
      setSaving(false);
    }
  };

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const columns: Column<Character>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (c) => (
        <Badge variant={c.type === "main" ? "default" : "secondary"}>
          {c.type}
        </Badge>
      ),
    },
    {
      key: "factions",
      header: "Factions",
      render: (c) =>
        c.factions?.length
          ? c.factions.map((cf) => cf.faction.name).join(", ")
          : "—",
    },
    {
      key: "description",
      header: "Description",
      render: (c) =>
        c.description
          ? c.description.slice(0, 60) +
            (c.description.length > 60 ? "..." : "")
          : "—",
    },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader
          title="Characters"
          subtitle="Manage your story's characters"
        />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Characters"
        subtitle="Manage your story's characters"
        actionLabel="Add Character"
        onAction={openCreate}
      />
      <DataTable
        data={characters}
        columns={columns}
        onRowClick={(c) => router.push(`/characters/${c.id}`)}
        actions={(c) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/characters/${c.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(c);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {editing
              ? activeTimeline ? `Edit Character (Timeline: ${activeTimeline.title})` : "Edit Character"
              : "New Character"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            error={errors.name}
            required
          />
          <FormField
            label="Nicknames"
            name="nicknames"
            value={form.nicknames}
            onChange={onChange}
            placeholder="Comma-separated, e.g. The Wise, Stormcrow"
          />
          <FormField
            label="Type"
            name="type"
            type="select"
            value={form.type}
            onChange={onChange}
            options={[
              { value: "main", label: "Main" },
              { value: "supporting", label: "Supporting" },
            ]}
          />
          <FormField
            label="Description"
            name="description"
            type="richtext"
            value={form.description}
            onChange={onChange}
          />
          <FormField
            label="Backstory"
            name="backstory"
            type="richtext"
            value={form.backstory}
            onChange={onChange}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Character"
        description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
