import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  aliases: z.array(z.string()).optional().default([]),
  type: z.enum(["weapon", "artifact", "relic", "tool", "symbol"]),
  description: z.string().optional(),
  lore: z.string().optional(),
  properties: z.string().optional(),
  locationId: z.string().optional().nullable(),
});

export type ItemInput = z.infer<typeof itemSchema>;
