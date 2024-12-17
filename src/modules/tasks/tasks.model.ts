import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITask extends Document {
  meetingId: Types.ObjectId;
  userId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  dueDate: Date;
}

const taskSchema = new Schema<ITask>({
  meetingId: { type: Schema.Types.ObjectId, ref: "Meeting" },
  userId: String,
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  dueDate: Date,
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
