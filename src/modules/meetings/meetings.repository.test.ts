import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockMongooseModel, mockObjectId } from "@/test/utils";

const mockModel = createMockMongooseModel();

vi.mock("./meetings.model", () => ({
  Meeting: mockModel,
}));

import { MeetingsRepository } from "./meetings.repository";
import { Meeting } from "./meetings.model";

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
      vi.mocked(Meeting.find).mockResolvedValue(mockMeetings);

      const result = await repository.getMeetings(userId);

      expect(Meeting.find).toHaveBeenCalledWith({ userId });
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
