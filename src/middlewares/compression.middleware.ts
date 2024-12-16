import { appConfig } from "@/config/app.config";
import compression from "compression";
import { type RequestHandler } from "express";

export const compressionMiddleware: RequestHandler = compression({
  filter: (req, res) => {
    if (
      req.headers["x-no-compression"] ||
      appConfig.APP_ENV === "development"
    ) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Default compression level
});
