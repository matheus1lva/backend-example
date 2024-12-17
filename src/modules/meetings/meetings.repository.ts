import { IMeeting, Meeting } from "@/modules/meetings/meetings.model";
import { Service } from "typedi";

@Service()
export class MeetingsRepository {
  async getMeetings(userId: string) {
    return Meeting.find({ userId });
  }
  async getMeetingById(meetingId: string, userId: string) {
    return Meeting.findOne({ _id: meetingId, userId });
  }

  async updateMeeting(args: Partial<IMeeting>) {
    return Meeting.findOneAndUpdate(
      { _id: args._id },
      {
        title: args.title,
        transcript: args.transcript,
        summary: args.summary,
        actionItems: args.actionItems,
      },
      { new: true }
    );
  }
}
