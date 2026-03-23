import { z } from "zod";

export const plotEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().optional(),
  consequence: z.string().optional(),
  order: z.number().int().default(0),
  storyArcId: z.string().min(1, "Story Arc is required"),
  locationId: z.string().optional().nullable(),
});

export const plotEventCharacterSchema = z.object({
  plotEventId: z.string().min(1),
  characterId: z.string().min(1),
  role: z.enum(["protagonist", "antagonist", "witness", "victim"]),
});

export const plotEventItemSchema = z.object({
  plotEventId: z.string().min(1),
  itemId: z.string().min(1),
  role: z.enum(["used", "discovered", "destroyed", "stolen"]),
});

export type PlotEventInput = z.infer<typeof plotEventSchema>;
export type PlotEventCharacterInput = z.infer<typeof plotEventCharacterSchema>;
export type PlotEventItemInput = z.infer<typeof plotEventItemSchema>;
