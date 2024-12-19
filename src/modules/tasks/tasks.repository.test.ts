import { CreateTask } from "@/modules/tasks/types/create-task.type";
import { createMockMongooseModel, mockDate, mockObjectId } from "@/test/utils";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Task } from "./tasks.model";
import { TasksRepository } from "./tasks.repository";

vi.mock("./tasks.model", () => ({
  Task: createMockMongooseModel(),
}));

describe("TasksRepository", () => {
  let repository: TasksRepository;
  const userId = mockObjectId();
  const taskId = mockObjectId();
  const meetingId = mockObjectId();

  beforeEach(() => {
    repository = new TasksRepository();
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should get all tasks for a user", async () => {
      const mockTasks = [{ _id: taskId, userId }];
      vi.mocked(Task.find).mockResolvedValue(mockTasks);

      const result = await repository.getAll({ userId });

      expect(Task.find).toHaveBeenCalledWith({ userId });
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

      const mockSave = vi.fn().mockResolvedValue(mockTask);
      const mockTaskInstance = { save: mockSave };
      vi.mocked(Task).mockImplementation(() => mockTaskInstance as any);

      const result = await repository.createTask(taskInput);

      expect(result).toEqual(mockTask);
    });
  });

  describe("batchCreateTasks", () => {
    it("should create multiple tasks at once", async () => {
      const tasks: CreateTask[] = [
        {
          userId,
          meetingId: new Types.ObjectId(meetingId),
          title: "Task 1",
          description: "",
          status: "pending",
          dueDate: mockDate,
        },
        {
          userId,
          meetingId: new Types.ObjectId(meetingId),
          title: "Task 2",
          description: "",
          status: "pending",
          dueDate: mockDate,
        },
      ];
      const mockTasks = tasks.map((t, i) => ({ _id: `${taskId}-${i}`, ...t }));

      vi.mocked(Task.insertMany).mockResolvedValue(mockTasks as any);

      const result = await repository.batchCreateTasks(tasks);

      expect(Task.insertMany).toHaveBeenCalledWith(tasks);
      expect(result).toEqual(mockTasks);
    });
  });

  describe("updateTaskStatus", () => {
    it("should update task status", async () => {
      const status = "completed";
      const mockUpdatedTask = { _id: taskId, userId, status };

      vi.mocked(Task.findByIdAndUpdate).mockResolvedValue(mockUpdatedTask);

      const result = await repository.updateTaskStatus(taskId, status);

      expect(Task.findByIdAndUpdate).toHaveBeenCalledWith(
        taskId,
        { status },
        { new: true }
      );
      expect(result).toEqual(mockUpdatedTask);
    });
  });

  describe("getTaskStats", () => {
    it("should get task statistics", async () => {
      const mockStats = [
        { status: "pending", count: 5 },
        { status: "completed", count: 3 },
      ];

      vi.mocked(Task.aggregate).mockResolvedValue(mockStats);

      const result = await repository.getTaskStats(userId);

      expect(Task.aggregate).toHaveBeenCalledWith([
        { $match: { userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]);
      expect(result).toEqual(mockStats);
    });
  });

  describe("getOverdueTasksCount", () => {
    it("should get count of overdue tasks", async () => {
      const mockCount = 2;
      vi.mocked(Task.countDocuments).mockResolvedValue(mockCount);

      const result = await repository.getOverdueTasksCount(userId);

      expect(Task.countDocuments).toHaveBeenCalledWith({
        userId,
        status: "pending",
        dueDate: { $lt: expect.any(Date) },
      });
      expect(result).toBe(mockCount);
    });
  });
});
