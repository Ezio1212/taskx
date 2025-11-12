import { ErrorHandlingStrategy } from '.';

describe('ErrorHandlingStrategy', () => {
  it('should have STOP_ALL value', () => {
    expect(ErrorHandlingStrategy.STOP_ALL).toBe('stop-all');
  });

  it('should have STOP_DOWNSTREAM value', () => {
    expect(ErrorHandlingStrategy.STOP_DOWNSTREAM).toBe('stop-downstream');
  });

  it('should have exactly two values', () => {
    const values = Object.values(ErrorHandlingStrategy);
    expect(values).toHaveLength(2);
    expect(values).toContain('stop-all');
    expect(values).toContain('stop-downstream');
  });

  it('should have keys that match values', () => {
    expect(ErrorHandlingStrategy.STOP_ALL).toBeDefined();
    expect(ErrorHandlingStrategy.STOP_DOWNSTREAM).toBeDefined();
  });
});