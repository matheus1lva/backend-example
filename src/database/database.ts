import { logger } from "../utils/logger";
import mongoose from "mongoose";
import { appConfig } from "../config/app.config";

export async function mongoConnect() {
  try {
    await mongoose.connect(appConfig.DATABASE_URL);
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
