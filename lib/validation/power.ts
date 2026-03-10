import { z } from "zod";

export const powerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  effects: z.string().optional(),
  rules: z.string().optional(),
  weaknesses: z.string().optional(),
});

export type PowerInput = z.infer<typeof powerSchema>;
