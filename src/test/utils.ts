import { vi } from 'vitest';

export const createMockMongooseModel = () => {
  return {
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    save: vi.fn(),
    countDocuments: vi.fn(),
    aggregate: vi.fn(),
  };
};

export const mockObjectId = () => 'mock-id-123';

export const mockDate = new Date('2024-12-18T15:01:54-03:00');
