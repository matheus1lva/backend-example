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
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

app.use(securityMiddleware);
app.use(rateLimitMiddleware);
app.use(compressionMiddleware);
app.use(jsonParserMiddleware);
app.use(urlencodedMiddleware);
app.use(loggerMiddleware);

// Swagger Documentation
app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authMiddleware);
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the MeetingBot API" });
});

app.use("/api/meetings", meetingRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
