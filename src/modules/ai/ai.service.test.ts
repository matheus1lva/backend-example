import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { AiService } from "./ai.service";
import OpenAI from "openai";
import { logger } from "@/utils";

vi.mock("openai");
vi.mock("@/utils", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AiService", () => {
  let service: AiService;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = mockApiKey;
  });

  describe("constructor", () => {
    it("should initialize OpenAI client when API key is provided", () => {
      service = new AiService();
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(service.client).toBeDefined();
    });

    it("should log warning when API key is not provided", () => {
      delete process.env.OPENAI_API_KEY;
      service = new AiService();
      expect(logger.warn).toHaveBeenCalledWith(
        "OpenAI credentials not provided"
      );
      expect(service.client).toBeUndefined();
    });
  });

  describe("summarizeMeeting", () => {
    const mockMeetingInput = {
      title: "Test Meeting",
      transcript: "This is a test meeting transcript",
    };

    const mockCompletionResponse = {
      summary: "Test meeting summary",
      tasks: [
        {
          title: "Task 1",
          description: "Description 1",
          status: "pending",
          dueDate: "2024-12-25",
        },
      ],
    };

    beforeEach(() => {
      service = new AiService();
      service.client = {
        beta: {
          chat: {
            // @ts-ignore not needed for tests now
            completions: {
              parse: vi.fn().mockResolvedValue({
                choices: [
                  {
                    message: {
                      parsed: mockCompletionResponse,
                    },
                  },
                ],
              }),
            },
          },
        },
      };
    });

    it("should generate meeting summary and tasks", async () => {
      const result = await service.summarizeMeeting(mockMeetingInput);

      expect(service.client?.beta.chat.completions.parse).toHaveBeenCalledWith({
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

Meeting Title: ${mockMeetingInput.title}
Transcript:
${mockMeetingInput.transcript}`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "summaryAndActionsResponse",
            schema: expect.any(Object),
            strict: true,
          },
        },
      });

      expect(result).toEqual(mockCompletionResponse);
    });

    it("should handle API errors gracefully", async () => {
      const mockError = new Error("API Error");
      (service.client?.beta.chat.completions.parse as Mock).mockRejectedValue(
        mockError
      );

      await expect(service.summarizeMeeting(mockMeetingInput)).rejects.toThrow(
        "Failed to generate meeting summary"
      );

      expect(logger.error).toHaveBeenCalledWith(
        "Error in summarizeMeeting:",
        mockError
      );
    });

    it("should handle missing OpenAI client", async () => {
      delete process.env.OPENAI_API_KEY;
      service = new AiService();

      await expect(service.summarizeMeeting(mockMeetingInput)).rejects.toThrow(
        "OpenAI client not initialized"
      );
    });
  });
});
