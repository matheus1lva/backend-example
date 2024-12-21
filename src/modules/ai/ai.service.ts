import {
  SummaryAndActionsResponseParams,
  summaryAndActionsResponseSchema,
} from "../meetings/schemas/summary-response.schema";
import { MeetingSummaryRequest } from "../meetings/types";
import { logger } from "../../utils";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { Service } from "typedi";

@Service()
export class AiService {
  client: OpenAI | undefined;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      logger.warn("OpenAI credentials not provided");
      return;
    }
    this.client = new OpenAI({ apiKey });
  }

  async summarizeMeeting({
    title,
    transcript,
  }: MeetingSummaryRequest): Promise<SummaryAndActionsResponseParams> {
    if (!this.client) {
      throw new Error("OpenAI client not initialized");
    }

    try {
      const summaryResponse = await this.client.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes meetings and extracts action items. Provide a concise summary and a list of specific, actionable tasks.",
          },
          {
            role: "system",
            content:
              "The summary must be an easily readable text with the key points discussed in the meeting with 2-3 sentences.",
          },
          {
            role: "system",
            content:
              "The action items tasks must have a title, description, status and a due date for that task.",
          },
          {
            role: "system",
            content:
              "Consider the following statuses for the Task: 'pending', 'in-progress', 'completed', define the current status based on the meeting discussion, if none given, set it as 'pending'.",
          },
          {
            role: "user",
            content: `Please analyze this meeting transcript and provide:
1. A brief summary of the key points discussed
2. A list of specific action items that need to be completed

Meeting Title: ${title}
Transcript:
${transcript}`,
          },
        ],
        response_format: zodResponseFormat(
          summaryAndActionsResponseSchema,
          "summaryAndActionsResponse"
        ),
      });

      const parsedMeetingSummaryAndActionItems =
        summaryResponse.choices[0]?.message.parsed;

      if (!parsedMeetingSummaryAndActionItems) {
        logger.warn("No response returned from OpenAI, defaulting...");
        return { tasks: [], summary: "" };
      }

      return parsedMeetingSummaryAndActionItems;
    } catch (error) {
      logger.error("Error in summarizeMeeting:", error);
      throw new Error("Failed to generate meeting summary");
    }
  }
}
