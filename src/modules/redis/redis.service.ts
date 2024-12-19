import { Service } from "typedi";
import { createClient } from "redis";
import { appConfig } from "@/config/app.config";

@Service()
export class RedisService {
  private client;

  constructor() {
    this.client = createClient({
      url: appConfig.redisUrl,
    });

    this.client.on("error", (err) => console.error("Redis Client Error", err));
    this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<void> {
    await this.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async disconnect() {
    await this.client.disconnect();
  }
}
