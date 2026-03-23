"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/layout";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Plus, Trash2, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { useTimeline } from "@/lib/contexts/timeline-context";

export default function FactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();
  const [faction, setFaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allMotivations, setAllMotivations] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ motivationId: "", priority: 1, notes: "" });

  const timelineParam = activeTimeline ? `?timelineId=${activeTimeline.id}` : "";
  const fetchFaction = () =>
    apiFetch(`/api/factions/${id}${timelineParam}`)
      .then((r) => r.json())
      .then(setFaction);

  useEffect(() => {
    Promise.all([
      fetchFaction(),
      apiFetch("/api/motivations").then((r) => r.json()).then(setAllMotivations),
    ]).finally(() => setLoading(false));
  }, [id, activeTimeline?.id]);

  const handleAdd = async () => {
    let res: Response;
    if (activeTimeline) {
      res = await apiFetch(`/api/timeline/${activeTimeline.id}/faction-motivations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, factionId: id }),
      });
    } else {
      res = await apiFetch(`/api/factions/${id}/motivations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    if (res.ok) {
      addToast({ title: `Motivation added${activeTimeline ? " (timeline)" : ""}` });
      setAdding(false);
      fetchFaction();
    } else {
      const data = await res.json();
      addToast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const handleRemove = async (motivationId: string) => {
    let res: Response;
    if (activeTimeline) {
      res = await apiFetch(`/api/timeline/${activeTimeline.id}/faction-motivations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ factionId: id, motivationId }),
      });
    } else {
      res = await apiFetch(`/api/factions/${id}/motivations`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivationId }),
      });
    }
    if (res.ok) {
      addToast({ title: `Motivation removed${activeTimeline ? " (timeline)" : ""}` });
      fetchFaction();
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!faction) return <p>Faction not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{faction.name}</h1>
          {faction.status && (
            <Badge variant={faction.status === "Disbanded" ? "destructive" : faction.status === "Active" ? "default" : "secondary"} className="mt-1">
              {faction.status === "Other" && faction.customStatus ? faction.customStatus : faction.status}
            </Badge>
          )}
        </div>
      </div>

      {activeTimeline && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Viewing at timeline: {activeTimeline.title}</span>
            {activeTimeline.era && <Badge variant="outline" className="text-xs">{activeTimeline.era}</Badge>}
          </CardContent>
        </Card>
      )}

      {faction.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <RichTextDisplay content={faction.description} />
          </CardContent>
        </Card>
      )}

      {faction.ruledLocations?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Territories</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faction.ruledLocations.map((loc: any) => (
                <div key={loc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{loc.name}</p>
                  <Badge variant="outline">{loc.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {faction.characters?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Members</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {faction.characters.map((cf: any) => (
                <div key={cf.characterId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{cf.character.name}</p>
                    {cf.role && <p className="text-xs text-muted-foreground">{cf.role}</p>}
                  </div>
                  <Badge variant="outline">{cf.character.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Motivations</CardTitle>
          {!adding && (
            <Button variant="outline" size="sm" onClick={() => { setForm({ motivationId: "", priority: 1, notes: "" }); setAdding(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Motivation
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {adding && (
            <div className="border rounded-md p-4 mb-4 space-y-3">
              <div className="space-y-2">
                <Label>Motivation</Label>
                <Select
                  value={form.motivationId}
                  onChange={(e) => setForm({ ...form, motivationId: e.target.value })}
                  options={[
                    { value: "", label: "Select a motivation..." },
                    ...allMotivations
                      .filter((m) => !faction.motivations?.some((fm: any) => fm.motivationId === m.id))
                      .map((m) => ({ value: m.id, label: m.name })),
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority (1-10)</Label>
                <Input type="number" min={1} max={10} value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                <Button size="sm" disabled={!form.motivationId} onClick={handleAdd}>Add</Button>
              </div>
            </div>
          )}
          {faction.motivations?.length > 0 ? (
            <div className="space-y-3">
              {faction.motivations.map((fm: any) => (
                <div key={fm.motivationId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{fm.motivation.name}</p>
                    <Badge variant="secondary" className="text-xs">{fm.motivation.category}</Badge>
                    {fm.notes && <p className="text-xs text-muted-foreground mt-1">{fm.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Priority: {fm.priority}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemove(fm.motivationId)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !adding && <p className="text-sm text-muted-foreground">No motivations assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
