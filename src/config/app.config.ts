type AppEnv = "development" | "production" | "staging";
export interface AppConfig {
  APP_ENV: AppEnv;
  PORT: number;
  DATABASE_URL: string;
  LOG_LEVEL: string;
  rateLimit: {
    windowMs: number;
    limit: number;
  };
}

export const appConfig: AppConfig = {
  APP_ENV: (process.env.APP_ENV ?? "development") as AppEnv,
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  DATABASE_URL:
    process.env.DATABASE_URL || "mongodb://localhost:27017/meetingbot",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    limit: 100,
  },
};
