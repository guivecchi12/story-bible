import { NextResponse } from "next/server";
import { getBookContext } from "@/lib/book-context";
import { timelineService } from "@/lib/services";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const ctx = await getBookContext(req);
  if (!ctx)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const timeline = await timelineService.getById(params.id);
  if (!timeline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build lookup maps for quick access by entity ID
  const characterStates: Record<string, any> = {};
  for (const s of timeline.characterStates) {
    characterStates[s.characterId] = s;
  }

  const itemStates: Record<string, any> = {};
  for (const s of timeline.itemStates) {
    itemStates[s.itemId] = s;
  }

  const factionStates: Record<string, any> = {};
  for (const s of timeline.factionStates) {
    factionStates[s.factionId] = s;
  }

  const locationStates: Record<string, any> = {};
  for (const s of timeline.locationStates) {
    locationStates[s.locationId] = s;
  }

  return NextResponse.json({
    timelineId: timeline.id,
    title: timeline.title,
    characterStates,
    itemStates,
    factionStates,
    locationStates,
    characterMotivations: timeline.characterMotivations,
    factionMotivations: timeline.factionMotivations,
    characterPowers: timeline.characterPowers,
    characterLocations: timeline.characterLocations,
    characterItems: timeline.characterItems,
  });
}
