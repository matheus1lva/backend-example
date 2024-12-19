import { z } from "zod";

const taskStatuses = ["pending", "in-progress", "completed"] as const;

export const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(taskStatuses),
  dueDate: z.string().optional(),
});

export type TaskSchemaParams = z.infer<typeof taskSchema>;
export type TaskStatus = (typeof taskStatuses)[number];
