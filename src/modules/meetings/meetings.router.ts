import express from "express";
import { Container } from "typedi";
import { MeetingsController } from "./meetings.controller";

const router = express.Router();
const meetingsController = Container.get(MeetingsController);

// Get all meetings
router.get("/", (req, res) => {
  return meetingsController.getMeetings(req, res);
});

// Get meeting stats
router.get("/stats", (req, res) => {
  meetingsController.getMeetingStats(req, res);
});

// Get meeting by ID
router.get("/:id", async (req, res) => {
  meetingsController.getMeetingById(req, res);
});

// Create new meeting
router.post("/", (req, res) => {
  meetingsController.createMeeting(req, res);
});

// Update meeting transcript
router.put("/:id/transcript", (req, res) => {
  meetingsController.updateTranscript(req, res);
});

// Generate meeting summary and action items
router.post("/:id/summarize", (req, res) => {
  meetingsController.summarizeMeeting(req, res);
});

export { router as meetingRoutes };
