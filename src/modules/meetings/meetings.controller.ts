import { httpErrors } from "@/utils";
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
      throw new httpErrors.InternalServerError("Error fetching meetings");
    }
  }

  async getMeetingById(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const meeting = await this.meetingsService.getMeetingById(
        userId,
        req.params.id
      );
      if (!meeting) {
        throw new httpErrors.NotFound("Meeting not found");
      }
      res.json(meeting);
    } catch (err) {
      throw new httpErrors.InternalServerError("Error fetching meeting");
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
      throw new httpErrors.InternalServerError("Error creating meeting");
    }
  }

  async updateTranscript(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const { transcript } = req.body;

      const meeting = await this.meetingsService.updateTranscript(
        userId,
        req.params.id,
        transcript
      );

      if (!meeting) {
        throw new httpErrors.NotFound("Meeting not found");
      }

      res.json(meeting);
    } catch (err) {
      throw new httpErrors.InternalServerError("Error updating transcript");
    }
  }

  async summarizeMeeting(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const meeting = await this.meetingsService.summarizeMeeting(
        userId,
        req.params.id
      );

      if (!meeting) {
        throw new httpErrors.NotFound("Meeting not found");
      }

      res.json(meeting);
    } catch (err) {
      throw new httpErrors.InternalServerError("Error summarizing meeting");
    }
  }

  async getMeetingStats(req: Request, res: Response) {
    try {
      const userId = req.userId;
      const stats = await this.meetingsService.getMeetingStats(userId);
      res.json(stats);
    } catch (err) {
      throw new httpErrors.InternalServerError("Error fetching meeting stats");
    }
  }
}
