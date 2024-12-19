import { z } from "zod";

export const updateTranscriptSchema = z.object({
  transcript: z.string(),
});
