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

export default function LocationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { activeTimeline } = useTimeline();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const timelineParam = activeTimeline ? `?timelineId=${activeTimeline.id}` : "";
  const fetchLocation = () =>
    apiFetch(`/api/locations/${id}${timelineParam}`)
      .then((r) => r.json())
      .then(setLocation);

  useEffect(() => {
    fetchLocation().finally(() => setLoading(false));
  }, [id, activeTimeline?.id]);

  if (loading)
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  if (!location) return <p>Location not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{location.name}</h1>
          <div className="flex gap-2 mt-1 flex-wrap">
            <Badge>{location.type}</Badge>
            {location.status && (
              <Badge variant={location.status === "Destroyed" ? "destructive" : location.status === "Intact" ? "default" : "secondary"}>
                {location.status === "Other" && location.customStatus ? location.customStatus : location.status}
              </Badge>
            )}
            {location.parent && <Badge variant="outline">Part of: {location.parent.name}</Badge>}
            {location.rulerFaction && <Badge variant="secondary">Ruler: {location.rulerFaction.name}</Badge>}
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

      {location.description && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
          <CardContent>
            <RichTextDisplay content={location.description} />
          </CardContent>
        </Card>
      )}

      {(location.climate || location.culture) && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {location.climate && (
              <div>
                <p className="text-sm font-medium">Climate</p>
                <p className="text-sm text-muted-foreground">{location.climate}</p>
              </div>
            )}
            {location.culture && (
              <div>
                <p className="text-sm font-medium">Culture</p>
                <RichTextDisplay content={location.culture} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {location.children?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Sub-Locations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {location.children.map((child: any) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0 cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                  onClick={() => router.push(`/locations/${child.id}`)}
                >
                  <p className="font-medium text-sm">{child.name}</p>
                  <Badge variant="outline">{child.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {location.characters?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Characters</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {location.characters.map((cl: any) => (
                <div key={cl.characterId} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{cl.character.name}</p>
                  <Badge variant="outline">{cl.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {location.items?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {location.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <p className="font-medium text-sm">{item.name}</p>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {location.notes && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Timeline Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{location.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
