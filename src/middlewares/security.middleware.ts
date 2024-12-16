import { type RequestHandler } from "express";
import helmet from "helmet";

export const securityMiddleware: RequestHandler = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
  },
});
