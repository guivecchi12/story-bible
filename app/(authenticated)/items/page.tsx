"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Eye, Pencil, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useTimeline } from "@/lib/contexts/timeline-context";

interface Item {
  id: string;
  name: string;
  aliases?: string[];
  type: string;
  description?: string;
  lore?: string;
  properties?: string;
  locationId?: string | null;
  location?: { name: string } | null;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const [form, setForm] = useState({
    name: "",
    aliases: "",
    type: "artifact",
    description: "",
    lore: "",
    properties: "",
    locationId: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();

  const fetchData = async () => {
    const [iRes, lRes] = await Promise.all([
      apiFetch("/api/items"),
      apiFetch("/api/locations"),
    ]);
    if (iRes.ok) setItems(await iRes.json());
    if (lRes.ok) setLocations(await lRes.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [activeTimeline?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      aliases: "",
      type: "artifact",
      description: "",
      lore: "",
      properties: "",
      locationId: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (i: Item) => {
    setEditing(i);
    setForm({
      name: i.name,
      aliases: (i.aliases || []).join(", "),
      type: i.type,
      description: i.description || "",
      lore: i.lore || "",
      properties: i.properties || "",
      locationId: i.locationId || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const aliases = form.aliases
        ? form.aliases.split(",").map((a) => a.trim()).filter(Boolean)
        : [];
      let res: Response;

      if (editing && activeTimeline) {
        const tlPayload: any = {
          itemId: editing.id,
          name: form.name !== editing.name ? form.name : null,
          aliases,
          aliasesOverridden: form.aliases !== ((editing as any).aliases || []).join(", "),
          type: form.type !== editing.type ? form.type : null,
          description: form.description || null,
          lore: form.lore || null,
          properties: form.properties || null,
          locationId: form.locationId || null,
        };
        res = await apiFetch(`/api/timeline/${activeTimeline.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tlPayload),
        });
      } else if (editing) {
        const payload = { ...form, aliases, locationId: form.locationId || null };
        res = await apiFetch(`/api/items/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const payload = { ...form, aliases, locationId: form.locationId || null };
        res = await apiFetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        addToast({ title: editing ? (activeTimeline ? "Timeline state updated" : "Updated") : "Created" });
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
    const res = await apiFetch(`/api/items/${deleting.id}`, { method: "DELETE" });
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

  const columns: Column<Item>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (i) => <Badge variant="secondary">{i.type}</Badge>,
    },
    {
      key: "location",
      header: "Location",
      render: (i) => i.location?.name || "—",
    },
    {
      key: "description",
      header: "Description",
      render: (i) => (i.description || "—").slice(0, 60),
    },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader title="Items" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Items"
        subtitle="Weapons, artifacts, and relics"
        actionLabel="Add Item"
        onAction={openCreate}
      />
      <DataTable
        data={items}
        columns={columns}
        onRowClick={(i) => router.push(`/items/${i.id}`)}
        actions={(i) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/items/${i.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(i)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(i);
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
          <DialogTitle>{editing ? (activeTimeline ? `Edit Item (Timeline: ${activeTimeline.title})` : "Edit Item") : "New Item"}</DialogTitle>
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
            label="Also Known As"
            name="aliases"
            value={form.aliases}
            onChange={onChange}
            placeholder="Comma-separated, e.g. Narsil, The Sword That Was Broken"
          />
          <FormField
            label="Type"
            name="type"
            type="select"
            value={form.type}
            onChange={onChange}
            options={[
              { value: "weapon", label: "Weapon" },
              { value: "artifact", label: "Artifact" },
              { value: "relic", label: "Relic" },
              { value: "tool", label: "Tool" },
              { value: "symbol", label: "Symbol" },
            ]}
          />
          <FormField
            label="Location"
            name="locationId"
            type="select"
            value={form.locationId}
            onChange={onChange}
            options={[
              { value: "", label: "None" },
              ...locations.map((l) => ({ value: l.id, label: l.name })),
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
            label="Lore"
            name="lore"
            type="richtext"
            value={form.lore}
            onChange={onChange}
          />
          <FormField
            label="Properties"
            name="properties"
            type="textarea"
            value={form.properties}
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
        title="Delete Item"
        description={`Delete "${deleting?.name}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
