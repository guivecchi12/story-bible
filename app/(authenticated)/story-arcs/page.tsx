"use client";

import { useState, useEffect } from "react";
import { PageHeader, TableSkeleton } from "@/components/layout";
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
import { useToast } from "@/components/ui/toast";
import { Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface StoryArc {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  parentArcId?: string | null;
  parentArc?: { title: string } | null;
  subPlots?: any[];
  plotEvents?: any[];
}

export default function StoryArcsPage() {
  const [arcs, setArcs] = useState<StoryArc[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<StoryArc | null>(null);
  const [deleting, setDeleting] = useState<StoryArc | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "main",
    status: "planned",
    parentArcId: "",
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    const res = await apiFetch("/api/story-arcs");
    if (res.ok) setArcs(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      type: "main",
      status: "planned",
      parentArcId: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (a: StoryArc) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description || "",
      type: a.type,
      status: a.status,
      parentArcId: a.parentArcId || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parentArcId: form.parentArcId || null };
      const res = editing
        ? await apiFetch(`/api/story-arcs/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/story-arcs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (res.ok) {
        addToast({ title: editing ? "Updated" : "Created" });
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
    const res = await apiFetch(`/api/story-arcs/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      addToast({ title: "Deleted" });
      setDeleteOpen(false);
      fetchData();
    }
    setSaving(false);
  };
  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const statusColors: Record<string, "default" | "secondary" | "outline"> = {
    planned: "secondary",
    active: "default",
    resolved: "outline",
  };
  const columns: Column<StoryArc>[] = [
    { key: "title", header: "Title", sortable: true },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (a) => <Badge variant="secondary">{a.type}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (a) => (
        <Badge variant={statusColors[a.status] || "default"}>{a.status}</Badge>
      ),
    },
    {
      key: "parentArc",
      header: "Parent Arc",
      render: (a) => a.parentArc?.title || "—",
    },
    {
      key: "plotEvents",
      header: "Events",
      render: (a) => a.plotEvents?.length ?? 0,
    },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader title="Story Arcs" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Story Arcs"
        subtitle="Main plots and subplots"
        actionLabel="Add Story Arc"
        onAction={openCreate}
      />
      <DataTable
        data={arcs}
        columns={columns}
        actions={(a) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(a)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(a);
                setDeleteOpen(true);
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
            {editing ? "Edit Story Arc" : "New Story Arc"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={onChange}
            required
          />
          <FormField
            label="Type"
            name="type"
            type="select"
            value={form.type}
            onChange={onChange}
            options={[
              { value: "main", label: "Main" },
              { value: "subplot", label: "Subplot" },
              { value: "character_arc", label: "Character Arc" },
            ]}
          />
          <FormField
            label="Status"
            name="status"
            type="select"
            value={form.status}
            onChange={onChange}
            options={[
              { value: "planned", label: "Planned" },
              { value: "active", label: "Active" },
              { value: "resolved", label: "Resolved" },
            ]}
          />
          <FormField
            label="Parent Arc"
            name="parentArcId"
            type="select"
            value={form.parentArcId}
            onChange={onChange}
            options={[
              { value: "", label: "None" },
              ...arcs
                .filter((a) => a.id !== editing?.id)
                .map((a) => ({ value: a.id, label: a.title })),
            ]}
          />
          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={form.description}
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
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Story Arc"
        description={`Delete "${deleting?.title}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
