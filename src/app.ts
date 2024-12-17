import {
  authMiddleware,
  compressionMiddleware,
  jsonParserMiddleware,
  loggerMiddleware,
  rateLimitMiddleware,
  securityMiddleware,
  urlencodedMiddleware,
} from "@/middlewares";
import { dashboardRoutes } from "@/modules/dashboard/dashboard.router";
import { meetingRoutes } from "@/modules/meetings/meetings.router";
import { taskRoutes } from "@/modules/tasks/tasks.router";
import express from "express";

const app = express();

app.use(securityMiddleware);
app.use(rateLimitMiddleware);
app.use(compressionMiddleware);
app.use(jsonParserMiddleware);
app.use(urlencodedMiddleware);
app.use(loggerMiddleware);

app.use(authMiddleware);
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the MeetingBot API" });
});

app.use("/api/meetings", meetingRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
