// @ts-nocheck

import { TaskNode } from '../../src/task/task-node';
import { ErrorHandlingStrategy } from '../../src/enum';
import type { AsyncMethod, iTaskxContext } from '../../src/task/type';

describe('TaskNode', () => {
  let taskNode: TaskNode;
  let mockProcess: AsyncMethod;
  let mockContext: iTaskxContext;
  let parentTask: TaskNode;
  let childTask: TaskNode;

  beforeEach(() => {
    // Create a mock async process function
    mockProcess = jest.fn().mockResolvedValue(undefined);
    
    // Create a mock context
    mockContext = {
      results: new Map(),
      completed: new Set(),
      errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    };
    
    // Create parent and child tasks for testing dependencies
    parentTask = new TaskNode(jest.fn().mockResolvedValue(undefined));
    childTask = new TaskNode(jest.fn().mockResolvedValue(undefined));
    
    // Create a new task node for each test
    taskNode = new TaskNode(mockProcess);
  });

  describe('constructor', () => {
    it('should create a task node with a process function', () => {
      const node = new TaskNode(mockProcess);
      expect(node).toBeDefined();
    });

    it('should create a task node with a process function and parents', () => {
      const node = new TaskNode(mockProcess, [parentTask]);
      expect(node.parents).toContain(parentTask);
      expect(node.parents).toHaveLength(1);
    });

    it('should initialize with empty next array', () => {
      expect(taskNode.next).toEqual([]);
    });

    it('should initialize with error flag set to false', () => {
      expect((taskNode as any).error).toBe(false);
    });
  });

  describe('dependOn', () => {
    it('should add parent tasks to the parents array', () => {
      taskNode.dependOn(parentTask);
      expect(taskNode.parents).toContain(parentTask);
    });

    it('should add this task to each parent\'s next array', () => {
      taskNode.dependOn(parentTask);
      expect(parentTask.next).toContain(taskNode);
    });

    it('should handle multiple parent tasks', () => {
      const parent2 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      taskNode.dependOn(parentTask, parent2);
      
      expect(taskNode.parents).toContain(parentTask);
      expect(taskNode.parents).toContain(parent2);
      expect(parentTask.next).toContain(taskNode);
      expect(parent2.next).toContain(taskNode);
    });

    it('should return itself for method chaining', () => {
      const result = taskNode.dependOn(parentTask);
      expect(result).toBe(taskNode);
    });

    it('should handle no parent tasks', () => {
      const result = taskNode.dependOn();
      expect(result).toBe(taskNode);
      expect(taskNode.parents).toHaveLength(0);
    });

    it('should handle duplicate parent tasks', () => {
      taskNode.dependOn(parentTask, parentTask);
      expect(taskNode.parents.filter(p => p === parentTask)).toHaveLength(2);
      expect(parentTask.next.filter(c => c === taskNode)).toHaveLength(2);
    });
  });

  describe('tryProcess', () => {
    it('should execute the process function if conditions are met', async () => {
      await taskNode.tryProcess(mockContext);
      expect(mockProcess).toHaveBeenCalledWith(mockContext);
    });

    it('should add the process to completed set', async () => {
      await taskNode.tryProcess(mockContext);
      expect(mockContext.completed.has(mockProcess)).toBe(true);
    });

    it('should mark itself as completed even if process throws', async () => {
      mockProcess.mockRejectedValue(new Error('Test error'));
      await taskNode.tryProcess(mockContext);
      expect(mockContext.completed.has(mockProcess)).toBe(true);
    });

    it('should set context.error if process throws', async () => {
      const error = new Error('Test error');
      mockProcess.mockRejectedValue(error);
      
      await taskNode.tryProcess(mockContext);
      expect(mockContext.error).toBe(error);
      expect((taskNode as any).error).toBe(true);
    });

    it('should not execute if already completed', async () => {
      mockContext.completed.add(mockProcess);
      mockProcess.mockClear();
      
      await taskNode.tryProcess(mockContext);
      expect(mockProcess).not.toHaveBeenCalled();
    });

    it('should not execute if parent is not completed', async () => {
      taskNode.dependOn(parentTask);
      mockProcess.mockClear();
      
      await taskNode.tryProcess(mockContext);
      expect(mockProcess).not.toHaveBeenCalled();
    });

    it('should execute if all parents are completed', async () => {
      taskNode.dependOn(parentTask);
      mockContext.completed.add(parentTask.process);
      
      await taskNode.tryProcess(mockContext);
      expect(mockProcess).toHaveBeenCalled();
    });

    it('should not execute if STOP_ALL strategy and context has error', async () => {
      mockContext.errorHandlingStrategy = ErrorHandlingStrategy.STOP_ALL;
      mockContext.error = new Error('Context error');
      mockProcess.mockClear();
      
      await taskNode.tryProcess(mockContext);
      expect(mockProcess).not.toHaveBeenCalled();
    });

    it('should not execute if STOP_DOWNSTREAM strategy and parent has error', async () => {
      mockContext.errorHandlingStrategy = ErrorHandlingStrategy.STOP_DOWNSTREAM;
      
      // Create a more realistic scenario with actual tasks
      const parentErrorProcess = jest.fn().mockResolvedValue(undefined);
      const parentWithError = new TaskNode(parentErrorProcess);
      const childNode = new TaskNode(mockProcess);
      
      // Establish the dependency
      childNode.dependOn(parentWithError);
      
      // Simulate an error in parent by actually executing it with a failing process
      parentErrorProcess.mockImplementation(async () => {
        throw new Error('Parent error');
      });
      
      // Set up context with STOP_DOWNSTREAM strategy
      await parentWithError.tryProcess(mockContext);
      expect(mockContext.error).toBeDefined();
      
      // Now check that child node won't execute due to parent error
      mockProcess.mockClear();
      await childNode.tryProcess(mockContext);
      expect(mockProcess).not.toHaveBeenCalled();
    });

    it('should execute if STOP_DOWNSTREAM strategy and parent has no error', async () => {
      mockContext.errorHandlingStrategy = ErrorHandlingStrategy.STOP_DOWNSTREAM;
      taskNode.dependOn(parentTask);
      mockContext.completed.add(parentTask.process);
      
      await taskNode.tryProcess(mockContext);
      expect(mockProcess).toHaveBeenCalled();
    });

    it('should process next tasks in parallel after successful execution', async () => {
      const nextTask1 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      const nextTask2 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      
      taskNode.next = [nextTask1, nextTask2];
      
      // Mock the tryProcess method to track calls
      nextTask1.tryProcess = jest.fn().mockResolvedValue(undefined);
      nextTask2.tryProcess = jest.fn().mockResolvedValue(undefined);
      
      await taskNode.tryProcess(mockContext);
      
      expect(nextTask1.tryProcess).toHaveBeenCalledWith(mockContext);
      expect(nextTask2.tryProcess).toHaveBeenCalledWith(mockContext);
    });

    it('should process next tasks even if current task throws', async () => {
      mockProcess.mockRejectedValue(new Error('Test error'));
      const nextTask = new TaskNode(jest.fn().mockResolvedValue(undefined));
      
      // Mock the tryProcess method to track calls
      nextTask.tryProcess = jest.fn().mockResolvedValue(undefined);
      
      taskNode.next = [nextTask];
      
      await taskNode.tryProcess(mockContext);
      
      expect(nextTask.tryProcess).toHaveBeenCalled();
    });
  });
});