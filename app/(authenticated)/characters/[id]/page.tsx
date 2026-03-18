"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/layout";
import { ArrowLeft } from "lucide-react";

export default function CharacterDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/characters/${id}`)
      .then((r) => r.json())
      .then(setCharacter)
      .finally(() => setLoading(false));
  }, [id]);

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
          <div className="flex gap-2 mt-1">
            <Badge>{character.type}</Badge>
            {character.faction && (
              <Badge variant="outline">{character.faction.name}</Badge>
            )}
          </div>
        </div>
      </div>
      {character.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {character.description}
            </p>
          </CardContent>
        </Card>
      )}
      {character.backstory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backstory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{character.backstory}</p>
          </CardContent>
        </Card>
      )}
      {character.powers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Powers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {character.powers.map((cp: any) => (
                <div
                  key={cp.powerId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {cp.power.name}
                      {cp.isPrimary && (
                        <Badge className="ml-2" variant="secondary">
                          Primary
                        </Badge>
                      )}
                    </p>
                    {cp.notes && (
                      <p className="text-xs text-muted-foreground">
                        {cp.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Strength:
                    </span>
                    <Badge variant="outline">{cp.strengthLevel}/10</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {character.motivations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Motivations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.motivations.map((cm: any) => (
                <div
                  key={cm.motivationId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{cm.motivation.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {cm.motivation.category}
                    </Badge>
                  </div>
                  <Badge variant="outline">Priority: {cm.priority}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {character.locations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.locations.map((cl: any) => (
                <div
                  key={cl.locationId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <p className="font-medium text-sm">{cl.location.name}</p>
                  <Badge variant="outline">{cl.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {character.items?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {character.items.map((ci: any) => (
                <div
                  key={ci.itemId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <p className="font-medium text-sm">{ci.item.name}</p>
                  <Badge variant="outline">{ci.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
