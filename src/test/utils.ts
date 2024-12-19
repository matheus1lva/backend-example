import { vi } from "vitest";

export const createMockMongooseModel = () => {
  const model = vi.fn() as any;
  model.find = vi.fn().mockReturnThis();
  model.findOne = vi.fn().mockReturnThis();
  model.findOneAndUpdate = vi.fn().mockReturnThis();
  model.findByIdAndUpdate = vi.fn();
  model.insertMany = vi.fn();
  model.countDocuments = vi.fn();
  model.aggregate = vi.fn();
  model.exec = vi.fn();
  return model;
};

export const mockObjectId = () => "507f1f77bcf86cd799439011";

export const mockDate = new Date("2024-12-18T15:01:54-03:00");
