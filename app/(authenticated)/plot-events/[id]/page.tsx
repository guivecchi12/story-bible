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

export default function PlotEventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allCharacters, setAllCharacters] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [addingCharacter, setAddingCharacter] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [charForm, setCharForm] = useState({ characterId: "", role: "" });
  const [itemForm, setItemForm] = useState({ itemId: "", role: "" });

  const fetchEvent = () =>
    apiFetch(`/api/plot-events/${id}`)
      .then((r) => r.json())
      .then(setEvent);

  useEffect(() => {
    Promise.all([
      fetchEvent(),
      apiFetch("/api/characters").then((r) => r.json()).then(setAllCharacters),
      apiFetch("/api/items").then((r) => r.json()).then(setAllItems),
    ]).finally(() => setLoading(false));
  }, [id]);

  const addRelation = async (endpoint: string, body: any, label: string, close: () => void) => {
    const res = await apiFetch(`/api/plot-events/${id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      addToast({ title: `${label} added` });
      close();
      fetchEvent();
    } else {
      const data = await res.json();
      addToast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const removeRelation = async (endpoint: string, body: any, label: string) => {
    const res = await apiFetch(`/api/plot-events/${id}/${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      addToast({ title: `${label} removed` });
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
  if (!event) return <p>Plot event not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex gap-2 mt-1">
            {event.storyArc && <Badge>{event.storyArc.title}</Badge>}
            {event.location && <Badge variant="outline">{event.location.name}</Badge>}
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

      {event.consequence && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Consequence</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{event.consequence}</p>
          </CardContent>
        </Card>
      )}

      {/* Characters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Characters</CardTitle>
          {!addingCharacter && (
            <Button variant="outline" size="sm" onClick={() => { setCharForm({ characterId: "", role: "" }); setAddingCharacter(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Character
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {addingCharacter && (
            <div className="border rounded-md p-4 mb-4 space-y-3">
              <div className="space-y-2">
                <Label>Character</Label>
                <Select
                  value={charForm.characterId}
                  onChange={(e) => setCharForm({ ...charForm, characterId: e.target.value })}
                  options={[
                    { value: "", label: "Select a character..." },
                    ...allCharacters
                      .filter((c) => !event.characters?.some((ec: any) => ec.characterId === c.id))
                      .map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={charForm.role} onChange={(e) => setCharForm({ ...charForm, role: e.target.value })} placeholder="e.g. Protagonist, Antagonist, Witness" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddingCharacter(false)}>Cancel</Button>
                <Button size="sm" disabled={!charForm.characterId || !charForm.role} onClick={() => addRelation("characters", charForm, "Character", () => setAddingCharacter(false))}>Add</Button>
              </div>
            </div>
          )}
          {event.characters?.length > 0 ? (
            <div className="space-y-3">
              {event.characters.map((ec: any) => (
                <div key={ec.characterId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{ec.character.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ec.role}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("characters", { characterId: ec.characterId }, "Character")}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !addingCharacter && <p className="text-sm text-muted-foreground">No characters assigned yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Items</CardTitle>
          {!addingItem && (
            <Button variant="outline" size="sm" onClick={() => { setItemForm({ itemId: "", role: "" }); setAddingItem(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {addingItem && (
            <div className="border rounded-md p-4 mb-4 space-y-3">
              <div className="space-y-2">
                <Label>Item</Label>
                <Select
                  value={itemForm.itemId}
                  onChange={(e) => setItemForm({ ...itemForm, itemId: e.target.value })}
                  options={[
                    { value: "", label: "Select an item..." },
                    ...allItems
                      .filter((i) => !event.items?.some((ei: any) => ei.itemId === i.id))
                      .map((i) => ({ value: i.id, label: i.name })),
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={itemForm.role} onChange={(e) => setItemForm({ ...itemForm, role: e.target.value })} placeholder="e.g. Weapon, Key, MacGuffin" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddingItem(false)}>Cancel</Button>
                <Button size="sm" disabled={!itemForm.itemId || !itemForm.role} onClick={() => addRelation("items", itemForm, "Item", () => setAddingItem(false))}>Add</Button>
              </div>
            </div>
          )}
          {event.items?.length > 0 ? (
            <div className="space-y-3">
              {event.items.map((ei: any) => (
                <div key={ei.itemId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{ei.item.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ei.role}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("items", { itemId: ei.itemId }, "Item")}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !addingItem && <p className="text-sm text-muted-foreground">No items assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
