import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockObjectId } from "../../test/utils";
import { MeetingsRepository } from "./meetings.repository";
import { Meeting } from "./meetings.model";

vi.mock("./meetings.model");

describe("MeetingsRepository", () => {
  let repository: MeetingsRepository;
  const userId = mockObjectId();
  const meetingId = mockObjectId();

  beforeEach(() => {
    repository = new MeetingsRepository();
    vi.clearAllMocks();
  });

  describe("getMeetings", () => {
    it("should get all meetings for a user", async () => {
      const mockMeetings = [{ _id: meetingId, userId }];
      const mockQuery = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockMeetings),
      };
      vi.mocked(Meeting.find).mockReturnValue(mockQuery as any);

      const result = await repository.getMeetings(userId);

      expect(Meeting.find).toHaveBeenCalledWith({ userId });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockMeetings);
    });
  });

  describe("getMeetingById", () => {
    it("should get a specific meeting by id and userId", async () => {
      const mockMeeting = { _id: meetingId, userId };
      vi.mocked(Meeting.findOne).mockResolvedValue(mockMeeting);

      const result = await repository.getMeetingById(meetingId, userId);

      expect(Meeting.findOne).toHaveBeenCalledWith({ _id: meetingId, userId });
      expect(result).toEqual(mockMeeting);
    });
  });

  describe("updateMeeting", () => {
    it("should update a meeting", async () => {
      const updateData = {
        _id: meetingId,
        title: "Updated Title",
        transcript: "Updated transcript",
        summary: "Updated summary",
        actionItems: ["task1", "task2"],
      };
      const mockUpdatedMeeting = { ...updateData };

      vi.mocked(Meeting.findOneAndUpdate).mockResolvedValue(mockUpdatedMeeting);

      const result = await repository.updateMeeting(updateData);

      expect(Meeting.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: updateData._id },
        {
          title: updateData.title,
          transcript: updateData.transcript,
          summary: updateData.summary,
          actionItems: updateData.actionItems,
        },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedMeeting);
    });
  });
});
