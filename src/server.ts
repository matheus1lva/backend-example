import "reflect-metadata";
import "dotenv/config";
import "./config/container";
import app from "./app";
import { appConfig, Container } from "./config";
import { mongoConnect, mongoDisconnect } from "./database";
import { logger } from "./utils";
import type { Server } from "node:http";
import { RedisService } from "./modules/redis/redis.service";

let server: Server;

async function handleShutdown() {
  server.close(() => {
    logger.info("Server closed");
  });
  try {
    await mongoDisconnect();
    const redisService = Container.get(RedisService);
    await redisService.disconnect();
  } catch (err) {
    logger.error("Error disconnecting from MongoDB:", err);
  }
}

async function bootstrap() {
  try {
    await mongoConnect();
    server = app.listen(appConfig.PORT, () => {
      console.log(`Server is running on port ${appConfig.PORT}`);
    });
  } catch (err) {
    logger.error("failed to start server", err);
  }
}

bootstrap();

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
