import { taskSchema } from "@/modules/tasks/schemas/tasks.schema";
import { z } from "zod";

export const summaryAndActionsResponseSchema = z.object({
  tasks: z.array(taskSchema),
  summary: z.string(),
});

export type SummaryAndActionsResponseParams = z.infer<
  typeof summaryAndActionsResponseSchema
>;
