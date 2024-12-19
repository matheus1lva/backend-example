import { z } from "zod";

const taskStatuses = ["pending", "in-progress", "completed"] as const;

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional(),
  status: z.enum(taskStatuses, {
    errorMap: () => ({
      message:
        "Invalid status. Must be one of: pending, in-progress, completed",
    }),
  }),
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .transform((date) => new Date(date))
    .refine((date) => date > new Date(), {
      message: "Due date must be in the future",
    })
    .optional(),
});

export type TaskSchemaParams = z.infer<typeof taskSchema>;
export type TaskStatus = (typeof taskStatuses)[number];
