import { TaskProcessor, createContext } from './task-processor';
import { CircularDependencyError } from '../error/circular-dependency-error';
import { ErrorHandlingStrategy } from '../enum';
import { TaskNode } from '../task/task-node';
import * as utils from '../task/utils';
// import type { iTaskxContext } from '../task/type';

// Mock the utils functions to isolate testing
jest.mock('../task/utils');

describe('TaskProcessor', () => {
  let processor: TaskProcessor;
  let mockTasks: TaskNode[];
  // let mockContext: iTaskxContext;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a default processor for each test
    processor = new TaskProcessor();
    
    // Create mock tasks
    mockTasks = [
      new TaskNode(jest.fn()),
      new TaskNode(jest.fn())
    ];
    
    // Create a mock context
    // mockContext = {
    //   results: new Map(),
    //   completed: new Set(),
    //   errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    // };

    // Setup default mocks for utility functions
    (utils.getAllTasks as jest.Mock).mockReturnValue(mockTasks);
    (utils.getRootTasks as jest.Mock).mockReturnValue(mockTasks);
    (utils.hasCircularDependency as jest.Mock).mockReturnValue(false);
  });

  describe('constructor', () => {
    it('should create processor with default STOP_ALL strategy', () => {
      const defaultProcessor = new TaskProcessor();
      expect(defaultProcessor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    });

    it('should create processor with provided STOP_DOWNSTREAM strategy', () => {
      const customProcessor = new TaskProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
      });
      expect(customProcessor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    });

    it('should create processor with provided STOP_ALL strategy', () => {
      const customProcessor = new TaskProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      });
      expect(customProcessor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    });
  });

  describe('context property', () => {
    it('should return the context object', () => {
      const context = processor.context;
      expect(context).toBeDefined();
      expect(context.results).toBeDefined();
      expect(context.completed).toBeDefined();
      expect(context.errorHandlingStrategy).toBeDefined();
    });

    it('should return the same context instance', () => {
      const context1 = processor.context;
      const context2 = processor.context;
      expect(context1).toBe(context2);
    });
  });

  describe('process method', () => {
    it('should get all tasks and root tasks', async () => {
      await processor.process(mockTasks);
      
      expect(utils.getAllTasks).toHaveBeenCalledWith(mockTasks);
      expect(utils.getRootTasks).toHaveBeenCalled();
    });

    it('should process root tasks in parallel', async () => {
      const mockRootTasks = [
        { tryProcess: jest.fn().mockResolvedValue(undefined) },
        { tryProcess: jest.fn().mockResolvedValue(undefined) }
      ] as any;
      
      (utils.getRootTasks as jest.Mock).mockReturnValue(mockRootTasks);

      await processor.process(mockTasks);

      expect(mockRootTasks[0].tryProcess).toHaveBeenCalledWith(processor.context);
      expect(mockRootTasks[1].tryProcess).toHaveBeenCalledWith(processor.context);
    });

    it('should throw CircularDependencyError when circular dependency exists', async () => {
      (utils.hasCircularDependency as jest.Mock).mockReturnValue(true);

      await expect(processor.process(mockTasks)).rejects.toThrow(CircularDependencyError);
    });

    it('should re-throw context error if present after processing', async () => {
      const testError = new Error('Test error');
      processor.context.error = testError;

      await expect(processor.process(mockTasks)).rejects.toThrow('Test error');
    });

    it('should complete successfully when no errors', async () => {
      const result = processor.process(mockTasks);
      await expect(result).resolves.toBeUndefined();
    });

    it('should handle error with STOP_DOWNSTREAM strategy', async () => {
      const customProcessor = new TaskProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
      });

      const result = customProcessor.process(mockTasks);
      await expect(result).resolves.toBeUndefined();
    });

    it('should handle empty task list', async () => {
      (utils.getAllTasks as jest.Mock).mockReturnValue([]);
      (utils.getRootTasks as jest.Mock).mockReturnValue([]);

      const result = processor.process([]);
      await expect(result).resolves.toBeUndefined();
    });
  });

  describe('context creation', () => {
    it('should create context with correct default values', () => {
      const customProcessor = new TaskProcessor();
      const context = customProcessor.context;
      
      expect(context.results).toBeInstanceOf(Map);
      expect(context.results.size).toBe(0);
      expect(context.completed).toBeInstanceOf(Set);
      expect(context.completed.size).toBe(0);
      expect(context.error).toBeUndefined();
      expect(context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    });
  });
});

describe('createContext function', () => {
  it('should create context with STOP_ALL strategy', () => {
    const context = createContext(ErrorHandlingStrategy.STOP_ALL);
    
    expect(context.results).toBeInstanceOf(Map);
    expect(context.completed).toBeInstanceOf(Set);
    expect(context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    expect(context.error).toBeUndefined();
  });

  it('should create context with STOP_DOWNSTREAM strategy', () => {
    const context = createContext(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    
    expect(context.results).toBeInstanceOf(Map);
    expect(context.completed).toBeInstanceOf(Set);
    expect(context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    expect(context.error).toBeUndefined();
  });

  it('should create new instances on each call', () => {
    const context1 = createContext(ErrorHandlingStrategy.STOP_ALL);
    const context2 = createContext(ErrorHandlingStrategy.STOP_ALL);
    
    expect(context1).not.toBe(context2);
    expect(context1.results).not.toBe(context2.results);
    expect(context1.completed).not.toBe(context2.completed);
  });
});