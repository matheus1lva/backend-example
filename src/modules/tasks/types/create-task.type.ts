import { Types } from "mongoose";

export type CreateTask = {
  userId: string;
  meetingId: Types.ObjectId | string;
  title: string;
  description?: string;
  status?: "pending" | "in-progress" | "completed";
  dueDate: Date;
};
