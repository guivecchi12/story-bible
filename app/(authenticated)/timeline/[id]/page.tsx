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
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function TimelineEventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allCharacters, setAllCharacters] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ characterId: "", notes: "" });

  const fetchEvent = () =>
    apiFetch(`/api/timeline/${id}`)
      .then((r) => r.json())
      .then(setEvent);

  useEffect(() => {
    Promise.all([
      fetchEvent(),
      apiFetch("/api/characters").then((r) => r.json()).then(setAllCharacters),
    ]).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    const res = await apiFetch(`/api/timeline/${id}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      addToast({ title: "Character added" });
      setAdding(false);
      fetchEvent();
    } else {
      const data = await res.json();
      addToast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const handleRemove = async (characterId: string) => {
    const res = await apiFetch(`/api/timeline/${id}/characters`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId }),
    });
    if (res.ok) {
      addToast({ title: "Character removed" });
      fetchEvent();
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!event) return <p>Timeline event not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex gap-2 mt-1">
            {event.era && <Badge>{event.era}</Badge>}
            {event.inWorldDate && <Badge variant="outline">{event.inWorldDate}</Badge>}
            {event.location && <Badge variant="secondary">{event.location.name}</Badge>}
            <Badge variant="secondary">Order: {event.order}</Badge>
          </div>
        </div>
      </div>

      {event.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {event.plotEvents?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Linked Plot Events</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.plotEvents.map((pe: any) => (
                <div key={pe.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{pe.title}</p>
                  {pe.storyArc && <Badge variant="outline">{pe.storyArc.title}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Characters</CardTitle>
          {!adding && (
            <Button variant="outline" size="sm" onClick={() => { setForm({ characterId: "", notes: "" }); setAdding(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Character
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {adding && (
            <div className="border rounded-md p-4 mb-4 space-y-3">
              <div className="space-y-2">
                <Label>Character</Label>
                <Select
                  value={form.characterId}
                  onChange={(e) => setForm({ ...form, characterId: e.target.value })}
                  options={[
                    { value: "", label: "Select a character..." },
                    ...allCharacters
                      .filter((c) => !event.characters?.some((ec: any) => ec.characterId === c.id))
                      .map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                <Button size="sm" disabled={!form.characterId} onClick={handleAdd}>Add</Button>
              </div>
            </div>
          )}
          {event.characters?.length > 0 ? (
            <div className="space-y-3">
              {event.characters.map((ec: any) => (
                <div key={ec.characterId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{ec.character.name}</p>
                    {ec.notes && <p className="text-xs text-muted-foreground">{ec.notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemove(ec.characterId)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            !adding && <p className="text-sm text-muted-foreground">No characters assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
