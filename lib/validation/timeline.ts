import { z } from "zod";

export const timelineSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().optional(),
  inWorldDate: z.string().optional(),
  era: z.string().optional(),
  order: z.number().int().default(0),
  plotEventId: z.string().min(1, "Plot Event is required"),
  locationId: z.string().optional().nullable(),
});

export const timelineCharacterStateSchema = z.object({
  characterId: z.string().min(1),
  name: z.string().optional().nullable(),
  nicknames: z.array(z.string()).optional().default([]),
  nicknamesOverridden: z.boolean().optional().default(false),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  backstory: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  customStatus: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  factionsOverridden: z.boolean().optional().default(false),
});

export const timelineItemStateSchema = z.object({
  itemId: z.string().min(1),
  name: z.string().optional().nullable(),
  aliases: z.array(z.string()).optional().default([]),
  aliasesOverridden: z.boolean().optional().default(false),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
  properties: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  customStatus: z.string().optional().nullable(),
  holderId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const timelineFactionStateSchema = z.object({
  factionId: z.string().min(1),
  name: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  customStatus: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const timelineLocationStateSchema = z.object({
  locationId: z.string().min(1),
  name: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  climate: z.string().optional().nullable(),
  culture: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  customStatus: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  rulerFactionId: z.string().optional().nullable(),
});

export const timelineCharacterMotivationSchema = z.object({
  characterId: z.string().min(1),
  motivationId: z.string().min(1),
  priority: z.number().int().default(1),
  personalNotes: z.string().optional().nullable(),
});

export const timelineFactionMotivationSchema = z.object({
  factionId: z.string().min(1),
  motivationId: z.string().min(1),
  priority: z.number().int().default(1),
  notes: z.string().optional().nullable(),
});

export const timelineCharacterPowerSchema = z.object({
  characterId: z.string().min(1),
  powerId: z.string().min(1),
  strengthLevel: z.number().int().default(5),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional().nullable(),
});

export const timelineCharacterLocationSchema = z.object({
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  role: z.string().min(1),
});

export const timelineCharacterItemSchema = z.object({
  characterId: z.string().min(1),
  itemId: z.string().min(1),
  status: z.string().min(1),
  acquiredAt: z.string().optional().nullable(),
});

export type TimelineInput = z.infer<typeof timelineSchema>;
export type TimelineCharacterStateInput = z.infer<typeof timelineCharacterStateSchema>;
export type TimelineItemStateInput = z.infer<typeof timelineItemStateSchema>;
export type TimelineFactionStateInput = z.infer<typeof timelineFactionStateSchema>;
export type TimelineLocationStateInput = z.infer<typeof timelineLocationStateSchema>;
export type TimelineCharacterMotivationInput = z.infer<typeof timelineCharacterMotivationSchema>;
export type TimelineFactionMotivationInput = z.infer<typeof timelineFactionMotivationSchema>;
export type TimelineCharacterPowerInput = z.infer<typeof timelineCharacterPowerSchema>;
export type TimelineCharacterLocationInput = z.infer<typeof timelineCharacterLocationSchema>;
export type TimelineCharacterItemInput = z.infer<typeof timelineCharacterItemSchema>;
