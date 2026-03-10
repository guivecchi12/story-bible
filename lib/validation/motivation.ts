import { z } from "zod";

export const motivationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().optional(),
  category: z.enum(["personal", "political", "emotional", "survival"]),
});

export type MotivationInput = z.infer<typeof motivationSchema>;
