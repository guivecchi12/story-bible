import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["main", "supporting"]),
  description: z.string().optional(),
  backstory: z.string().optional(),
  factionId: z.string().optional().nullable(),
});

export const characterPowerSchema = z.object({
  characterId: z.string().min(1),
  powerId: z.string().min(1),
  strengthLevel: z.number().int().min(1).max(10).default(5),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const characterMotivationSchema = z.object({
  characterId: z.string().min(1),
  motivationId: z.string().min(1),
  priority: z.number().int().min(1).default(1),
  personalNotes: z.string().optional(),
});

export const characterLocationSchema = z.object({
  characterId: z.string().min(1),
  locationId: z.string().min(1),
  role: z.enum(["hometown", "current", "visited", "imprisoned"]),
});

export const characterItemSchema = z.object({
  characterId: z.string().min(1),
  itemId: z.string().min(1),
  status: z.enum(["owns", "owned", "seeking", "destroyed"]),
  acquiredAt: z.string().optional(),
});

export type CharacterInput = z.infer<typeof characterSchema>;
export type CharacterPowerInput = z.infer<typeof characterPowerSchema>;
export type CharacterMotivationInput = z.infer<typeof characterMotivationSchema>;
export type CharacterLocationInput = z.infer<typeof characterLocationSchema>;
export type CharacterItemInput = z.infer<typeof characterItemSchema>;
