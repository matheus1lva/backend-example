import { mockDate, mockObjectId } from "@/test/utils";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TasksService } from "./tasks.service";
import { ITask } from "@/modules/tasks/tasks.model";

describe("TasksService", () => {
  let service: TasksService;
  let mockTasksRepository: any;

  const userId = mockObjectId();
  const taskId = mockObjectId();
  const meetingId = mockObjectId();

  beforeEach(() => {
    mockTasksRepository = {
      getAll: vi.fn(),
      createTask: vi.fn(),
      batchCreateTasks: vi.fn(),
      updateTaskStatus: vi.fn(),
      getTaskStats: vi.fn(),
      getOverdueTasksCount: vi.fn(),
    };

    service = new TasksService(mockTasksRepository);
  });

  describe("getTasks", () => {
    it("should get all tasks for a user", async () => {
      const mockTasks = [{ _id: taskId, userId }];
      mockTasksRepository.getAll.mockResolvedValue(mockTasks);

      const result = await service.getTasks(userId);

      expect(mockTasksRepository.getAll).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(mockTasks);
    });
  });

  describe("createTask", () => {
    it("should create a new task", async () => {
      const taskInput = {
        userId,
        meetingId: new Types.ObjectId(meetingId),
        title: "Test Task",
        dueDate: mockDate,
      };
      const mockTask = { _id: taskId, ...taskInput };

      mockTasksRepository.createTask.mockResolvedValue(mockTask);

      const result = await service.createTask(
        taskInput.userId,
        taskInput.meetingId,
        taskInput.title,
        taskInput.dueDate
      );

      expect(mockTasksRepository.createTask).toHaveBeenCalledWith(taskInput);
      expect(result).toEqual(mockTask);
    });
  });

  describe("createTasksFromActionItems", () => {
    it("should create multiple tasks from action items", async () => {
      const actionItems = ["Task 1", "Task 2"];
      const mockTasks = actionItems.map((title, i) => ({
        _id: `${taskId}-${i}`,
        userId,
        meetingId,
        title,
        dueDate: expect.any(Date),
      }));

      mockTasksRepository.batchCreateTasks.mockResolvedValue(mockTasks);

      const result = await service.createTasksFromActionItems(
        userId,
        meetingId,
        actionItems
      );

      expect(mockTasksRepository.batchCreateTasks).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);

      // Verify that due date is set to 1 week from now
      const tasks = mockTasksRepository.batchCreateTasks.mock.calls[0][0];
      tasks.forEach((task: ITask) => {
        const dueDate = new Date(task.dueDate);
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        expect(dueDate.getDate()).toBe(oneWeekFromNow.getDate());
      });
    });
  });

  describe("updateTaskStatus", () => {
    it("should update task status", async () => {
      const status = "completed";
      const mockUpdatedTask = { _id: taskId, userId, status };

      mockTasksRepository.updateTaskStatus.mockResolvedValue(mockUpdatedTask);

      const result = await service.updateTaskStatus(taskId, status);

      expect(mockTasksRepository.updateTaskStatus).toHaveBeenCalledWith(
        taskId,
        status
      );
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe("getTaskStats", () => {
    it("should get task statistics", async () => {
      const mockStats = {
        total: 8,
        completed: 3,
        pending: 5,
        overdue: 2,
      };

      mockTasksRepository.getTaskStats.mockResolvedValue([
        { status: "pending", count: 5 },
        { status: "completed", count: 3 },
      ]);
      mockTasksRepository.getOverdueTasksCount.mockResolvedValue(2);

      const result = await service.getTaskStats(userId);

      expect(mockTasksRepository.getTaskStats).toHaveBeenCalledWith(userId);
      expect(mockTasksRepository.getOverdueTasksCount).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(mockStats);
    });
  });
});
