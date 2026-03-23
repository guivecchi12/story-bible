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

interface Location {
  id: string;
  name: string;
  type: string;
  description?: string;
  climate?: string;
  culture?: string;
  parentId?: string | null;
  rulerFactionId?: string | null;
  parent?: { name: string } | null;
  rulerFaction?: { id: string; name: string } | null;
  children?: any[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [factions, setFactions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState<Location | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "city",
    description: "",
    climate: "",
    culture: "",
    parentId: "",
    rulerFactionId: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();

  const fetchData = async () => {
    const [lRes, fRes] = await Promise.all([
      apiFetch("/api/locations"),
      apiFetch("/api/factions"),
    ]);
    if (lRes.ok) setLocations(await lRes.json());
    if (fRes.ok) setFactions(await fRes.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, [activeTimeline?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      type: "city",
      description: "",
      climate: "",
      culture: "",
      parentId: "",
      rulerFactionId: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (l: Location) => {
    setEditing(l);
    setForm({
      name: l.name,
      type: l.type,
      description: l.description || "",
      climate: l.climate || "",
      culture: l.culture || "",
      parentId: l.parentId || "",
      rulerFactionId: l.rulerFactionId || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res: Response;
      if (editing && activeTimeline) {
        const tlPayload = {
          locationId: editing.id,
          name: form.name !== editing.name ? form.name : null,
          type: form.type !== editing.type ? form.type : null,
          description: form.description || null,
          climate: form.climate || null,
          culture: form.culture || null,
          rulerFactionId: form.rulerFactionId || null,
        };
        res = await apiFetch(`/api/timeline/${activeTimeline.id}/locations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tlPayload),
        });
      } else if (editing) {
        const payload = { ...form, parentId: form.parentId || null, rulerFactionId: form.rulerFactionId || null };
        res = await apiFetch(`/api/locations/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        const payload = { ...form, parentId: form.parentId || null, rulerFactionId: form.rulerFactionId || null };
        res = await apiFetch("/api/locations", {
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
    const res = await apiFetch(`/api/locations/${deleting.id}`, {
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

  const typeColors: Record<string, "default" | "secondary" | "outline"> = {
    continent: "default",
    region: "secondary",
    city: "outline",
    building: "secondary",
    landmark: "default",
  };
  const columns: Column<Location>[] = [
    { key: "name", header: "Name", sortable: true },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (l) => (
        <Badge variant={typeColors[l.type] || "default"}>{l.type}</Badge>
      ),
    },
    { key: "parent", header: "Parent", render: (l) => l.parent?.name || "—" },
    { key: "rulerFaction", header: "Ruler", render: (l) => l.rulerFaction?.name || "—" },
    { key: "climate", header: "Climate", render: (l) => l.climate || "—" },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader title="Locations" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Places in your world"
        actionLabel="Add Location"
        onAction={openCreate}
      />
      <DataTable
        data={locations}
        columns={columns}
        onRowClick={(l) => router.push(`/locations/${l.id}`)}
        actions={(l) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/locations/${l.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(l)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(l);
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
            {editing ? (activeTimeline ? `Edit Location (Timeline: ${activeTimeline.title})` : "Edit Location") : "New Location"}
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
            label="Type"
            name="type"
            type="select"
            value={form.type}
            onChange={onChange}
            options={[
              { value: "continent", label: "Continent" },
              { value: "region", label: "Region" },
              { value: "city", label: "City" },
              { value: "building", label: "Building" },
              { value: "landmark", label: "Landmark" },
            ]}
          />
          <FormField
            label="Parent Location"
            name="parentId"
            type="select"
            value={form.parentId}
            onChange={onChange}
            options={[
              { value: "", label: "None" },
              ...locations
                .filter((l) => l.id !== editing?.id)
                .map((l) => ({ value: l.id, label: l.name })),
            ]}
          />
          <FormField
            label="Climate"
            name="climate"
            value={form.climate}
            onChange={onChange}
          />
          <FormField
            label="Description"
            name="description"
            type="richtext"
            value={form.description}
            onChange={onChange}
          />
          <FormField
            label="Culture"
            name="culture"
            type="richtext"
            value={form.culture}
            onChange={onChange}
          />
          <FormField
            label="Territorial Ruler"
            name="rulerFactionId"
            type="select"
            value={form.rulerFactionId}
            onChange={onChange}
            options={[
              { value: "", label: "None" },
              ...factions.map((f) => ({ value: f.id, label: f.name })),
            ]}
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
        title="Delete Location"
        description={`Delete "${deleting?.name}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
