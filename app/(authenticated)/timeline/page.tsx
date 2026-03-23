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

interface Timeline {
  id: string;
  title: string;
  description?: string;
  inWorldDate?: string;
  era?: string;
  order: number;
  plotEventId: string;
  locationId?: string | null;
  location?: { name: string } | null;
  plotEvent?: { title: string; storyArc?: { title: string } };
}

export default function TimelinePage() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [plotEvents, setPlotEvents] = useState<{ id: string; title: string; storyArc?: { title: string } }[]>([]);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Timeline | null>(null);
  const [deleting, setDeleting] = useState<Timeline | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    inWorldDate: "",
    era: "",
    order: "0",
    plotEventId: "",
    locationId: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();
  const { refreshTimelines } = useTimeline();

  const fetchData = async () => {
    const [tRes, peRes, lRes] = await Promise.all([
      apiFetch("/api/timeline"),
      apiFetch("/api/plot-events"),
      apiFetch("/api/locations"),
    ]);
    if (tRes.ok) setTimelines(await tRes.json());
    if (peRes.ok) setPlotEvents(await peRes.json());
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
      plotEventId: plotEvents[0]?.id || "",
      locationId: "",
    });
    setDialogOpen(true);
  };
  const openEdit = (t: Timeline) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description || "",
      inWorldDate: t.inWorldDate || "",
      era: t.era || "",
      order: String(t.order),
      plotEventId: t.plotEventId,
      locationId: t.locationId || "",
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
        ? await apiFetch(`/api/timeline/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/timeline", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      if (res.ok) {
        addToast({ title: editing ? "Updated" : "Created" });
        setDialogOpen(false);
        fetchData();
        refreshTimelines();
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
    const res = await apiFetch(`/api/timeline/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      addToast({ title: "Deleted" });
      setDeleteOpen(false);
      fetchData();
      refreshTimelines();
    }
    setSaving(false);
  };
  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const columns: Column<Timeline>[] = [
    { key: "order", header: "#", sortable: true },
    { key: "title", header: "Title", sortable: true },
    {
      key: "plotEvent",
      header: "Plot Event",
      render: (t) => t.plotEvent?.title || "—",
    },
    {
      key: "storyArc",
      header: "Story Arc",
      render: (t) =>
        t.plotEvent?.storyArc?.title ? (
          <Badge variant="outline">{t.plotEvent.storyArc.title}</Badge>
        ) : (
          "—"
        ),
    },
    {
      key: "era",
      header: "Era",
      sortable: true,
      render: (t) => (t.era ? <Badge variant="outline">{t.era}</Badge> : "—"),
    },
    {
      key: "inWorldDate",
      header: "In-World Date",
      render: (t) => t.inWorldDate || "—",
    },
    {
      key: "location",
      header: "Location",
      render: (t) => t.location?.name || "—",
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
        subtitle="Track the state of your world across story events"
        actionLabel="Add Timeline"
        onAction={openCreate}
      />
      <DataTable
        data={timelines}
        columns={columns}
        onRowClick={(t) => router.push(`/timeline/${t.id}`)}
        actions={(t) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/timeline/${t.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setDeleting(t);
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
            {editing ? "Edit Timeline" : "New Timeline"}
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
            label="Plot Event"
            name="plotEventId"
            type="select"
            value={form.plotEventId}
            onChange={onChange}
            required
            options={plotEvents.map((pe) => ({
              value: pe.id,
              label: `${pe.title}${pe.storyArc ? ` (${pe.storyArc.title})` : ""}`,
            }))}
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
        title="Delete Timeline"
        description={`Delete "${deleting?.title}"? All state snapshots will be lost.`}
        onConfirm={handleDelete}
        loading={saving}
      />
    </div>
  );
}
