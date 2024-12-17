import { z } from "zod";

export const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.string(),
  dueDate: z.string().optional(),
});

export type TaskSchemaParams = z.infer<typeof taskSchema>;
