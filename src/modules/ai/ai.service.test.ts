import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './ai.service';
import OpenAI from 'openai';
import { logger } from '@/utils';

vi.mock('openai');
vi.mock('@/utils', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AiService', () => {
  let service: AiService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.resetModules();
    process.env.OPENAI_API_KEY = mockApiKey;
  });

  describe('constructor', () => {
    it('should initialize OpenAI client when API key is provided', () => {
      service = new AiService();
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: mockApiKey });
      expect(service.client).toBeDefined();
    });

    it('should log warning when API key is not provided', () => {
      delete process.env.OPENAI_API_KEY;
      service = new AiService();
      expect(logger.warn).toHaveBeenCalledWith(
        'OpenAI credentials not provided, skipping service initialization'
      );
      expect(service.client).toBeUndefined();
    });
  });

  describe('summarizeMeeting', () => {
    const mockMeetingInput = {
      title: 'Test Meeting',
      transcript: 'This is a test meeting transcript',
    };

    const mockCompletionResponse = {
      summary: 'Test meeting summary',
      tasks: [
        {
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          dueDate: '2024-12-25',
        },
      ],
    };

    beforeEach(() => {
      service = new AiService();
      service.client = {
        beta: {
          chat: {
            completions: {
              parse: vi.fn().mockResolvedValue(mockCompletionResponse),
            },
          },
        },
      };
    });

    it('should generate meeting summary and tasks', async () => {
      const result = await service.summarizeMeeting(mockMeetingInput);

      expect(service.client.beta.chat.completions.parse).toHaveBeenCalledWith({
        model: expect.any(String),
        messages: expect.arrayContaining([
          expect.objectContaining({
            role: 'system',
            content: expect.any(String),
          }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(mockMeetingInput.title),
          }),
        ]),
        response_format: { schema: expect.any(Object) },
      });

      expect(result).toEqual(mockCompletionResponse);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('API Error');
      service.client.beta.chat.completions.parse.mockRejectedValue(mockError);

      await expect(service.summarizeMeeting(mockMeetingInput))
        .rejects
        .toThrow('Failed to generate meeting summary');
      
      expect(logger.error).toHaveBeenCalledWith('Error in summarizeMeeting:', mockError);
    });

    it('should handle missing OpenAI client', async () => {
      delete process.env.OPENAI_API_KEY;
      service = new AiService();

      await expect(service.summarizeMeeting(mockMeetingInput))
        .rejects
        .toThrow('OpenAI client not initialized');
    });
  });
});
