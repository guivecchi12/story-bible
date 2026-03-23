"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/layout";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Clock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { useTimeline } from "@/lib/contexts/timeline-context";

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const timelineParam = activeTimeline ? `?timelineId=${activeTimeline.id}` : "";
  const fetchItem = () =>
    apiFetch(`/api/items/${id}${timelineParam}`)
      .then((r) => r.json())
      .then(setItem);

  useEffect(() => {
    fetchItem().finally(() => setLoading(false));
  }, [id, activeTimeline?.id]);

  if (loading)
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!item) return <p>Item not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{item.name}</h1>
          {item.aliases?.length > 0 && (
            <p className="text-sm text-muted-foreground">
              aka {item.aliases.join(", ")}
            </p>
          )}
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge>{item.type}</Badge>
            {item.status && (
              <Badge variant={item.status === "Destroyed" ? "destructive" : item.status === "Active" ? "default" : "secondary"}>
                {item.status === "Other" && item.customStatus ? item.customStatus : item.status}
              </Badge>
            )}
            {item.location && <Badge variant="outline">{item.location.name}</Badge>}
            {item.holder && <Badge variant="secondary">Held by: {item.holder.name}</Badge>}
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

      {item.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <RichTextDisplay content={item.description} />
          </CardContent>
        </Card>
      )}

      {item.lore && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Lore</CardTitle></CardHeader>
          <CardContent>
            <RichTextDisplay content={item.lore} />
          </CardContent>
        </Card>
      )}

      {item.properties && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Properties</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{item.properties}</p>
          </CardContent>
        </Card>
      )}

      {item.characters?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Owned By</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {item.characters.map((ci: any) => (
                <div key={ci.characterId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{ci.character.name}</p>
                    {ci.acquiredAt && <p className="text-xs text-muted-foreground">Acquired: {ci.acquiredAt}</p>}
                  </div>
                  <Badge variant="outline">{ci.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {item.plotEvents?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Plot Events</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {item.plotEvents.map((pe: any) => (
                <div key={pe.plotEventId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{pe.plotEvent.title}</p>
                  <Badge variant="outline">{pe.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {item.notes && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Timeline Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
