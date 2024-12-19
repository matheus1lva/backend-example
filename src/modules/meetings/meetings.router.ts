import { createMeetingSchema } from "@/modules/meetings/schemas/create-meeting-input.schema";
import { updateTranscriptSchema } from "@/modules/meetings/schemas/update-transcript.schema";
import express from "express";
import { Container } from "typedi";
import { validateRequestBody } from "zod-express-middleware";
import { MeetingsController } from "./meetings.controller";

const router = express.Router();
const meetingsController = Container.get(MeetingsController);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: Get all meetings
 *     description: Retrieve a list of meetings for the authenticated user
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of meetings
 *       500:
 *         description: Server error
 */
router.get("/", (req, res) => {
  return meetingsController.getMeetings(req, res);
});

/**
 * @swagger
 * /api/meetings/stats:
 *   get:
 *     summary: Get meeting statistics
 *     description: Get statistics about meetings for the authenticated user
 *     responses:
 *       200:
 *         description: Meeting statistics
 *       500:
 *         description: Server error
 */
router.get("/stats", (req, res) => {
  meetingsController.getMeetingStats(req, res);
});

/**
 * @swagger
 * /api/meetings/{id}:
 *   get:
 *     summary: Get meeting by ID
 *     description: Retrieve a specific meeting by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting details
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  meetingsController.getMeetingById(req, res);
});

/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Create a new meeting
 *     description: Create a new meeting with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - participants
 *             properties:
 *               title:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Meeting created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", validateRequestBody(createMeetingSchema), (req, res) => {
  meetingsController.createMeeting(req, res);
});

/**
 * @swagger
 * /api/meetings/{id}/transcript:
 *   put:
 *     summary: Update meeting transcript
 *     description: Update the transcript of a specific meeting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transcript
 *             properties:
 *               transcript:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transcript updated successfully
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:id/transcript",
  validateRequestBody(updateTranscriptSchema),
  (req, res) => {
    meetingsController.updateTranscript(req, res);
  }
);

/**
 * @swagger
 * /api/meetings/{id}/summarize:
 *   post:
 *     summary: Generate meeting summary
 *     description: Generate a summary and action items for a specific meeting
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meeting ID
 *     responses:
 *       200:
 *         description: Meeting summarized successfully
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Server error
 */
router.post("/:id/summarize", (req, res) => {
  meetingsController.summarizeMeeting(req, res);
});

export { router as meetingRoutes };
