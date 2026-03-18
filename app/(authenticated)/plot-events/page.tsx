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

interface PlotEvent {
  id: string;
  title: string;
  description?: string;
  consequence?: string;
  order: number;
  storyArcId: string;
  locationId?: string | null;
  storyArc?: { title: string };
  location?: { name: string } | null;
}

export default function PlotEventsPage() {
  const [events, setEvents] = useState<PlotEvent[]>([]);
  const [storyArcs, setStoryArcs] = useState<{ id: string; title: string }[]>(
    [],
  );
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<PlotEvent | null>(null);
  const [deleting, setDeleting] = useState<PlotEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    consequence: "",
    order: "0",
    storyArcId: "",
    locationId: "",
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    const [eRes, aRes, lRes] = await Promise.all([
      apiFetch("/api/plot-events"),
      apiFetch("/api/story-arcs"),
      apiFetch("/api/locations"),
    ]);
    if (eRes.ok) setEvents(await eRes.json());
    if (aRes.ok) setStoryArcs(await aRes.json());
    if (lRes.ok) setLocations(await lRes.json());
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
      consequence: "",
      order: "0",
      storyArcId: storyArcs[0]?.id || "",
      locationId: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (e: PlotEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description || "",
      consequence: e.consequence || "",
      order: String(e.order),
      storyArcId: e.storyArcId,
      locationId: e.locationId || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        order: parseInt(form.order) || 0,
        locationId: form.locationId || null,
      };
      const res = editing
        ? await apiFetch(`/api/plot-events/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/plot-events", {
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
    const res = await apiFetch(`/api/plot-events/${deleting.id}`, {
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

  const columns: Column<PlotEvent>[] = [
    { key: "order", header: "#", sortable: true },
    { key: "title", header: "Title", sortable: true },
    {
      key: "storyArc",
      header: "Story Arc",
      render: (e) => e.storyArc?.title || "—",
    },
    {
      key: "location",
      header: "Location",
      render: (e) => e.location?.name || "—",
    },
  ];

  if (loading)
    return (
      <div className="space-y-4">
        <PageHeader title="Plot Events" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Plot Events"
        subtitle="Key events in your story"
        actionLabel="Add Plot Event"
        onAction={openCreate}
      />
      <DataTable
        data={events}
        columns={columns}
        actions={(e) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(e)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(e);
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
            {editing ? "Edit Plot Event" : "New Plot Event"}
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
            label="Order"
            name="order"
            type="number"
            value={form.order}
            onChange={onChange}
          />
          <FormField
            label="Story Arc"
            name="storyArcId"
            type="select"
            value={form.storyArcId}
            onChange={onChange}
            required
            options={storyArcs.map((a) => ({ value: a.id, label: a.title }))}
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
            type="textarea"
            value={form.description}
            onChange={onChange}
          />
          <FormField
            label="Consequence"
            name="consequence"
            type="textarea"
            value={form.consequence}
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
        title="Delete Plot Event"
        description={`Delete "${deleting?.title}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
