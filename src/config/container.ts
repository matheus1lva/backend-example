import "reflect-metadata";
import { Container } from "typedi";
import { DashboardService } from "@/modules/dashboard/dashboard.service";
import { DashboardController } from "@/modules/dashboard/dashboard.controller";
import { MeetingsRepository } from "@/modules/meetings/meetings.repository";
import { TasksRepository } from "@/modules/tasks/tasks.repository";
import { MeetingsService } from "@/modules/meetings/meetings.service";
import { MeetingsController } from "@/modules/meetings/meetings.controller";
import { TasksService } from "@/modules/tasks/tasks.service";
import { TasksController } from "@/modules/tasks/tasks.controller";
import { AuthService } from "@/modules/auth/auth.service";
import { AiService } from "@/modules/ai/ai.service";
import { RedisService } from "@/modules/redis/redis.service";

// Repositories
Container.set(MeetingsRepository, new MeetingsRepository());
Container.set(TasksRepository, new TasksRepository());

// Services
Container.set(AuthService, new AuthService());
Container.set(AiService, new AiService());
Container.set(TasksService, new TasksService(Container.get(TasksRepository)));
Container.set(RedisService, new RedisService());

Container.set(
  MeetingsService,
  new MeetingsService(
    Container.get(TasksService),
    Container.get(AiService),
    Container.get(MeetingsRepository)
  )
);

Container.set(
  DashboardService,
  new DashboardService(
    Container.get(MeetingsRepository),
    Container.get(TasksRepository),
    Container.get(RedisService)
  )
);

// Controllers
Container.set(
  TasksController,
  new TasksController(Container.get(TasksService))
);

Container.set(
  MeetingsController,
  new MeetingsController(
    Container.get(MeetingsService),
    Container.get(AuthService)
  )
);

Container.set(
  DashboardController,
  new DashboardController(Container.get(DashboardService))
);

export { Container };
