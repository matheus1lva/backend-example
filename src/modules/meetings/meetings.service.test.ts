import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDate, mockObjectId } from "../../test/utils";
import { MeetingsService } from "./meetings.service";
import { Meeting } from "./meetings.model";
import { httpErrors } from "../../utils";

vi.mock("./meetings.model");
vi.mock("../ai/ai.service");

describe("MeetingsService", () => {
  let service: MeetingsService;
  let mockMeetingsRepository: any;
  let mockAiService: any;
  let mockTasksService: any;
  let mockRedisService: any;

  const userId = mockObjectId();
  const meetingId = mockObjectId();

  beforeEach(() => {
    mockMeetingsRepository = {
      getMeetings: vi.fn(),
      getMeetingById: vi.fn(),
      updateMeeting: vi.fn(),
      countMeetingsByUserId: vi.fn(),
    };
    mockAiService = {
      summarizeMeeting: vi.fn(),
    };
    mockTasksService = {
      createTasksFromActionItems: vi.fn(),
    };
    mockRedisService = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    service = new MeetingsService(
      mockTasksService,
      mockAiService,
      mockMeetingsRepository,
      mockRedisService
    );
  });

  describe("getMeetings", () => {
    it("should return cached meetings if available", async () => {
      const mockMeetings = {
        data: [{ _id: meetingId, userId }],
        total: 10,
        page: 1,
        limit: 10,
      };
      mockRedisService.get.mockResolvedValue(mockMeetings);

      const result = await service.getMeetings(userId);

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `meetings:${userId}:1:10`
      );
      expect(mockMeetingsRepository.getMeetings).not.toHaveBeenCalled();
      expect(result).toEqual(mockMeetings);
    });

    it("should get meetings from repository and cache them if not cached", async () => {
      const mockMeetings = [{ _id: meetingId, userId }];
      mockRedisService.get.mockResolvedValue(null);
      mockMeetingsRepository.getMeetings.mockResolvedValue(mockMeetings);
      mockMeetingsRepository.countMeetingsByUserId.mockResolvedValue(10);

      const result = await service.getMeetings(userId);

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `meetings:${userId}:1:10`
      );
      expect(mockMeetingsRepository.getMeetings).toHaveBeenCalledWith(
        userId,
        0,
        10
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `meetings:${userId}:1:10`,
        {
          data: mockMeetings,
          total: 10,
          page: 1,
          limit: 10,
        },
        300
      );
      expect(result).toEqual({
        data: mockMeetings,
        total: 10,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("getMeetingById", () => {
    it("should return cached meeting if available", async () => {
      const mockMeeting = { _id: meetingId, userId };
      mockRedisService.get.mockResolvedValue(mockMeeting);

      const result = await service.getMeetingById(meetingId, userId);

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `meeting:${meetingId}:${userId}`
      );
      expect(mockMeetingsRepository.getMeetingById).not.toHaveBeenCalled();
      expect(result).toEqual(mockMeeting);
    });

    it("should get meeting from repository and cache it if not cached", async () => {
      const mockMeeting = { _id: meetingId, userId };
      mockRedisService.get.mockResolvedValue(null);
      mockMeetingsRepository.getMeetingById.mockResolvedValue(mockMeeting);

      const result = await service.getMeetingById(meetingId, userId);

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `meeting:${meetingId}:${userId}`
      );
      expect(mockMeetingsRepository.getMeetingById).toHaveBeenCalledWith(
        meetingId,
        userId
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `meeting:${meetingId}:${userId}`,
        mockMeeting,
        300
      );
      expect(result).toEqual(mockMeeting);
    });
  });

  describe("createMeeting", () => {
    it("should create a meeting and invalidate cache", async () => {
      const mockMeeting = {
        userId,
        title: "Test Meeting",
        date: mockDate,
        participants: ["user1", "user2"],
        save: vi.fn().mockResolvedValue({ _id: meetingId }),
      };

      vi.spyOn(Meeting.prototype, "save").mockResolvedValue(mockMeeting);

      const result = await service.createMeeting(
        userId,
        mockMeeting.title,
        mockMeeting.date,
        mockMeeting.participants
      );

      expect(result).toBeDefined();
      expect(result).toEqual(mockMeeting);
      expect(mockRedisService.del).toHaveBeenCalledWith(`meetings:${userId}:*`);
    });
  });

  describe("summarizeMeeting", () => {
    it("should summarize a meeting and cache with 24h TTL", async () => {
      const mockMeeting = {
        _id: meetingId,
        userId,
        title: "Test Meeting",
        transcript: "Meeting transcript",
      };

      const mockSummaryResponse = {
        summary: "Meeting summary",
        tasks: [{ title: "Task 1" }, { title: "Task 2" }],
      };

      mockMeetingsRepository.getMeetingById.mockResolvedValue(mockMeeting);
      mockAiService.summarizeMeeting.mockResolvedValue(mockSummaryResponse);
      const updatedMeeting = {
        ...mockMeeting,
        summary: mockSummaryResponse.summary,
        actionItems: mockSummaryResponse.tasks.map((t) => t.title),
      };
      mockMeetingsRepository.updateMeeting.mockResolvedValue(updatedMeeting);

      const result = await service.summarizeMeeting(userId, meetingId);

      const ONE_DAY = 24 * 60 * 60;
      expect(mockAiService.summarizeMeeting).toHaveBeenCalledWith({
        title: mockMeeting.title,
        transcript: mockMeeting.transcript,
      });
      expect(mockTasksService.createTasksFromActionItems).toHaveBeenCalledWith(
        userId,
        meetingId,
        mockSummaryResponse.tasks.map((t) => t.title)
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `meeting:${meetingId}:${userId}`,
        updatedMeeting,
        ONE_DAY
      );
      expect(mockRedisService.del).toHaveBeenCalledWith(`meetings:${userId}:*`);
      expect(result).toBeDefined();
      expect(result).toEqual(updatedMeeting);
    });

    it("should throw NotFound if meeting is not found", async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockMeetingsRepository.getMeetingById.mockResolvedValue(null);

      await expect(service.summarizeMeeting(userId, meetingId)).rejects.toThrow(
        httpErrors.NotFound
      );
    });

    it("should throw error if AI service fails", async () => {
      const mockMeeting = {
        _id: meetingId,
        userId,
        title: "Test Meeting",
        transcript: "Meeting transcript",
      };

      mockRedisService.get.mockResolvedValue(null);
      mockMeetingsRepository.getMeetingById.mockResolvedValue(mockMeeting);
      mockAiService.summarizeMeeting.mockRejectedValue(
        new Error("AI service error")
      );

      await expect(service.summarizeMeeting(userId, meetingId)).rejects.toThrow(
        "Failed to generate meeting summary"
      );
    });
  });
});
