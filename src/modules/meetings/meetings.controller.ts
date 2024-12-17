import type { Request, Response } from "express";
import { Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { MeetingsService } from "./meetings.service";

@Service()
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly authService: AuthService
  ) {}

  async getMeetings(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const meetings = await this.meetingsService.getMeetings(userId);
      res.json(meetings);
    } catch (err) {
      res.status(500).json({ message: "Error fetching meetings" });
    }
  }

  async getMeetingById(req: Request, res: Response) {
    try {
      const { userId } = this.authService.verifyToken(
        req.headers.authorization as string
      );
      const meeting = await this.meetingsService.getMeetingById(
        userId,
        req.params.id
      );
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (err) {
      res.status(500).json({ message: "Error fetching meeting" });
    }
  }

  async createMeeting(req: Request, res: Response) {
    try {
      const { userId } = this.authService.verifyToken(
        req.headers.authorization as string
      );
      const { title, date, participants } = req.body;

      if (!title || !date || !participants) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const meeting = await this.meetingsService.createMeeting(
        userId,
        title,
        new Date(date),
        participants
      );
      res.status(201).json(meeting);
    } catch (err) {
      res.status(500).json({ message: "Error creating meeting" });
    }
  }

  async updateTranscript(req: Request, res: Response) {
    try {
      const { userId } = this.authService.verifyToken(
        req.headers.authorization as string
      );
      const { transcript } = req.body;

      if (!transcript) {
        return res.status(400).json({ message: "Transcript is required" });
      }

      const meeting = await this.meetingsService.updateTranscript(
        userId,
        req.params.id,
        transcript
      );

      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(meeting);
    } catch (err) {
      res.status(500).json({ message: "Error updating transcript" });
    }
  }

  async summarizeMeeting(req: Request, res: Response) {
    try {
      const { userId } = this.authService.verifyToken(
        req.headers.authorization as string
      );
      const meeting = await this.meetingsService.summarizeMeeting(
        userId,
        req.params.id
      );

      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      res.json(meeting);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: "Error summarizing meeting" });
      }
    }
  }

  async getMeetingStats(req: Request, res: Response) {
    try {
      const { userId } = this.authService.verifyToken(
        req.headers.authorization as string
      );
      const stats = await this.meetingsService.getMeetingStats(userId);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Error fetching meeting stats" });
    }
  }
}
