// Test for type definitions in processor/type.ts
import type { iTaskProcessorConfig, iTaskProcessor, ProcessorFactory } from '../../src/processor/type';
import { ErrorHandlingStrategy } from '../../src/enum';
import type { iTask } from '../../src/task/type';
import type { iTaskxContext } from '../../src/task/type';

describe('Processor Type Definitions', () => {
  describe('iTaskProcessorConfig', () => {
    it('should accept empty config', () => {
      const config: iTaskProcessorConfig = {};
      expect(config).toBeDefined();
    });

    it('should accept config with STOP_ALL strategy', () => {
      const config: iTaskProcessorConfig = {
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
      };
      expect(config.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    });

    it('should accept config with STOP_DOWNSTREAM strategy', () => {
      const config: iTaskProcessorConfig = {
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
      };
      expect(config.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    });
  });

  describe('iTaskProcessor', () => {
    it('should define context getter', () => {
      // Create a mock implementation that matches the interface
      const mockProcessor: iTaskProcessor = {
        get context(): iTaskxContext {
          return {
            results: new Map(),
            completed: new Set(),
            errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
          };
        },
        process: jest.fn().mockResolvedValue(undefined)
      };

      expect(mockProcessor.context).toBeDefined();
      expect(mockProcessor.context.results).toBeDefined();
      expect(mockProcessor.context.completed).toBeDefined();
      expect(mockProcessor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    });

    it('should define process method', () => {
      const mockTask: iTask = {
        tryProcess: jest.fn().mockResolvedValue(undefined),
        dependOn: jest.fn().mockReturnThis()
      };

      const mockProcessor: iTaskProcessor = {
        get context(): iTaskxContext {
          return {
            results: new Map(),
            completed: new Set(),
            errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
          };
        },
        process: jest.fn().mockImplementation(async (tasks: iTask[]) => {
          // Simulate processing
          for (const task of tasks) {
            await task.tryProcess((this! as any).context);
          }
        })
      };

      expect(mockProcessor.process).toBeDefined();
      expect(typeof mockProcessor.process).toBe('function');
    });
  });

  describe('ProcessorFactory', () => {
    it('should be a function type that accepts config and returns processor', () => {
      const mockFactory: ProcessorFactory = (config: iTaskProcessorConfig): iTaskProcessor => {
        return {
          get context(): iTaskxContext {
            return {
              results: new Map(),
              completed: new Set(),
              errorHandlingStrategy: config?.errorHandlingStrategy || ErrorHandlingStrategy.STOP_ALL
            };
          },
          process: jest.fn().mockResolvedValue(undefined)
        };
      };

      expect(typeof mockFactory).toBe('function');

      const processor = mockFactory({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM });
      expect(processor).toBeDefined();
      expect(processor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_DOWNSTREAM);
    });

    it('should handle undefined config', () => {
      const mockFactory: ProcessorFactory = (config?: iTaskProcessorConfig): iTaskProcessor => {
        return {
          get context(): iTaskxContext {
            return {
              results: new Map(),
              completed: new Set(),
              errorHandlingStrategy: config?.errorHandlingStrategy || ErrorHandlingStrategy.STOP_ALL
            };
          },
          process: jest.fn().mockResolvedValue(undefined)
        };
      };
      // @ts-ignore
      const processor = mockFactory();
      expect(processor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
    });
  });
});