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

interface Motivation {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export default function MotivationsPage() {
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Motivation | null>(null);
  const [deleting, setDeleting] = useState<Motivation | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "personal",
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    const res = await apiFetch("/api/motivations");
    if (res.ok) setMotivations(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", category: "personal" });
    setDialogOpen(true);
  };
  const openEdit = (m: Motivation) => {
    setEditing(m);
    setForm({
      name: m.name,
      description: m.description || "",
      category: m.category,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editing
        ? await apiFetch(`/api/motivations/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await apiFetch("/api/motivations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
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
    const res = await apiFetch(`/api/motivations/${deleting.id}`, {
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

  const categoryColors: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    personal: "default",
    political: "secondary",
    emotional: "destructive",
    survival: "outline",
  };
  const columns: Column<Motivation>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (m) => (
        <Badge variant={categoryColors[m.category] || "default"}>
          {m.category}
        </Badge>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (m) => (m.description || "—").slice(0, 80),
    },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader title="Motivations" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Motivations"
        subtitle="Character and faction drives"
        actionLabel="Add Motivation"
        onAction={openCreate}
      />
      <DataTable
        data={motivations}
        columns={columns}
        actions={(m) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(m);
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
            {editing ? "Edit Motivation" : "New Motivation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
          <FormField
            label="Category"
            name="category"
            type="select"
            value={form.category}
            onChange={onChange}
            options={[
              { value: "personal", label: "Personal" },
              { value: "political", label: "Political" },
              { value: "emotional", label: "Emotional" },
              { value: "survival", label: "Survival" },
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
        title="Delete Motivation"
        description={`Delete "${deleting?.name}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
