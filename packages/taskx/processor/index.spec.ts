import { useProcessor } from '.';
import { TaskProcessor } from './task-processor';
import type { iTaskProcessorConfig } from './type';
import type { iTaskProcessor } from './type';
import { ErrorHandlingStrategy } from '../enum';

// Mock TaskProcessor to isolate the factory function
jest.mock('./task-processor', () => ({
  TaskProcessor: jest.fn().mockImplementation((config) => ({
    config,
    context: {
      results: new Map(),
      completed: new Set(),
      errorHandlingStrategy: config?.errorHandlingStrategy || ErrorHandlingStrategy.STOP_ALL
    }
  }))
}));

describe('useProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a TaskProcessor instance with provided config', () => {
    const config: iTaskProcessorConfig = {
      errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
    };
    
    const processor = useProcessor(config);
    
    expect(TaskProcessor).toHaveBeenCalledWith(config);
    expect(processor).toBeDefined();
  });

  it('should create a TaskProcessor instance with empty config', () => {
    const config: iTaskProcessorConfig = {};
    
    const processor = useProcessor(config);
    
    expect(TaskProcessor).toHaveBeenCalledWith(config);
    expect(processor).toBeDefined();
  });

  it('should return an instance that implements iTaskProcessor interface', () => {
    const config: iTaskProcessorConfig = {
      errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    };
    
    const processor = useProcessor(config) as iTaskProcessor;
    
    expect(processor.context).toBeDefined();
    expect(processor.context.errorHandlingStrategy).toBe(ErrorHandlingStrategy.STOP_ALL);
  });
});