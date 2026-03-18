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

interface Location {
  id: string;
  name: string;
  type: string;
  description?: string;
  climate?: string;
  culture?: string;
  parentId?: string | null;
  parent?: { name: string } | null;
  children?: any[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
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
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    const res = await fetch("/api/locations");
    if (res.ok) setLocations(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      type: "city",
      description: "",
      climate: "",
      culture: "",
      parentId: "",
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
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, parentId: form.parentId || null };
      const res = editing
        ? await fetch(`/api/locations/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/locations", {
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
    const res = await fetch(`/api/locations/${deleting.id}`, {
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
        actions={(l) => (
          <div className="flex gap-1">
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
            {editing ? "Edit Location" : "New Location"}
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
            type="textarea"
            value={form.description}
            onChange={onChange}
          />
          <FormField
            label="Culture"
            name="culture"
            type="textarea"
            value={form.culture}
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
        title="Delete Location"
        description={`Delete "${deleting?.name}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
