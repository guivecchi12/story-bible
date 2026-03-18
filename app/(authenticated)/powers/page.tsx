"use client";

import { useState, useEffect } from "react";
import { PageHeader, TableSkeleton } from "@/components/layout";
import { DataTable, Column } from "@/components/ui/data-table";
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

interface Power {
  id: string;
  name: string;
  effects?: string;
  rules?: string;
  weaknesses?: string;
}

export default function PowersPage() {
  const [powers, setPowers] = useState<Power[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Power | null>(null);
  const [deleting, setDeleting] = useState<Power | null>(null);
  const [form, setForm] = useState({
    name: "",
    effects: "",
    rules: "",
    weaknesses: "",
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    const res = await apiFetch("/api/powers");
    if (res.ok) setPowers(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", effects: "", rules: "", weaknesses: "" });
    setDialogOpen(true);
  };
  const openEdit = (p: Power) => {
    setEditing(p);
    setForm({
      name: p.name,
      effects: p.effects || "",
      rules: p.rules || "",
      weaknesses: p.weaknesses || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editing
        ? await apiFetch(`/api/powers/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await apiFetch("/api/powers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
      if (res.ok) {
        addToast({ title: editing ? "Power updated" : "Power created" });
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
    const res = await apiFetch(`/api/powers/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      addToast({ title: "Power deleted" });
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

  const columns: Column<Power>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "effects",
      header: "Effects",
      render: (p) => (p.effects || "—").slice(0, 80),
    },
    {
      key: "weaknesses",
      header: "Weaknesses",
      render: (p) => (p.weaknesses || "—").slice(0, 80),
    },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader title="Powers" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Powers"
        subtitle="Manage abilities and powers"
        actionLabel="Add Power"
        onAction={openCreate}
      />
      <DataTable
        data={powers}
        columns={columns}
        actions={(p) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(p);
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
          <DialogTitle>{editing ? "Edit Power" : "New Power"}</DialogTitle>
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
            label="Effects"
            name="effects"
            type="textarea"
            value={form.effects}
            onChange={onChange}
          />
          <FormField
            label="Rules"
            name="rules"
            type="textarea"
            value={form.rules}
            onChange={onChange}
          />
          <FormField
            label="Weaknesses"
            name="weaknesses"
            type="textarea"
            value={form.weaknesses}
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
        title="Delete Power"
        description={`Delete "${deleting?.name}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
