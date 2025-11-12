import { registerTask } from './index';
import { TaskNode } from './task-node';
import type { AsyncMethod, iTask } from './type';

// Mock TaskNode to isolate the factory function
jest.mock('./task-node', () => ({
  TaskNode: jest.fn().mockImplementation((process: AsyncMethod, parents?: iTask[]) => ({
    process,
    parents: parents || [],
    tryProcess: jest.fn().mockResolvedValue(undefined),
    dependOn: jest.fn().mockReturnThis(),
    next: [],
    error: false
  }))
}));

describe('registerTask', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a TaskNode with the provided process function', () => {
    const mockProcess: AsyncMethod = jest.fn().mockResolvedValue(undefined);
    const task = registerTask(mockProcess);
    
    expect(TaskNode).toHaveBeenCalledWith(mockProcess);
    expect(task).toBeDefined();
  });

  it('should return an object that implements iTask interface', () => {
    const mockProcess: AsyncMethod = jest.fn().mockResolvedValue(undefined);
    const task = registerTask(mockProcess) as iTask;
    
    expect(task.tryProcess).toBeDefined();
    expect(typeof task.tryProcess).toBe('function');
    expect(task.dependOn).toBeDefined();
    expect(typeof task.dependOn).toBe('function');
  });

  // it('should pass through different process functions', () => {
  //   const mockProcess1: AsyncMethod = jest.fn().mockResolvedValue(undefined);
  //   const mockProcess2: AsyncMethod = jest.fn().mockResolvedValue(undefined);
        
  //   expect(TaskNode).toHaveBeenCalledTimes(2);
  //   expect(TaskNode).toHaveBeenNthCalledWith(1, mockProcess1);
  //   expect(TaskNode).toHaveBeenNthCalledWith(2, mockProcess2);
  // });

  // it('should work with async function returning a value', async () => {
  //   const mockProcess: AsyncMethod = jest.fn().mockResolvedValue({ result: 'success' });
   
  //   expect(TaskNode).toHaveBeenCalledWith(mockProcess);
  // });

  // it('should work with async function that throws an error', async () => {
  //   const mockProcess: AsyncMethod = jest.fn().mockRejectedValue(new Error('Test error'));
   
  //   expect(TaskNode).toHaveBeenCalledWith(mockProcess);
  // });
});