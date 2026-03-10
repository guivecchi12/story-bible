import { z } from "zod";

export const factionSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
});

export const factionMotivationSchema = z.object({
  factionId: z.string().min(1),
  motivationId: z.string().min(1),
  priority: z.number().int().min(1).default(1),
  notes: z.string().optional(),
});

export type FactionInput = z.infer<typeof factionSchema>;
export type FactionMotivationInput = z.infer<typeof factionMotivationSchema>;
