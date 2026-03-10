"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FormField } from "@/components/shared";
import { ConfirmDialog } from "@/components/shared";
import { TableSkeleton } from "@/components/layout";
import { useToast } from "@/components/ui/toast";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface Character {
  id: string;
  name: string;
  type: string;
  description?: string;
  backstory?: string;
  factionId?: string | null;
  faction?: { id: string; name: string } | null;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Character | null>(null);
  const [deleting, setDeleting] = useState<Character | null>(null);
  const [factions, setFactions] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: "", type: "main", description: "", backstory: "", factionId: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const fetchData = async () => {
    try {
      const [charRes, facRes] = await Promise.all([fetch("/api/characters"), fetch("/api/factions")]);
      if (charRes.ok) setCharacters(await charRes.json());
      if (facRes.ok) setFactions(await facRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", type: "main", description: "", backstory: "", factionId: "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (char: Character) => {
    setEditing(char);
    setForm({ name: char.name, type: char.type, description: char.description || "", backstory: char.backstory || "", factionId: char.factionId || "" });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: "Name is required" }); return; }
    setSaving(true);
    try {
      const payload = { ...form, factionId: form.factionId || null };
      const res = editing
        ? await fetch(`/api/characters/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        : await fetch("/api/characters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        addToast({ title: editing ? "Character updated" : "Character created" });
        setDialogOpen(false);
        fetchData();
      } else {
        const data = await res.json();
        addToast({ title: "Error", description: JSON.stringify(data.error), variant: "destructive" });
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({ title: "Character deleted" });
        setDeleteDialogOpen(false);
        setDeleting(null);
        fetchData();
      }
    } finally { setSaving(false); }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const columns: Column<Character>[] = [
    { key: "name", header: "Name", sortable: true },
    { key: "type", header: "Type", sortable: true, render: (c) => <Badge variant={c.type === "main" ? "default" : "secondary"}>{c.type}</Badge> },
    { key: "faction", header: "Faction", render: (c) => c.faction?.name || "—" },
    { key: "description", header: "Description", render: (c) => c.description ? c.description.slice(0, 60) + (c.description.length > 60 ? "..." : "") : "—" },
  ];

  if (loading) return <div className="space-y-4"><PageHeader title="Characters" subtitle="Manage your story's characters" /><TableSkeleton /></div>;

  return (
    <div>
      <PageHeader title="Characters" subtitle="Manage your story's characters" actionLabel="Add Character" onAction={openCreate} />
      <DataTable
        data={characters}
        columns={columns}
        onRowClick={(c) => router.push(`/characters/${c.id}`)}
        actions={(c) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/characters/${c.id}`)}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { setDeleting(c); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        )}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader><DialogTitle>{editing ? "Edit Character" : "New Character"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" name="name" value={form.name} onChange={onChange} error={errors.name} required />
          <FormField label="Type" name="type" type="select" value={form.type} onChange={onChange} options={[{ value: "main", label: "Main" }, { value: "supporting", label: "Supporting" }]} />
          <FormField label="Faction" name="factionId" type="select" value={form.factionId} onChange={onChange} options={[{ value: "", label: "None" }, ...factions.map((f) => ({ value: f.id, label: f.name }))]} />
          <FormField label="Description" name="description" type="textarea" value={form.description} onChange={onChange} />
          <FormField label="Backstory" name="backstory" type="textarea" value={form.backstory} onChange={onChange} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </Dialog>
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Delete Character" description={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`} onConfirm={handleDelete} loading={saving} />
    </div>
  );
}
