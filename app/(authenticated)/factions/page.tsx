"use client";

import { useState, useEffect } from "react";
import { PageHeader, TableSkeleton } from "@/components/layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared";
import { useToast } from "@/components/ui/toast";
import { Pencil, Trash2 } from "lucide-react";

interface Faction { id: string; name: string; description?: string; characters?: any[]; }

export default function FactionsPage() {
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Faction | null>(null);
  const [deleting, setDeleting] = useState<Faction | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => { const res = await fetch("/api/factions"); if (res.ok) setFactions(await res.json()); setLoading(false); };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "" }); setDialogOpen(true); };
  const openEdit = (f: Faction) => { setEditing(f); setForm({ name: f.name, description: f.description || "" }); setDialogOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = editing
        ? await fetch(`/api/factions/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/factions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { addToast({ title: editing ? "Updated" : "Created" }); setDialogOpen(false); fetchData(); }
      else { const data = await res.json(); addToast({ title: "Error", description: JSON.stringify(data.error), variant: "destructive" }); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => { if (!deleting) return; setSaving(true); const res = await fetch(`/api/factions/${deleting.id}`, { method: "DELETE" }); if (res.ok) { addToast({ title: "Deleted" }); setDeleteOpen(false); fetchData(); } setSaving(false); };
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const columns: Column<Faction>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "description", header: "Description", render: (f) => (f.description || "—").slice(0, 80) },
    { key: "members", header: "Members", render: (f) => f.characters?.length ?? 0 },
  ];

  if (loading) return <div className="space-y-4"><PageHeader title="Factions" /><TableSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Factions" subtitle="Groups and organizations" actionLabel="Add Faction" onAction={openCreate} />
      <DataTable data={factions} columns={columns} actions={(f) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setDeleting(f); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      )} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader><DialogTitle>{editing ? "Edit Faction" : "New Faction"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" name="name" value={form.name} onChange={onChange} required />
          <FormField label="Description" name="description" type="textarea" value={form.description} onChange={onChange} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button></DialogFooter>
        </form>
      </Dialog>
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Delete Faction" description={`Delete "${deleting?.name}"?`} onConfirm={handleDelete} loading={saving} />
    </div>
  );
}
