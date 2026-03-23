"use client";

import { useState, useEffect } from "react";
import { useTimeline } from "@/lib/contexts/timeline-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";

function StatusBadge({ status, customStatus }: { status: string; customStatus?: string | null }) {
  const label = status === "Other" && customStatus ? customStatus : status;
  const variant =
    status === "Dead" || status === "Destroyed" || status === "Disbanded"
      ? "destructive"
      : status === "Healthy" || status === "Active" || status === "Intact" || status === "Allied"
        ? "default"
        : "secondary";
  return <Badge variant={variant}>{label}</Badge>;
}

interface Props {
  entityType: "character" | "item" | "faction" | "location";
  entityId: string;
}

export function TimelineStateBanner({ entityType, entityId }: Props) {
  const { activeTimeline } = useTimeline();
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeTimeline) {
      setState(null);
      return;
    }

    setLoading(true);
    apiFetch(`/api/timeline/${activeTimeline.id}/world-state`)
      .then((r) => r.json())
      .then((data) => {
        const stateMap = {
          character: data.characterStates,
          item: data.itemStates,
          faction: data.factionStates,
          location: data.locationStates,
        };
        setState(stateMap[entityType]?.[entityId] || null);
      })
      .finally(() => setLoading(false));
  }, [activeTimeline?.id, entityType, entityId]);

  if (!activeTimeline) return null;
  if (loading) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-3">
          <p className="text-sm text-muted-foreground">Loading timeline state...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="py-3 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Timeline: {activeTimeline.title}
          {activeTimeline.era && <Badge variant="outline" className="text-xs">{activeTimeline.era}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 pb-3">
        {state ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <StatusBadge status={state.status} customStatus={state.customStatus} />
            </div>
            {state.description && (
              <p className="text-sm text-muted-foreground">{state.description}</p>
            )}
            {state.notes && (
              <p className="text-xs text-muted-foreground">{state.notes}</p>
            )}
            {/* Item-specific fields */}
            {entityType === "item" && state.holder && (
              <p className="text-sm">
                <span className="font-medium">Held by:</span> {state.holder.name}
              </p>
            )}
            {entityType === "item" && state.location && (
              <p className="text-sm">
                <span className="font-medium">Location:</span> {state.location.name}
              </p>
            )}
            {/* Location-specific fields */}
            {entityType === "location" && state.rulerFaction && (
              <p className="text-sm">
                <span className="font-medium">Ruler:</span> {state.rulerFaction.name}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No state recorded for this {entityType} at this timeline point.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
