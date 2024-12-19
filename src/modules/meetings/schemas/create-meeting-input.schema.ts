import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  participants: z
    .array(
      z
        .string()
        .min(1, "Participant name is required")
        .max(100, "Participant name must be less than 100 characters")
        .trim()
        .regex(/^[a-zA-Z0-9\s\-_.@]+$/, "Invalid participant name format")
    )
    .min(1, "At least one participant is required")
    .max(50, "Maximum of 50 participants allowed"),
});

export type CreateMeetingSchema = z.infer<typeof createMeetingSchema>;
