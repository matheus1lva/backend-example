import { Types } from "mongoose";

export interface UpcomingMeeting {
  _id: Types.ObjectId;
  title: string;
  date: Date;
  participantCount: number;
}

export interface MeetingSummaryRequest {
  title: string;
  transcript: string;
}

export interface MeetingSummaryResponse {
  summary: string;
  actionItems: string[];
}
