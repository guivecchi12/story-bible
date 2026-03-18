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

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  inWorldDate?: string;
  era?: string;
  order: number;
  locationId?: string | null;
  location?: { name: string } | null;
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<TimelineEvent | null>(null);
  const [deleting, setDeleting] = useState<TimelineEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    inWorldDate: "",
    era: "",
    order: "0",
    locationId: "",
  });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchData = async () => {
    const [eRes, lRes] = await Promise.all([
      fetch("/api/timeline"),
      fetch("/api/locations"),
    ]);
    if (eRes.ok) setEvents(await eRes.json());
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
      inWorldDate: "",
      era: "",
      order: "0",
      locationId: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (e: TimelineEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description || "",
      inWorldDate: e.inWorldDate || "",
      era: e.era || "",
      order: String(e.order),
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
        ? await fetch(`/api/timeline/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/timeline", {
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
    const res = await fetch(`/api/timeline/${deleting.id}`, {
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

  const columns: Column<TimelineEvent>[] = [
    { key: "order", header: "#", sortable: true },
    { key: "title", header: "Title", sortable: true },
    {
      key: "era",
      header: "Era",
      sortable: true,
      render: (e) => (e.era ? <Badge variant="outline">{e.era}</Badge> : "—"),
    },
    {
      key: "inWorldDate",
      header: "In-World Date",
      render: (e) => e.inWorldDate || "—",
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
        <PageHeader title="Timeline" />
        <TableSkeleton />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Timeline"
        subtitle="Chronological events in your world"
        actionLabel="Add Event"
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
            {editing ? "Edit Timeline Event" : "New Timeline Event"}
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
            label="Era"
            name="era"
            value={form.era}
            onChange={onChange}
            placeholder="e.g. First Age, Modern Era"
          />
          <FormField
            label="In-World Date"
            name="inWorldDate"
            value={form.inWorldDate}
            onChange={onChange}
            placeholder="e.g. Year 342, Day of Reckoning"
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
        title="Delete Timeline Event"
        description={`Delete "${deleting?.title}"?`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
