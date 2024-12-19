import mongoose, { Document, Schema } from "mongoose";

export interface IMeeting extends Document {
  userId: string;
  title: string;
  date: Date;
  participants: string[];
  transcript: string;
  summary: string;
  actionItems: string[];
}

const meetingSchema = new Schema<IMeeting>({
  userId: String,
  title: String,
  date: Date,
  participants: [String],
  transcript: String,
  summary: String,
  actionItems: [String],
});

export const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema);
meetingSchema.index({ userId: 1 });
meetingSchema.index({ userId: 1, date: -1 });
meetingSchema.index({ date: 1 });
meetingSchema.index({ title: 1 });
