import { z } from "zod";

export const createMeetingSchema = z.object({
  title: z.string(),
  date: z.string(),
  participants: z.array(z.string()),
});

export type CreateMeetingSchema = z.infer<typeof createMeetingSchema>;
