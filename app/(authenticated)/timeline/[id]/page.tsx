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
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";

const CHARACTER_STATUSES = ["Healthy", "Injured", "Gravely Injured", "Dead", "Other"];
const ITEM_STATUSES = ["Active", "Lost", "Broken", "Destroyed", "Hidden", "Other"];
const FACTION_STATUSES = ["Active", "Disbanded", "At War", "Allied", "Dormant", "Other"];
const LOCATION_STATUSES = ["Intact", "Damaged", "Destroyed", "Occupied", "Abandoned", "Other"];

function StatusBadge({ status, customStatus }: { status: string | null; customStatus?: string | null }) {
  if (!status) return null;
  const label = status === "Other" && customStatus ? customStatus : status;
  const variant =
    status === "Dead" || status === "Destroyed" || status === "Disbanded"
      ? "destructive"
      : status === "Healthy" || status === "Active" || status === "Intact" || status === "Allied"
        ? "default"
        : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}

const emptyCharForm = { characterId: "", name: "", nicknames: "", nicknamesOverridden: false, type: "", description: "", backstory: "", status: "", customStatus: "", notes: "" };
const emptyItemForm = { itemId: "", name: "", aliases: "", aliasesOverridden: false, type: "", description: "", lore: "", properties: "", status: "", customStatus: "", holderId: "", locationId: "", notes: "" };
const emptyFactionForm = { factionId: "", name: "", status: "", customStatus: "", description: "", notes: "" };
const emptyLocationForm = { locationId: "", name: "", type: "", climate: "", culture: "", status: "", customStatus: "", description: "", notes: "", rulerFactionId: "" };

export default function TimelineDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"characters" | "items" | "factions" | "locations">("characters");

  const [allCharacters, setAllCharacters] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [allFactions, setAllFactions] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<any[]>([]);

  // Form mode: null = closed, "add" = adding new, characterId/itemId/etc = editing that entry
  const [charFormMode, setCharFormMode] = useState<string | null>(null);
  const [itemFormMode, setItemFormMode] = useState<string | null>(null);
  const [factionFormMode, setFactionFormMode] = useState<string | null>(null);
  const [locationFormMode, setLocationFormMode] = useState<string | null>(null);

  const [charForm, setCharForm] = useState(emptyCharForm);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [factionForm, setFactionForm] = useState(emptyFactionForm);
  const [locationForm, setLocationForm] = useState(emptyLocationForm);

  const fetchTimeline = () =>
    apiFetch(`/api/timeline/${id}`)
      .then((r) => r.json())
      .then(setTimeline);

  useEffect(() => {
    Promise.all([
      fetchTimeline(),
      apiFetch("/api/characters").then((r) => r.json()).then(setAllCharacters),
      apiFetch("/api/items").then((r) => r.json()).then(setAllItems),
      apiFetch("/api/factions").then((r) => r.json()).then(setAllFactions),
      apiFetch("/api/locations").then((r) => r.json()).then(setAllLocations),
    ]).finally(() => setLoading(false));
  }, [id]);

  const saveState = async (endpoint: string, body: any, label: string, close: () => void) => {
    const cleaned: any = {};
    for (const [k, v] of Object.entries(body)) {
      if (k === "nicknames" && typeof v === "string") {
        cleaned.nicknames = v ? v.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        cleaned.nicknamesOverridden = v !== "";
      } else if (k === "aliases" && typeof v === "string") {
        cleaned.aliases = v ? v.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        cleaned.aliasesOverridden = v !== "";
      } else if (k === "nicknamesOverridden" || k === "aliasesOverridden") {
        // handled above
      } else {
        cleaned[k] = v === "" ? null : v;
      }
    }
    const res = await apiFetch(`/api/timeline/${id}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleaned),
    });
    if (res.ok) {
      addToast({ title: `${label} state saved` });
      close();
      fetchTimeline();
    } else {
      const data = await res.json();
      addToast({ title: "Error", description: JSON.stringify(data.error), variant: "destructive" });
    }
  };

  const removeState = async (endpoint: string, body: any, label: string) => {
    const res = await apiFetch(`/api/timeline/${id}/${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      addToast({ title: `${label} state removed` });
      fetchTimeline();
    }
  };

  // Edit helpers: populate form from existing state
  const editCharacter = (cs: any) => {
    setCharForm({
      characterId: cs.characterId,
      name: cs.name || "",
      nicknames: cs.nicknamesOverridden ? (cs.nicknames || []).join(", ") : "",
      nicknamesOverridden: cs.nicknamesOverridden || false,
      type: cs.type || "",
      description: cs.description || "",
      backstory: cs.backstory || "",
      status: cs.status || "",
      customStatus: cs.customStatus || "",
      notes: cs.notes || "",
    });
    setCharFormMode(cs.characterId);
  };

  const editItem = (is: any) => {
    setItemForm({
      itemId: is.itemId,
      name: is.name || "",
      aliases: is.aliasesOverridden ? (is.aliases || []).join(", ") : "",
      aliasesOverridden: is.aliasesOverridden || false,
      type: is.type || "",
      description: is.description || "",
      lore: is.lore || "",
      properties: is.properties || "",
      status: is.status || "",
      customStatus: is.customStatus || "",
      holderId: is.holderId || "",
      locationId: is.locationId || "",
      notes: is.notes || "",
    });
    setItemFormMode(is.itemId);
  };

  const editFaction = (fs: any) => {
    setFactionForm({
      factionId: fs.factionId,
      name: fs.name || "",
      status: fs.status || "",
      customStatus: fs.customStatus || "",
      description: fs.description || "",
      notes: fs.notes || "",
    });
    setFactionFormMode(fs.factionId);
  };

  const editLocation = (ls: any) => {
    setLocationForm({
      locationId: ls.locationId,
      name: ls.name || "",
      type: ls.type || "",
      climate: ls.climate || "",
      culture: ls.culture || "",
      status: ls.status || "",
      customStatus: ls.customStatus || "",
      description: ls.description || "",
      notes: ls.notes || "",
      rulerFactionId: ls.rulerFactionId || "",
    });
    setLocationFormMode(ls.locationId);
  };

  if (loading)
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!timeline) return <p>Timeline not found.</p>;

  const tabs = [
    { key: "characters" as const, label: "Characters", count: timeline.characterStates?.length || 0 },
    { key: "items" as const, label: "Items", count: timeline.itemStates?.length || 0 },
    { key: "factions" as const, label: "Factions", count: timeline.factionStates?.length || 0 },
    { key: "locations" as const, label: "Locations", count: timeline.locationStates?.length || 0 },
  ];

  const isEditingChar = charFormMode && charFormMode !== "add";
  const isEditingItem = itemFormMode && itemFormMode !== "add";
  const isEditingFaction = factionFormMode && factionFormMode !== "add";
  const isEditingLocation = locationFormMode && locationFormMode !== "add";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{timeline.title}</h1>
          <div className="flex gap-2 mt-1 flex-wrap">
            {timeline.plotEvent && <Badge>{timeline.plotEvent.title}</Badge>}
            {timeline.plotEvent?.storyArc && <Badge variant="outline">{timeline.plotEvent.storyArc.title}</Badge>}
            {timeline.era && <Badge variant="secondary">{timeline.era}</Badge>}
            {timeline.inWorldDate && <Badge variant="secondary">{timeline.inWorldDate}</Badge>}
            {timeline.location && <Badge variant="secondary">{timeline.location.name}</Badge>}
            <Badge variant="secondary">Order: {timeline.order}</Badge>
          </div>
        </div>
      </div>

      {timeline.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{timeline.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      {/* ====== CHARACTERS TAB ====== */}
      {activeTab === "characters" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Character States</CardTitle>
            {!charFormMode && (
              <Button variant="outline" size="sm" onClick={() => { setCharForm({ ...emptyCharForm }); setCharFormMode("add"); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Character State
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {charFormMode && (
              <div className="border rounded-md p-4 mb-4 space-y-3">
                <p className="text-sm font-semibold">{isEditingChar ? "Edit Character State" : "Add Character State"}</p>
                {!isEditingChar && (
                  <div className="space-y-2">
                    <Label>Character</Label>
                    <Select
                      value={charForm.characterId}
                      onChange={(e) => setCharForm({ ...charForm, characterId: e.target.value })}
                      options={[
                        { value: "", label: "Select a character..." },
                        ...allCharacters
                          .filter((c) => !timeline.characterStates?.some((s: any) => s.characterId === c.id))
                          .map((c) => ({ value: c.id, label: c.name })),
                      ]}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Name Override</Label>
                  <Input value={charForm.name} onChange={(e) => setCharForm({ ...charForm, name: e.target.value })} placeholder="Leave empty to use base name" />
                </div>
                <div className="space-y-2">
                  <Label>Nicknames Override</Label>
                  <Input value={charForm.nicknames} onChange={(e) => setCharForm({ ...charForm, nicknames: e.target.value, nicknamesOverridden: e.target.value !== "" })} placeholder="Comma-separated (leave empty to use base)" />
                </div>
                <div className="space-y-2">
                  <Label>Type Override</Label>
                  <Select
                    value={charForm.type}
                    onChange={(e) => setCharForm({ ...charForm, type: e.target.value })}
                    options={[{ value: "", label: "Use base type" }, { value: "main", label: "Main" }, { value: "supporting", label: "Supporting" }]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={charForm.status}
                    onChange={(e) => setCharForm({ ...charForm, status: e.target.value })}
                    options={[{ value: "", label: "No status" }, ...CHARACTER_STATUSES.map((s) => ({ value: s, label: s }))]}
                  />
                </div>
                {charForm.status === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Status</Label>
                    <Input value={charForm.customStatus} onChange={(e) => setCharForm({ ...charForm, customStatus: e.target.value })} placeholder="Enter custom status..." />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Description Override</Label>
                  <Input value={charForm.description} onChange={(e) => setCharForm({ ...charForm, description: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Backstory Override</Label>
                  <Input value={charForm.backstory} onChange={(e) => setCharForm({ ...charForm, backstory: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={charForm.notes} onChange={(e) => setCharForm({ ...charForm, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setCharFormMode(null)}>Cancel</Button>
                  <Button size="sm" disabled={!charForm.characterId} onClick={() => saveState("characters", charForm, "Character", () => setCharFormMode(null))}>
                    {isEditingChar ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            )}
            {timeline.characterStates?.length > 0 ? (
              <div className="space-y-3">
                {timeline.characterStates.map((cs: any) => (
                  <div key={cs.characterId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{cs.name || cs.character.name}</p>
                        {cs.name && cs.name !== cs.character.name && <span className="text-xs text-muted-foreground">(base: {cs.character.name})</span>}
                        <StatusBadge status={cs.status} customStatus={cs.customStatus} />
                        {cs.type && <Badge variant="outline">{cs.type}</Badge>}
                      </div>
                      {cs.nicknamesOverridden && cs.nicknames?.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">aka {cs.nicknames.join(", ")}</p>}
                      {cs.description && <p className="text-xs text-muted-foreground mt-0.5">{cs.description}</p>}
                      {cs.backstory && <p className="text-xs text-muted-foreground">{cs.backstory.slice(0, 100)}{cs.backstory.length > 100 ? "..." : ""}</p>}
                      {cs.notes && <p className="text-xs text-muted-foreground italic">{cs.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editCharacter(cs)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeState("characters", { characterId: cs.characterId }, "Character")}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !charFormMode && <p className="text-sm text-muted-foreground">No character states set for this timeline.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== ITEMS TAB ====== */}
      {activeTab === "items" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Item States</CardTitle>
            {!itemFormMode && (
              <Button variant="outline" size="sm" onClick={() => { setItemForm({ ...emptyItemForm }); setItemFormMode("add"); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Item State
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {itemFormMode && (
              <div className="border rounded-md p-4 mb-4 space-y-3">
                <p className="text-sm font-semibold">{isEditingItem ? "Edit Item State" : "Add Item State"}</p>
                {!isEditingItem && (
                  <div className="space-y-2">
                    <Label>Item</Label>
                    <Select
                      value={itemForm.itemId}
                      onChange={(e) => setItemForm({ ...itemForm, itemId: e.target.value })}
                      options={[
                        { value: "", label: "Select an item..." },
                        ...allItems
                          .filter((i) => !timeline.itemStates?.some((s: any) => s.itemId === i.id))
                          .map((i) => ({ value: i.id, label: i.name })),
                      ]}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Name Override</Label>
                  <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Leave empty to use base name" />
                </div>
                <div className="space-y-2">
                  <Label>Aliases Override</Label>
                  <Input value={itemForm.aliases} onChange={(e) => setItemForm({ ...itemForm, aliases: e.target.value, aliasesOverridden: e.target.value !== "" })} placeholder="Comma-separated (leave empty to use base)" />
                </div>
                <div className="space-y-2">
                  <Label>Type Override</Label>
                  <Select
                    value={itemForm.type}
                    onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                    options={[{ value: "", label: "Use base type" }, { value: "weapon", label: "Weapon" }, { value: "artifact", label: "Artifact" }, { value: "relic", label: "Relic" }, { value: "tool", label: "Tool" }, { value: "symbol", label: "Symbol" }]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={itemForm.status}
                    onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                    options={[{ value: "", label: "No status" }, ...ITEM_STATUSES.map((s) => ({ value: s, label: s }))]}
                  />
                </div>
                {itemForm.status === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Status</Label>
                    <Input value={itemForm.customStatus} onChange={(e) => setItemForm({ ...itemForm, customStatus: e.target.value })} placeholder="Enter custom status..." />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Held By</Label>
                  <Select
                    value={itemForm.holderId}
                    onChange={(e) => setItemForm({ ...itemForm, holderId: e.target.value })}
                    options={[{ value: "", label: "No one" }, ...allCharacters.map((c) => ({ value: c.id, label: c.name }))]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={itemForm.locationId}
                    onChange={(e) => setItemForm({ ...itemForm, locationId: e.target.value })}
                    options={[{ value: "", label: "None" }, ...allLocations.map((l) => ({ value: l.id, label: l.name }))]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description Override</Label>
                  <Input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Lore Override</Label>
                  <Input value={itemForm.lore} onChange={(e) => setItemForm({ ...itemForm, lore: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Properties Override</Label>
                  <Input value={itemForm.properties} onChange={(e) => setItemForm({ ...itemForm, properties: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setItemFormMode(null)}>Cancel</Button>
                  <Button size="sm" disabled={!itemForm.itemId} onClick={() => saveState("items", itemForm, "Item", () => setItemFormMode(null))}>
                    {isEditingItem ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            )}
            {timeline.itemStates?.length > 0 ? (
              <div className="space-y-3">
                {timeline.itemStates.map((is: any) => (
                  <div key={is.itemId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{is.name || is.item.name}</p>
                        {is.name && is.name !== is.item.name && <span className="text-xs text-muted-foreground">(base: {is.item.name})</span>}
                        <StatusBadge status={is.status} customStatus={is.customStatus} />
                        {is.type && <Badge variant="outline">{is.type}</Badge>}
                      </div>
                      {is.aliasesOverridden && is.aliases?.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">aka {is.aliases.join(", ")}</p>}
                      {is.holder && <p className="text-xs text-muted-foreground">Held by: {is.holder.name}</p>}
                      {is.location && <p className="text-xs text-muted-foreground">At: {is.location.name}</p>}
                      {is.description && <p className="text-xs text-muted-foreground">{is.description}</p>}
                      {is.notes && <p className="text-xs text-muted-foreground italic">{is.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editItem(is)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeState("items", { itemId: is.itemId }, "Item")}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !itemFormMode && <p className="text-sm text-muted-foreground">No item states set for this timeline.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== FACTIONS TAB ====== */}
      {activeTab === "factions" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Faction States</CardTitle>
            {!factionFormMode && (
              <Button variant="outline" size="sm" onClick={() => { setFactionForm({ ...emptyFactionForm }); setFactionFormMode("add"); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Faction State
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {factionFormMode && (
              <div className="border rounded-md p-4 mb-4 space-y-3">
                <p className="text-sm font-semibold">{isEditingFaction ? "Edit Faction State" : "Add Faction State"}</p>
                {!isEditingFaction && (
                  <div className="space-y-2">
                    <Label>Faction</Label>
                    <Select
                      value={factionForm.factionId}
                      onChange={(e) => setFactionForm({ ...factionForm, factionId: e.target.value })}
                      options={[
                        { value: "", label: "Select a faction..." },
                        ...allFactions
                          .filter((f) => !timeline.factionStates?.some((s: any) => s.factionId === f.id))
                          .map((f) => ({ value: f.id, label: f.name })),
                      ]}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Name Override</Label>
                  <Input value={factionForm.name} onChange={(e) => setFactionForm({ ...factionForm, name: e.target.value })} placeholder="Leave empty to use base name" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={factionForm.status}
                    onChange={(e) => setFactionForm({ ...factionForm, status: e.target.value })}
                    options={[{ value: "", label: "No status" }, ...FACTION_STATUSES.map((s) => ({ value: s, label: s }))]}
                  />
                </div>
                {factionForm.status === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Status</Label>
                    <Input value={factionForm.customStatus} onChange={(e) => setFactionForm({ ...factionForm, customStatus: e.target.value })} placeholder="Enter custom status..." />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Description Override</Label>
                  <Input value={factionForm.description} onChange={(e) => setFactionForm({ ...factionForm, description: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={factionForm.notes} onChange={(e) => setFactionForm({ ...factionForm, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setFactionFormMode(null)}>Cancel</Button>
                  <Button size="sm" disabled={!factionForm.factionId} onClick={() => saveState("factions", factionForm, "Faction", () => setFactionFormMode(null))}>
                    {isEditingFaction ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            )}
            {timeline.factionStates?.length > 0 ? (
              <div className="space-y-3">
                {timeline.factionStates.map((fs: any) => (
                  <div key={fs.factionId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{fs.name || fs.faction.name}</p>
                        {fs.name && fs.name !== fs.faction.name && <span className="text-xs text-muted-foreground">(base: {fs.faction.name})</span>}
                        <StatusBadge status={fs.status} customStatus={fs.customStatus} />
                      </div>
                      {fs.description && <p className="text-xs text-muted-foreground mt-0.5">{fs.description}</p>}
                      {fs.notes && <p className="text-xs text-muted-foreground italic">{fs.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editFaction(fs)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeState("factions", { factionId: fs.factionId }, "Faction")}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !factionFormMode && <p className="text-sm text-muted-foreground">No faction states set for this timeline.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ====== LOCATIONS TAB ====== */}
      {activeTab === "locations" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Location States</CardTitle>
            {!locationFormMode && (
              <Button variant="outline" size="sm" onClick={() => { setLocationForm({ ...emptyLocationForm }); setLocationFormMode("add"); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Location State
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {locationFormMode && (
              <div className="border rounded-md p-4 mb-4 space-y-3">
                <p className="text-sm font-semibold">{isEditingLocation ? "Edit Location State" : "Add Location State"}</p>
                {!isEditingLocation && (
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Select
                      value={locationForm.locationId}
                      onChange={(e) => setLocationForm({ ...locationForm, locationId: e.target.value })}
                      options={[
                        { value: "", label: "Select a location..." },
                        ...allLocations
                          .filter((l) => !timeline.locationStates?.some((s: any) => s.locationId === l.id))
                          .map((l) => ({ value: l.id, label: l.name })),
                      ]}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Name Override</Label>
                  <Input value={locationForm.name} onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })} placeholder="Leave empty to use base name" />
                </div>
                <div className="space-y-2">
                  <Label>Type Override</Label>
                  <Input value={locationForm.type} onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value })} placeholder="Leave empty to use base type" />
                </div>
                <div className="space-y-2">
                  <Label>Climate Override</Label>
                  <Input value={locationForm.climate} onChange={(e) => setLocationForm({ ...locationForm, climate: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Culture Override</Label>
                  <Input value={locationForm.culture} onChange={(e) => setLocationForm({ ...locationForm, culture: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={locationForm.status}
                    onChange={(e) => setLocationForm({ ...locationForm, status: e.target.value })}
                    options={[{ value: "", label: "No status" }, ...LOCATION_STATUSES.map((s) => ({ value: s, label: s }))]}
                  />
                </div>
                {locationForm.status === "Other" && (
                  <div className="space-y-2">
                    <Label>Custom Status</Label>
                    <Input value={locationForm.customStatus} onChange={(e) => setLocationForm({ ...locationForm, customStatus: e.target.value })} placeholder="Enter custom status..." />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Ruler (Faction)</Label>
                  <Select
                    value={locationForm.rulerFactionId}
                    onChange={(e) => setLocationForm({ ...locationForm, rulerFactionId: e.target.value })}
                    options={[{ value: "", label: "None" }, ...allFactions.map((f) => ({ value: f.id, label: f.name }))]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description Override</Label>
                  <Input value={locationForm.description} onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })} placeholder="Leave empty to use base" />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={locationForm.notes} onChange={(e) => setLocationForm({ ...locationForm, notes: e.target.value })} placeholder="Optional notes..." />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setLocationFormMode(null)}>Cancel</Button>
                  <Button size="sm" disabled={!locationForm.locationId} onClick={() => saveState("locations", locationForm, "Location", () => setLocationFormMode(null))}>
                    {isEditingLocation ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            )}
            {timeline.locationStates?.length > 0 ? (
              <div className="space-y-3">
                {timeline.locationStates.map((ls: any) => (
                  <div key={ls.locationId} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{ls.name || ls.location.name}</p>
                        {ls.name && ls.name !== ls.location.name && <span className="text-xs text-muted-foreground">(base: {ls.location.name})</span>}
                        <StatusBadge status={ls.status} customStatus={ls.customStatus} />
                        {ls.type && <Badge variant="outline">{ls.type}</Badge>}
                      </div>
                      {ls.rulerFaction && <p className="text-xs text-muted-foreground mt-0.5">Ruler: {ls.rulerFaction.name}</p>}
                      {ls.climate && <p className="text-xs text-muted-foreground">Climate: {ls.climate}</p>}
                      {ls.culture && <p className="text-xs text-muted-foreground">Culture: {ls.culture}</p>}
                      {ls.description && <p className="text-xs text-muted-foreground">{ls.description}</p>}
                      {ls.notes && <p className="text-xs text-muted-foreground italic">{ls.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editLocation(ls)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeState("locations", { locationId: ls.locationId }, "Location")}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !locationFormMode && <p className="text-sm text-muted-foreground">No location states set for this timeline.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Motivations & Powers summary */}
      {(timeline.characterMotivations?.length > 0 || timeline.factionMotivations?.length > 0 || timeline.characterPowers?.length > 0) && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Additional Overrides</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {timeline.characterMotivations?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Character Motivations</h3>
                {timeline.characterMotivations.map((cm: any) => (
                  <div key={cm.id} className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-medium">{cm.character.name}</span>
                    <span className="text-muted-foreground">—</span>
                    <Badge variant="outline">{cm.motivation.name}</Badge>
                    <span className="text-xs text-muted-foreground">Priority: {cm.priority}</span>
                  </div>
                ))}
              </div>
            )}
            {timeline.factionMotivations?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Faction Motivations</h3>
                {timeline.factionMotivations.map((fm: any) => (
                  <div key={fm.id} className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-medium">{fm.faction.name}</span>
                    <span className="text-muted-foreground">—</span>
                    <Badge variant="outline">{fm.motivation.name}</Badge>
                    <span className="text-xs text-muted-foreground">Priority: {fm.priority}</span>
                  </div>
                ))}
              </div>
            )}
            {timeline.characterPowers?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Character Powers</h3>
                {timeline.characterPowers.map((cp: any) => (
                  <div key={cp.id} className="flex items-center gap-2 text-sm mb-1">
                    <span className="font-medium">{cp.character.name}</span>
                    <span className="text-muted-foreground">—</span>
                    <Badge variant="outline">{cp.power.name}</Badge>
                    <span className="text-xs text-muted-foreground">Strength: {cp.strengthLevel}</span>
                    {cp.isPrimary && <Badge variant="default">Primary</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
