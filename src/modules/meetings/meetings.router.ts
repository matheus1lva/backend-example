import { createMeetingSchema } from "./schemas/create-meeting-input.schema";
import { updateTranscriptSchema } from "./schemas/update-transcript.schema";
import express from "express";
import { Container } from "typedi";
import { validateRequestBody } from "zod-express-middleware";
import { MeetingsController } from "./meetings.controller";

const router = express.Router();
const meetingsController = Container.get(MeetingsController);

router.get("/", (req, res) => {
  return meetingsController.getMeetings(req, res);
});

router.get("/stats", (req, res) => {
  meetingsController.getMeetingStats(req, res);
});

router.get("/:id", async (req, res) => {
  meetingsController.getMeetingById(req, res);
});

router.post("/", validateRequestBody(createMeetingSchema), (req, res) => {
  meetingsController.createMeeting(req, res);
});

router.put(
  "/:id/transcript",
  validateRequestBody(updateTranscriptSchema),
  (req, res) => {
    meetingsController.updateTranscript(req, res);
  }
);

router.post("/:id/summarize", (req, res) => {
  meetingsController.summarizeMeeting(req, res);
});

export { router as meetingRoutes };
