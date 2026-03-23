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

function AddRelationForm({
  onCancel,
  onSubmit,
  children,
  disabled,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="border rounded-md p-4 mb-4 space-y-3">
      {children}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" disabled={disabled} onClick={onSubmit}>
          Add
        </Button>
      </div>
    </div>
  );
}

function RelationCard({
  title,
  adding,
  onAdd,
  addForm,
  items,
  emptyText,
}: {
  title: string;
  adding: boolean;
  onAdd: () => void;
  addForm: React.ReactNode;
  items: React.ReactNode;
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        {!adding && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add {title.slice(0, -1)}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {adding && addForm}
        {items || (
          !adding && (
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          )
        )}
      </CardContent>
    </Card>
  );
}

export default function CharacterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [allFactions, setAllFactions] = useState<any[]>([]);
  const [allPowers, setAllPowers] = useState<any[]>([]);
  const [allMotivations, setAllMotivations] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);

  const [addingFaction, setAddingFaction] = useState(false);
  const [addingPower, setAddingPower] = useState(false);
  const [addingMotivation, setAddingMotivation] = useState(false);
  const [addingLocation, setAddingLocation] = useState(false);
  const [addingItem, setAddingItem] = useState(false);

  const [factionForm, setFactionForm] = useState({ factionId: "", role: "" });
  const [powerForm, setPowerForm] = useState({ powerId: "", strengthLevel: 5, isPrimary: false, notes: "" });
  const [motivationForm, setMotivationForm] = useState({ motivationId: "", priority: 1, personalNotes: "" });
  const [locationForm, setLocationForm] = useState({ locationId: "", role: "" });
  const [itemForm, setItemForm] = useState({ itemId: "", status: "owned", acquiredAt: "" });

  const timelineParam = activeTimeline ? `?timelineId=${activeTimeline.id}` : "";
  const fetchCharacter = () =>
    apiFetch(`/api/characters/${id}${timelineParam}`)
      .then((r) => r.json())
      .then(setCharacter);

  useEffect(() => {
    Promise.all([
      fetchCharacter(),
      apiFetch("/api/factions").then((r) => r.json()).then(setAllFactions),
      apiFetch("/api/powers").then((r) => r.json()).then(setAllPowers),
      apiFetch("/api/motivations").then((r) => r.json()).then(setAllMotivations),
      apiFetch("/api/locations").then((r) => r.json()).then(setAllLocations),
      apiFetch("/api/items").then((r) => r.json()).then(setAllItems),
    ]).finally(() => setLoading(false));
  }, [id, activeTimeline?.id]);

  // Map character relation endpoints to timeline endpoints
  const timelineEndpointMap: Record<string, string> = {
    factions: "character-factions",
    powers: "character-powers",
    motivations: "character-motivations",
    locations: "character-locations",
    items: "character-items",
  };

  const addRelation = async (endpoint: string, body: any, label: string, close: () => void) => {
    let res: Response;
    if (activeTimeline && timelineEndpointMap[endpoint]) {
      // Route to timeline endpoint, add characterId
      res = await apiFetch(`/api/timeline/${activeTimeline.id}/${timelineEndpointMap[endpoint]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, characterId: id }),
      });
    } else {
      res = await apiFetch(`/api/characters/${id}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    if (res.ok) {
      addToast({ title: `${label} added${activeTimeline ? " (timeline)" : ""}` });
      close();
      fetchCharacter();
    } else {
      const data = await res.json();
      addToast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const removeRelation = async (endpoint: string, body: any, label: string) => {
    let res: Response;
    if (activeTimeline && timelineEndpointMap[endpoint]) {
      res = await apiFetch(`/api/timeline/${activeTimeline.id}/${timelineEndpointMap[endpoint]}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, characterId: id }),
      });
    } else {
      res = await apiFetch(`/api/characters/${id}/${endpoint}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }
    if (res.ok) {
      addToast({ title: `${label} removed` });
      fetchCharacter();
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!character) return <p>Character not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{character.name}</h1>
          {character.nicknames?.length > 0 && (
            <p className="text-sm text-muted-foreground">
              aka {character.nicknames.join(", ")}
            </p>
          )}
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge>{character.type}</Badge>
            {character.status && (
              <Badge variant={character.status === "Dead" ? "destructive" : character.status === "Healthy" ? "default" : "secondary"}>
                {character.status === "Other" && character.customStatus ? character.customStatus : character.status}
              </Badge>
            )}
            {character.factions?.map((cf: any) => (
              <Badge key={cf.factionId} variant="outline">{cf.faction.name}{cf.role ? ` (${cf.role})` : ""}</Badge>
            ))}
          </div>
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

      {character.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <RichTextDisplay content={character.description} />
          </CardContent>
        </Card>
      )}

      {character.backstory && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Backstory</CardTitle></CardHeader>
          <CardContent>
            <RichTextDisplay content={character.backstory} />
          </CardContent>
        </Card>
      )}

      {/* Factions */}
      <RelationCard
        title="Factions"
        adding={addingFaction}
        onAdd={() => { setFactionForm({ factionId: "", role: "" }); setAddingFaction(true); }}
        addForm={
          <AddRelationForm
            onCancel={() => setAddingFaction(false)}
            onSubmit={() => addRelation("factions", factionForm, "Faction", () => setAddingFaction(false))}
            disabled={!factionForm.factionId}
          >
            <div className="space-y-2">
              <Label>Faction</Label>
              <Select
                value={factionForm.factionId}
                onChange={(e) => setFactionForm({ ...factionForm, factionId: e.target.value })}
                options={[
                  { value: "", label: "Select a faction..." },
                  ...allFactions
                    .filter((f) => !character.factions?.some((cf: any) => cf.factionId === f.id))
                    .map((f) => ({ value: f.id, label: f.name })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={factionForm.role} onChange={(e) => setFactionForm({ ...factionForm, role: e.target.value })} placeholder="e.g. Leader, Member, Spy (optional)" />
            </div>
          </AddRelationForm>
        }
        items={
          character.factions?.length > 0 ? (
            <div className="space-y-3">
              {character.factions.map((cf: any) => (
                <div key={cf.factionId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{cf.faction.name}</p>
                    {cf.role && <p className="text-xs text-muted-foreground">{cf.role}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("factions", { factionId: cf.factionId }, "Faction")}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null
        }
        emptyText="No factions assigned yet."
      />

      {/* Powers */}
      <RelationCard
        title="Powers"
        adding={addingPower}
        onAdd={() => { setPowerForm({ powerId: "", strengthLevel: 5, isPrimary: false, notes: "" }); setAddingPower(true); }}
        addForm={
          <AddRelationForm
            onCancel={() => setAddingPower(false)}
            onSubmit={() => addRelation("powers", powerForm, "Power", () => setAddingPower(false))}
            disabled={!powerForm.powerId}
          >
            <div className="space-y-2">
              <Label>Power</Label>
              <Select
                value={powerForm.powerId}
                onChange={(e) => setPowerForm({ ...powerForm, powerId: e.target.value })}
                options={[
                  { value: "", label: "Select a power..." },
                  ...allPowers
                    .filter((p) => !character.powers?.some((cp: any) => cp.powerId === p.id))
                    .map((p) => ({ value: p.id, label: p.name })),
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Strength (1-10)</Label>
                <Input type="number" min={1} max={10} value={powerForm.strengthLevel} onChange={(e) => setPowerForm({ ...powerForm, strengthLevel: parseInt(e.target.value) || 5 })} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input type="checkbox" id="isPrimary" checked={powerForm.isPrimary} onChange={(e) => setPowerForm({ ...powerForm, isPrimary: e.target.checked })} className="h-4 w-4" />
                <Label htmlFor="isPrimary">Primary power</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input value={powerForm.notes} onChange={(e) => setPowerForm({ ...powerForm, notes: e.target.value })} placeholder="Optional notes..." />
            </div>
          </AddRelationForm>
        }
        items={
          character.powers?.length > 0 ? (
            <div className="space-y-3">
              {character.powers.map((cp: any) => (
                <div key={cp.powerId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">
                      {cp.power.name}
                      {cp.isPrimary && <Badge className="ml-2" variant="secondary">Primary</Badge>}
                    </p>
                    {cp.notes && <p className="text-xs text-muted-foreground">{cp.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Strength:</span>
                    <Badge variant="outline">{cp.strengthLevel}/10</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("powers", { powerId: cp.powerId }, "Power")}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null
        }
        emptyText="No powers assigned yet."
      />

      {/* Motivations */}
      <RelationCard
        title="Motivations"
        adding={addingMotivation}
        onAdd={() => { setMotivationForm({ motivationId: "", priority: 1, personalNotes: "" }); setAddingMotivation(true); }}
        addForm={
          <AddRelationForm
            onCancel={() => setAddingMotivation(false)}
            onSubmit={() => addRelation("motivations", motivationForm, "Motivation", () => setAddingMotivation(false))}
            disabled={!motivationForm.motivationId}
          >
            <div className="space-y-2">
              <Label>Motivation</Label>
              <Select
                value={motivationForm.motivationId}
                onChange={(e) => setMotivationForm({ ...motivationForm, motivationId: e.target.value })}
                options={[
                  { value: "", label: "Select a motivation..." },
                  ...allMotivations
                    .filter((m) => !character.motivations?.some((cm: any) => cm.motivationId === m.id))
                    .map((m) => ({ value: m.id, label: m.name })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority (1-10)</Label>
              <Input type="number" min={1} max={10} value={motivationForm.priority} onChange={(e) => setMotivationForm({ ...motivationForm, priority: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-2">
              <Label>Personal Notes</Label>
              <Input value={motivationForm.personalNotes} onChange={(e) => setMotivationForm({ ...motivationForm, personalNotes: e.target.value })} placeholder="Optional notes..." />
            </div>
          </AddRelationForm>
        }
        items={
          character.motivations?.length > 0 ? (
            <div className="space-y-3">
              {character.motivations.map((cm: any) => (
                <div key={cm.motivationId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{cm.motivation.name}</p>
                    <Badge variant="secondary" className="text-xs">{cm.motivation.category}</Badge>
                    {cm.personalNotes && <p className="text-xs text-muted-foreground mt-1">{cm.personalNotes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Priority: {cm.priority}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("motivations", { motivationId: cm.motivationId }, "Motivation")}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null
        }
        emptyText="No motivations assigned yet."
      />

      {/* Locations */}
      <RelationCard
        title="Locations"
        adding={addingLocation}
        onAdd={() => { setLocationForm({ locationId: "", role: "" }); setAddingLocation(true); }}
        addForm={
          <AddRelationForm
            onCancel={() => setAddingLocation(false)}
            onSubmit={() => addRelation("locations", locationForm, "Location", () => setAddingLocation(false))}
            disabled={!locationForm.locationId || !locationForm.role}
          >
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={locationForm.locationId}
                onChange={(e) => setLocationForm({ ...locationForm, locationId: e.target.value })}
                options={[
                  { value: "", label: "Select a location..." },
                  ...allLocations
                    .filter((l) => !character.locations?.some((cl: any) => cl.locationId === l.id))
                    .map((l) => ({ value: l.id, label: l.name })),
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={locationForm.role} onChange={(e) => setLocationForm({ ...locationForm, role: e.target.value })} placeholder="e.g. Resident, Visitor, Ruler" />
            </div>
          </AddRelationForm>
        }
        items={
          character.locations?.length > 0 ? (
            <div className="space-y-3">
              {character.locations.map((cl: any) => (
                <div key={cl.locationId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{cl.location.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{cl.role}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("locations", { locationId: cl.locationId }, "Location")}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null
        }
        emptyText="No locations assigned yet."
      />

      {/* Items */}
      <RelationCard
        title="Items"
        adding={addingItem}
        onAdd={() => { setItemForm({ itemId: "", status: "owned", acquiredAt: "" }); setAddingItem(true); }}
        addForm={
          <AddRelationForm
            onCancel={() => setAddingItem(false)}
            onSubmit={() => addRelation("items", { ...itemForm, acquiredAt: itemForm.acquiredAt || undefined }, "Item", () => setAddingItem(false))}
            disabled={!itemForm.itemId}
          >
            <div className="space-y-2">
              <Label>Item</Label>
              <Select
                value={itemForm.itemId}
                onChange={(e) => setItemForm({ ...itemForm, itemId: e.target.value })}
                options={[
                  { value: "", label: "Select an item..." },
                  ...allItems
                    .filter((i) => !character.items?.some((ci: any) => ci.itemId === i.id))
                    .map((i) => ({ value: i.id, label: i.name })),
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={itemForm.status}
                  onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                  options={[
                    { value: "owned", label: "Owned" },
                    { value: "lost", label: "Lost" },
                    { value: "destroyed", label: "Destroyed" },
                    { value: "given away", label: "Given Away" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label>Acquired At</Label>
                <Input value={itemForm.acquiredAt} onChange={(e) => setItemForm({ ...itemForm, acquiredAt: e.target.value })} placeholder="e.g. Chapter 3" />
              </div>
            </div>
          </AddRelationForm>
        }
        items={
          character.items?.length > 0 ? (
            <div className="space-y-3">
              {character.items.map((ci: any) => (
                <div key={ci.itemId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{ci.item.name}</p>
                    {ci.acquiredAt && <p className="text-xs text-muted-foreground">Acquired: {ci.acquiredAt}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ci.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRelation("items", { itemId: ci.itemId }, "Item")}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null
        }
        emptyText="No items assigned yet."
      />
    </div>
  );
}
