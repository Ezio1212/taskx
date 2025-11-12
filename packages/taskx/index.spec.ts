// @ts-nocheck

// Test for src/index.ts - the main entry point
import {
  useProcessor,
  registerTask,
  ErrorHandlingStrategy,
  CircularDependencyError,
  AsyncMethod,
  iTaskxContext,
  iTask,
  iTaskProcessor,
  iTaskProcessorConfig
} from '.';

import { TaskProcessor } from './processor/task-processor';
import { TaskNode } from './task/task-node';

// Mock the modules to isolate testing
jest.mock('./processor/task-processor', () => ({
  TaskProcessor: jest.fn().mockImplementation((config) => ({
    config,
    context: {
      results: new Map(),
      completed: new Set(),
      errorHandlingStrategy: config?.errorHandlingStrategy || ErrorHandlingStrategy.STOP_ALL
    }
  }))
}));

jest.mock('./task/task-node', () => ({
  TaskNode: jest.fn().mockImplementation((process) => ({
    process,
    tryProcess: jest.fn().mockResolvedValue(undefined),
    dependOn: jest.fn().mockReturnThis(),
    next: [],
    error: false
  }))
}));

describe('Main Entry Point', () => {
  describe('Exports', () => {
    it('should export useProcessor function', () => {
      expect(useProcessor).toBeDefined();
      expect(typeof useProcessor).toBe('function');
    });

    it('should export registerTask function', () => {
      expect(registerTask).toBeDefined();
      expect(typeof registerTask).toBe('function');
    });

    it('should export ErrorHandlingStrategy enum', () => {
      expect(ErrorHandlingStrategy).toBeDefined();
      expect(ErrorHandlingStrategy.STOP_ALL).toBe('stop-all');
      expect(ErrorHandlingStrategy.STOP_DOWNSTREAM).toBe('stop-downstream');
    });

    it('should export CircularDependencyError class', () => {
      expect(CircularDependencyError).toBeDefined();
      expect(typeof CircularDependencyError).toBe('function');
      expect(new CircularDependencyError()).toBeInstanceOf(Error);
    });
  });

  describe('Type Exports', () => {
    it('should export AsyncMethod type', () => {
      const asyncMethod: AsyncMethod = jest.fn().mockResolvedValue(undefined);
      expect(typeof asyncMethod).toBe('function');
    });

    it('should export iTaskxContext type', () => {
      const context: iTaskxContext = {
        results: new Map(),
        completed: new Set(),
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };
      expect(context.results).toBeDefined();
      expect(context.completed).toBeDefined();
      expect(context.errorHandlingStrategy).toBeDefined();
    });

    it('should export iTask type', () => {
      const task: iTask = {
        tryProcess: jest.fn().mockResolvedValue(undefined),
        dependOn: jest.fn().mockReturnThis()
      };
      expect(task.tryProcess).toBeDefined();
      expect(task.dependOn).toBeDefined();
    });

    it('should export iTaskProcessor type', () => {
      const processor: iTaskProcessor = {
        get context(): iTaskxContext {
          return {
            results: new Map(),
            completed: new Set(),
            errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
          };
        },
        process: jest.fn().mockResolvedValue(undefined)
      };
      expect(processor.context).toBeDefined();
      expect(processor.process).toBeDefined();
    });

    it('should export iTaskProcessorConfig type', () => {
      const config: iTaskProcessorConfig = {
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
      };
      expect(config.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    });
  });


  describe('CircularDependencyError', () => {
    it('should create an error with correct properties', () => {
      const error = new CircularDependencyError();
      
      expect(error.name).toBe('CircularDependencyError');
      expect(error.message).toBe('Circular Dependency Error');
    });
  });

  describe('ErrorHandlingStrategy', () => {
    it('should have correct values', () => {
      expect(ErrorHandlingStrategy.STOP_ALL).toBe('stop-all');
      expect(ErrorHandlingStrategy.STOP_DOWNSTREAM).toBe('stop-downstream');
    });
  });
});