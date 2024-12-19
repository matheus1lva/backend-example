import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MeetingsService } from './meetings.service';
import { MeetingsRepository } from './meetings.repository';
import { AiService } from '@/modules/ai/ai.service';
import { TasksService } from '@/modules/tasks/tasks.service';
import { Meeting } from './meetings.model';
import { mockDate, mockObjectId } from '@/test/utils';
import { httpErrors } from 'throw-http-errors';

vi.mock('./meetings.model', () => ({
  Meeting: {
    ...createMockMongooseModel(),
  },
}));

describe('MeetingsService', () => {
  let service: MeetingsService;
  let mockMeetingsRepository: any;
  let mockAiService: any;
  let mockTasksService: any;

  const userId = mockObjectId();
  const meetingId = mockObjectId();

  beforeEach(() => {
    mockMeetingsRepository = {
      getMeetings: vi.fn(),
      getMeetingById: vi.fn(),
      updateMeeting: vi.fn(),
    };
    mockAiService = {
      summarizeMeeting: vi.fn(),
    };
    mockTasksService = {
      createTasksFromActionItems: vi.fn(),
    };

    service = new MeetingsService(
      mockTasksService,
      mockAiService,
      mockMeetingsRepository
    );
  });

  describe('getMeetings', () => {
    it('should get all meetings for a user', async () => {
      const mockMeetings = [{ _id: meetingId, userId }];
      mockMeetingsRepository.getMeetings.mockResolvedValue(mockMeetings);

      const result = await service.getMeetings(userId);

      expect(mockMeetingsRepository.getMeetings).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockMeetings);
    });
  });

  describe('getMeetingById', () => {
    it('should get a specific meeting', async () => {
      const mockMeeting = { _id: meetingId, userId };
      mockMeetingsRepository.getMeetingById.mockResolvedValue(mockMeeting);

      const result = await service.getMeetingById(meetingId, userId);

      expect(mockMeetingsRepository.getMeetingById).toHaveBeenCalledWith(meetingId, userId);
      expect(result).toEqual(mockMeeting);
    });
  });

  describe('createMeeting', () => {
    it('should create a new meeting', async () => {
      const mockMeeting = {
        userId,
        title: 'Test Meeting',
        date: mockDate,
        participants: ['user1', 'user2'],
        save: vi.fn().mockResolvedValue({ _id: meetingId }),
      };

      vi.spyOn(Meeting.prototype, 'save').mockResolvedValue(mockMeeting);

      const result = await service.createMeeting(
        userId,
        mockMeeting.title,
        mockMeeting.date,
        mockMeeting.participants
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockMeeting);
    });
  });

  describe('summarizeMeeting', () => {
    it('should summarize a meeting and create tasks', async () => {
      const mockMeeting = {
        _id: meetingId,
        userId,
        title: 'Test Meeting',
        transcript: 'Meeting transcript',
      };

      const mockSummaryResponse = {
        summary: 'Meeting summary',
        tasks: [{ title: 'Task 1' }, { title: 'Task 2' }],
      };

      mockMeetingsRepository.getMeetingById.mockResolvedValue(mockMeeting);
      mockAiService.summarizeMeeting.mockResolvedValue(mockSummaryResponse);
      mockMeetingsRepository.updateMeeting.mockResolvedValue({
        ...mockMeeting,
        summary: mockSummaryResponse.summary,
        actionItems: mockSummaryResponse.tasks.map(t => t.title),
      });

      const result = await service.summarizeMeeting(userId, meetingId);

      expect(mockAiService.summarizeMeeting).toHaveBeenCalledWith({
        title: mockMeeting.title,
        transcript: mockMeeting.transcript,
      });
      expect(mockTasksService.createTasksFromActionItems).toHaveBeenCalledWith(
        userId,
        meetingId,
        mockSummaryResponse.tasks.map(t => t.title)
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFound if meeting is not found', async () => {
      mockMeetingsRepository.getMeetingById.mockResolvedValue(null);

      await expect(service.summarizeMeeting(userId, meetingId))
        .rejects
        .toThrow(httpErrors.NotFound);
    });

    it('should throw error if AI service fails', async () => {
      const mockMeeting = {
        _id: meetingId,
        userId,
        title: 'Test Meeting',
        transcript: 'Meeting transcript',
      };

      mockMeetingsRepository.getMeetingById.mockResolvedValue(mockMeeting);
      mockAiService.summarizeMeeting.mockRejectedValue(new Error('AI service error'));

      await expect(service.summarizeMeeting(userId, meetingId))
        .rejects
        .toThrow('Failed to generate meeting summary');
    });
  });
});
