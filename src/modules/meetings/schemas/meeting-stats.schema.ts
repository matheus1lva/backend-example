import { z } from "zod";

export const meetingStatsSchema = z.object({
  generalStats: z.object({
    totalMeetings: z.number(),
    averageParticipants: z.number(),
    totalParticipants: z.number(),
    shortestMeeting: z.number(),
    longestMeeting: z.number(),
    averageDuration: z.number(),
  }),
  topParticipants: z.array(
    z.object({
      participant: z.string(),
      meetingCount: z.number(),
    })
  ),
  meetingsByDayOfWeek: z.array(
    z.object({
      dayOfWeek: z.number(),
      count: z.number(),
    })
  ),
});

export type MeetingStats = z.infer<typeof meetingStatsSchema>;
