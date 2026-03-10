"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  name?: string;
  title?: string;
  entityType: string;
  type?: string;
  category?: string;
  status?: string;
  era?: string;
}

const entityConfig: Record<string, { label: string; color: string; href: string; nameField: string }> = {
  character: { label: "Character", color: "bg-blue-100 text-blue-800", href: "/characters", nameField: "name" },
  power: { label: "Power", color: "bg-yellow-100 text-yellow-800", href: "/powers", nameField: "name" },
  motivation: { label: "Motivation", color: "bg-red-100 text-red-800", href: "/motivations", nameField: "name" },
  faction: { label: "Faction", color: "bg-green-100 text-green-800", href: "/factions", nameField: "name" },
  location: { label: "Location", color: "bg-purple-100 text-purple-800", href: "/locations", nameField: "name" },
  "story-arc": { label: "Story Arc", color: "bg-indigo-100 text-indigo-800", href: "/story-arcs", nameField: "title" },
  "plot-event": { label: "Plot Event", color: "bg-orange-100 text-orange-800", href: "/plot-events", nameField: "title" },
  timeline: { label: "Timeline", color: "bg-cyan-100 text-cyan-800", href: "/timeline", nameField: "title" },
  item: { label: "Item", color: "bg-pink-100 text-pink-800", href: "/items", nameField: "name" },
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, SearchResult[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) setResults(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const allResults: SearchResult[] = results
    ? Object.values(results).flat()
    : [];

  const totalCount = allResults.length;

  return (
    <div>
      <PageHeader title="Search" subtitle="Search across all story elements" />
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters, powers, locations, items..."
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {results && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{totalCount} result{totalCount !== 1 ? "s" : ""} found</p>
          {totalCount === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No results found for &ldquo;{query}&rdquo;
              </CardContent>
            </Card>
          ) : (
            Object.entries(results).map(([key, items]) => {
              if (!items || items.length === 0) return null;
              const config = entityConfig[items[0]?.entityType];
              if (!config) return null;
              return (
                <Card key={key}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-muted-foreground text-sm">{items.length} result{items.length !== 1 ? "s" : ""}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          className="flex items-center justify-between w-full py-2 px-1 hover:bg-muted/50 rounded text-left"
                          onClick={() => router.push(`${config.href}/${item.id}`)}
                        >
                          <span className="font-medium text-sm">{item.name || item.title}</span>
                          <div className="flex gap-2">
                            {item.type && <Badge variant="outline" className="text-xs">{item.type}</Badge>}
                            {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                            {item.status && <Badge variant="secondary" className="text-xs">{item.status}</Badge>}
                            {item.era && <Badge variant="outline" className="text-xs">{item.era}</Badge>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
