import { z } from "zod";

export const timelineEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().optional(),
  inWorldDate: z.string().optional(),
  era: z.string().optional(),
  order: z.number().int().default(0),
  locationId: z.string().optional().nullable(),
});

export const timelineEventCharacterSchema = z.object({
  timelineEventId: z.string().min(1),
  characterId: z.string().min(1),
  notes: z.string().optional(),
});

export type TimelineEventInput = z.infer<typeof timelineEventSchema>;
export type TimelineEventCharacterInput = z.infer<typeof timelineEventCharacterSchema>;
