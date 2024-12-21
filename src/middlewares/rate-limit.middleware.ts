import { appConfig } from "../config/app.config";
import { logger } from "../utils";
import rateLimit from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  limit: appConfig.rateLimit.limit,
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: "Too Many Requests",
      message: options.message,
    });
  },
});
