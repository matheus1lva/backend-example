import type { Request, Response } from "express";
import { Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { MeetingsService } from "./meetings.service";
import { logger } from "@/utils";

@Service()
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly authService: AuthService
  ) {}

  async getMeetings(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.meetingsService.getMeetings(
        userId,
        page,
        limit
      );

      res.json(result);
    } catch (err) {
      logger.error("Error fetching meetings", {
        userId: req.userId,
        error: err,
      });
      res.status(500).json({ error: "Error fetching meetings" });
    }
  }

  async getMeetingById(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;

      const meeting = await this.meetingsService.getMeetingById(
        meetingId,
        userId
      );

      if (!meeting) {
        logger.warn("Meeting not found", { userId, meetingId });
        return res.status(404).json({ error: "Meeting not found" });
      }

      res.json(meeting);
    } catch (err) {
      logger.error("Error fetching meeting", {
        userId: req.userId,
        meetingId: req.params.id,
        error: err,
      });
      res.status(500).json({ error: "Error fetching meeting" });
    }
  }

  async createMeeting(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { title, date, participants } = req.body;

      const meeting = await this.meetingsService.createMeeting(
        userId,
        title,
        new Date(date),
        participants
      );

      res.status(201).json(meeting);
    } catch (err) {
      logger.error("Error creating meeting", {
        userId: req.userId,
        title: req.body.title,
        error: err,
      });
      res.status(500).json({ error: "Error creating meeting" });
    }
  }

  async updateTranscript(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;
      const { transcript } = req.body;

      if (!transcript) {
        logger.warn("Missing transcript in request", { userId, meetingId });
        return res.status(400).json({ error: "Transcript is required" });
      }

      const meeting = await this.meetingsService.updateTranscript(
        userId,
        meetingId,
        transcript
      );

      if (!meeting) {
        logger.warn("Meeting not found for transcript update", {
          userId,
          meetingId,
        });
        return res.status(404).json({ error: "Meeting not found" });
      }

      res.json(meeting);
    } catch (err) {
      logger.error("Error updating transcript", {
        userId: req.userId,
        meetingId: req.params.id,
        error: err,
      });
      res.status(500).json({ error: "Error updating transcript" });
    }
  }

  async summarizeMeeting(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const meetingId = req.params.id;

      const meeting = await this.meetingsService.summarizeMeeting(
        userId,
        meetingId
      );

      if (!meeting) {
        logger.warn("Meeting not found for summarization", {
          userId,
          meetingId,
        });
        return res.status(404).json({ error: "Meeting not found" });
      }

      res.json(meeting);
    } catch (err) {
      logger.error("Error summarizing meeting", {
        userId: req.userId,
        meetingId: req.params.id,
        error: err,
      });
      res.status(500).json({ error: "Error summarizing meeting" });
    }
  }

  async getMeetingStats(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const stats = await this.meetingsService.getMeetingStats(userId);
      res.json(stats);
    } catch (err) {
      logger.error("Error fetching meeting stats", {
        userId: req.userId,
        error: err,
      });
      res.status(500).json({ error: "Error fetching meeting stats" });
    }
  }
}
