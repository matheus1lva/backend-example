import winston from "winston";
import { appConfig } from "../config/app.config";

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...keys }) => {
  const keysString =
    Object.keys(keys).length > 0 ? `\n${JSON.stringify(keys, null, 2)}` : "";
  return `${timestamp} [${level}]: ${message}${keysString}`;
});

const PRODUCTION_TRANSPORTS = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: "logs/error.log", level: "error" }),
  new winston.transports.File({ filename: "logs/combined.log" }),
];

export const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: winston.format.json(),
  transports: PRODUCTION_TRANSPORTS,
  exceptionHandlers: appConfig.APP_ENV === "production" && [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: appConfig.APP_ENV === "production" && [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

if (appConfig.APP_ENV === "development") {
  for (const transport of PRODUCTION_TRANSPORTS) {
    logger.remove(transport);
  }
  logger.add(
    new winston.transports.Console({
      level: "http",
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        colorize(),
        customFormat
      ),
    })
  );
}
