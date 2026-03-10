import { z } from "zod";

export const storyArcSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  description: z.string().optional(),
  type: z.enum(["main", "subplot", "character_arc"]),
  status: z.enum(["planned", "active", "resolved"]).default("planned"),
  parentArcId: z.string().optional().nullable(),
});

export type StoryArcInput = z.infer<typeof storyArcSchema>;
