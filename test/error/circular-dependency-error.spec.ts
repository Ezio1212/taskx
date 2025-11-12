import { CircularDependencyError } from '../../src/error/circular-dependency-error';

describe('CircularDependencyError', () => {
  it('should create an instance with correct name and message', () => {
    const error = new CircularDependencyError();
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CircularDependencyError);
    expect(error.name).toBe('CircularDependencyError');
    expect(error.message).toBe('Circular Dependency Error');
  });

  it('should be throwable and catchable', () => {
    expect(() => {
      throw new CircularDependencyError();
    }).toThrow('Circular Dependency Error');
  });

  it('should be identifiable by its name property', () => {
    try {
      throw new CircularDependencyError();
    } catch (error) {
      // @ts-ignore
      expect(error.name).toBe('CircularDependencyError');
    }
  });

  it('should have a stack trace', () => {
    const error = new CircularDependencyError();
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('CircularDependencyError');
  });
});