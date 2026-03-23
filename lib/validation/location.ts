import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["continent", "region", "city", "building", "landmark"]),
  description: z.string().optional(),
  climate: z.string().optional(),
  culture: z.string().optional(),
  parentId: z.string().optional().nullable(),
  rulerFactionId: z.string().optional().nullable(),
});

export type LocationInput = z.infer<typeof locationSchema>;
