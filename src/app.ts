import {
  authMiddleware,
  compressionMiddleware,
  jsonParserMiddleware,
  loggerMiddleware,
  rateLimitMiddleware,
  securityMiddleware,
  urlencodedMiddleware,
} from "@/middlewares";
import express from "express";
import { dashboardRoutes } from "./routes/dashboardRoutes.js";
import { meetingRoutes } from "./routes/meetings.js";
import { taskRoutes } from "./routes/task.router.js";

const app = express();

// Security middlewares first
app.use(securityMiddleware);
app.use(rateLimitMiddleware);

// Request processing middlewares
app.use(compressionMiddleware);
app.use(jsonParserMiddleware);
app.use(urlencodedMiddleware);

// Logging middleware
app.use(loggerMiddleware);

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the MeetingBot API" });
});

app.use("/api/meetings", authMiddleware, meetingRoutes);
app.use("/api/tasks", authMiddleware, taskRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

export default app;
