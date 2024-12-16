import { logger } from "@/utils/logger";
import mongoose from "mongoose";

export async function mongoConnect() {
  try {
    await mongoose.connect("mongodb://localhost:27017/meetingbot");
  } catch (err) {
    logger.error("Error connecting to MongoDB:", err);
  }
}

export async function mongoDisconnect() {
  try {
    await mongoose.disconnect();
  } catch (err) {
    logger.error("Error disconnecting from MongoDB:", err);
  }
}
