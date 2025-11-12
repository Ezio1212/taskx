// @ts-nocheck

// Test for type definitions in task/type.ts
import type { AsyncMethod, iTask, iTaskxContext } from '../../src/task/type';
import { ErrorHandlingStrategy } from '../../src/enum';

describe('Task Type Definitions', () => {
  describe('iTaskxContext', () => {
    it('should define a valid context object', () => {
      const mockProcess: AsyncMethod = jest.fn().mockResolvedValue(undefined);
      const context: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };

      expect(context.results).toBeInstanceOf(Map);
      expect(context.completed).toBeInstanceOf(Set);
      expect(context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
      expect(context.error).toBeUndefined();
    });

    it('should allow setting error property', () => {
      const error = new Error('Test error');
      const context: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL,
        error
      };

      expect(context.error).toBe(error);
    });

    it('should allow results with AsyncMethod keys', () => {
      const mockProcess: AsyncMethod = jest.fn().mockResolvedValue(undefined);
      const context: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };

      context.results.set(mockProcess, { result: 'success' });
      expect(context.results.get(mockProcess)).toEqual({ result: 'success' });
    });

    it('should allow completed with AsyncMethod entries', () => {
      const mockProcess: AsyncMethod = jest.fn().mockResolvedValue(undefined);
      const context: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };

      context.completed.add(mockProcess);
      expect(context.completed.has(mockProcess)).toBe(true);
    });

    it('should support both error handling strategies', () => {
      const context1: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };

      const context2: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
      };

      expect(context1.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
      expect(context2.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    });
  });

  describe('AsyncMethod', () => {
    it('should define a function that takes context and returns Promise', () => {
      const asyncMethod: AsyncMethod = async (context: iTaskxContext) => {
        // Implementation is not important for type checking
        context.results.set(asyncMethod, 'success');
      };

      expect(typeof asyncMethod).toBe('function');
    });

    it('should handle different return types', async () => {
      const asyncMethodVoid: AsyncMethod = async (context) => {
        // No return value
      };

      const asyncMethodValue: AsyncMethod = async (context) => {
        return { result: 'value' };
      };

      const mockContext: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };

      expect(asyncMethodVoid(mockContext)).resolves.toBeUndefined();
      expect(asyncMethodValue(mockContext)).resolves.toEqual({ result: 'value' });
    });

    it('should handle async function that throws', async () => {
      const asyncMethodError: AsyncMethod = async (context) => {
        throw new Error('Test error');
      };

      const mockContext: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };

      expect(asyncMethodError(mockContext)).rejects.toThrow('Test error');
    });
  });

  describe('iTask', () => {
    it('should define a valid task object', () => {
      const mockTryProcess = jest.fn().mockResolvedValue(undefined);
      const mockDependOn = jest.fn().mockReturnThis();
      
      const task: iTask = {
        tryProcess: mockTryProcess,
        dependOn: mockDependOn
      };

      expect(task.tryProcess).toBeDefined();
      expect(typeof task.tryProcess).toBe('function');
      expect(task.dependOn).toBeDefined();
      expect(typeof task.dependOn).toBe('function');
    });

    it('should accept iTask parameters for dependOn', () => {
      const mockTryProcess = jest.fn().mockResolvedValue(undefined);
      const mockDependOn = jest.fn().mockReturnThis();
      
      const task: iTask = {
        tryProcess: mockTryProcess,
        dependOn: mockDependOn
      };

      const parentTask: iTask = {
        tryProcess: jest.fn().mockResolvedValue(undefined),
        dependOn: jest.fn().mockReturnThis()
      };

      task.dependOn(parentTask);
      expect(mockDependOn).toHaveBeenCalledWith(parentTask);
    });

    it('should accept multiple iTask parameters for dependOn', () => {
      const mockTryProcess = jest.fn().mockResolvedValue(undefined);
      const mockDependOn = jest.fn().mockReturnThis();
      
      const task: iTask = {
        tryProcess: mockTryProcess,
        dependOn: mockDependOn
      };

      const parentTask1: iTask = {
        tryProcess: jest.fn().mockResolvedValue(undefined),
        dependOn: jest.fn().mockReturnThis()
      };

      const parentTask2: iTask = {
        tryProcess: jest.fn().mockResolvedValue(undefined),
        dependOn: jest.fn().mockReturnThis()
      };

      task.dependOn(parentTask1, parentTask2);
      expect(mockDependOn).toHaveBeenCalledWith(parentTask1, parentTask2);
    });

    it('should support method chaining with dependOn', () => {
      const mockTryProcess = jest.fn().mockResolvedValue(undefined);
      const mockDependOn = jest.fn().mockReturnThis();
      
      const task: iTask = {
        tryProcess: mockTryProcess,
        dependOn: mockDependOn
      };

      const parentTask: iTask = {
        tryProcess: jest.fn().mockResolvedValue(undefined),
        dependOn: jest.fn().mockReturnThis()
      };

      const result = task.dependOn(parentTask);
      expect(result).toBe(task);
    });
  });
});