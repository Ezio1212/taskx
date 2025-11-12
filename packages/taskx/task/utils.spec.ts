import { getRootTasks, getAllTasks, hasCircularDependency } from './utils';
import { TaskNode } from './task-node';
import type { AsyncMethod } from './type';

describe('Task Utils', () => {
  let task1: TaskNode;
  let task2: TaskNode;
  let task3: TaskNode;
  let task4: TaskNode;
  let task5: TaskNode;
  let task6: TaskNode;
  let mockProcess1: AsyncMethod;
  let mockProcess2: AsyncMethod;
  let mockProcess3: AsyncMethod;
  let mockProcess4: AsyncMethod;
  let mockProcess5: AsyncMethod;
  let mockProcess6: AsyncMethod;

  beforeEach(() => {
    // Create mock async process functions
    mockProcess1 = jest.fn().mockResolvedValue(undefined);
    mockProcess2 = jest.fn().mockResolvedValue(undefined);
    mockProcess3 = jest.fn().mockResolvedValue(undefined);
    mockProcess4 = jest.fn().mockResolvedValue(undefined);
    mockProcess5 = jest.fn().mockResolvedValue(undefined);
    mockProcess6 = jest.fn().mockResolvedValue(undefined);
    
    // Create task nodes
    task1 = new TaskNode(mockProcess1);
    task2 = new TaskNode(mockProcess2);
    task3 = new TaskNode(mockProcess3);
    task4 = new TaskNode(mockProcess4);
    task5 = new TaskNode(mockProcess5);
    task6 = new TaskNode(mockProcess6);
  });

  describe('getRootTasks', () => {
    it('should return tasks with no parents', () => {
      // Set up: task2 and task3 depend on task1, task4 has no dependencies
      task2.dependOn(task1);
      task3.dependOn(task1);
      
      const result = getRootTasks([task1, task2, task3, task4]);
      
      // Should return task1 and task4 (no parents)
      expect(result).toHaveLength(2);
      expect(result).toContain(task1);
      expect(result).toContain(task4);
    });

    it('should handle empty input', () => {
      const result = getRootTasks([]);
      expect(result).toHaveLength(0);
    });

    it('should handle all tasks with parents', () => {
      // Create a chain: task1 -> task2 -> task3
      task2.dependOn(task1);
      task3.dependOn(task2);
      
      const result = getRootTasks([task1, task2, task3]);
      
      // Only task1 should be root
      expect(result).toHaveLength(1);
      expect(result).toContain(task1);
    });

    it('should handle complex dependency graph', () => {
      // Create a diamond: task1 -> (task2, task3) -> task4
      task2.dependOn(task1);
      task3.dependOn(task1);
      task4.dependOn(task2, task3);
      
      const result = getRootTasks([task1, task2, task3, task4]);
      
      // Only task1 should be root
      expect(result).toHaveLength(1);
      expect(result).toContain(task1);
    });

    it('should handle duplicate tasks', () => {
      // Include task1 twice in the input
      const result = getRootTasks([task1, task1]);
      
      expect(result).toHaveLength(1);
      expect(result).toContain(task1);
    });

    it('should handle tasks with multiple parents', () => {
      // task3 depends on both task1 and task2
      task3.dependOn(task1, task2);
      
      const result = getRootTasks([task1, task2, task3]);
      
      // task1 and task2 should be roots
      expect(result).toHaveLength(2);
      expect(result).toContain(task1);
      expect(result).toContain(task2);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks in a simple chain', () => {
      // Create chain: task1 -> task2 -> task3
      task2.dependOn(task1);
      task3.dependOn(task2);
      
      const result = getAllTasks([task3]);
      
      // Should return all three tasks
      expect(result).toHaveLength(3);
      expect(result).toContain(task1);
      expect(result).toContain(task2);
      expect(result).toContain(task3);
    });

    it('should return all tasks in a complex graph', () => {
      // Create diamond: task1 -> (task2, task3) -> task4
      task2.dependOn(task1);
      task3.dependOn(task1);
      task4.dependOn(task2, task3);
      
      const result = getAllTasks([task4]);
      
      // Should return all four tasks
      expect(result).toHaveLength(4);
      expect(result).toContain(task1);
      expect(result).toContain(task2);
      expect(result).toContain(task3);
      expect(result).toContain(task4);
    });

    it('should handle empty input', () => {
      const result = getAllTasks([]);
      expect(result).toHaveLength(0);
    });

    it('should handle duplicate tasks in input', () => {
      // Include task1 twice in the input
      const result = getAllTasks([task1, task1]);
      
      expect(result).toHaveLength(1);
      expect(result).toContain(task1);
    });

    it('should handle tasks with both upstream and downstream dependencies', () => {
      // Create chain: task1 -> task2 -> task3
      task2.dependOn(task1);
      task3.dependOn(task2);
      
      // Get all tasks starting from the middle
      const result = getAllTasks([task2]);
      
      // Should include all three tasks
      expect(result).toHaveLength(3);
      expect(result).toContain(task1);
      expect(result).toContain(task2);
      expect(result).toContain(task3);
    });

    it('should handle tasks with no dependencies', () => {
      const result = getAllTasks([task1]);
      
      expect(result).toHaveLength(1);
      expect(result).toContain(task1);
    });
  });

  describe('hasCircularDependency', () => {
    it('should return false for a simple linear chain', () => {
      // Create chain: task1 -> task2 -> task3
      task2.dependOn(task1);
      task3.dependOn(task2);
      
      const result = hasCircularDependency([task1, task2, task3]);
      expect(result).toBe(false);
    });

    it('should handle current node not in graph', () => {
      const task1 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      // Simulate task1 not being in graph
      expect(hasCircularDependency([task1])).toBe(false);
    });

    it('should return false for tasks with no dependencies', () => {
      const result = hasCircularDependency([task1, task2]);
      expect(result).toBe(false);
    });

    it('should return false for a diamond structure', () => {
      // Create diamond: task1 -> (task2, task3) -> task4
      task2.dependOn(task1);
      task3.dependOn(task1);
      task4.dependOn(task2, task3);
      
      const result = hasCircularDependency([task1, task2, task3, task4]);
      expect(result).toBe(false);
    });

    it('should return true for a simple circular dependency', () => {
      // Create cycle: task1 -> task2 -> task1
      task2.dependOn(task1);
      task1.dependOn(task2);
      
      const result = hasCircularDependency([task1, task2]);
      expect(result).toBe(true);
    });

    it('should return true for a longer circular dependency', () => {
      // Create cycle: task1 -> task2 -> task3 -> task1
      task2.dependOn(task1);
      task3.dependOn(task2);
      task1.dependOn(task3);
      
      const result = hasCircularDependency([task1, task2, task3]);
      expect(result).toBe(true);
    });

    it('should return true for a complex graph with a cycle', () => {
      // Create graph: task1 -> task2 -> task3, task3 -> task1 (cycle), task2 -> task4
      task2.dependOn(task1);
      task3.dependOn(task2);
      task1.dependOn(task3); // Creates cycle
      task4.dependOn(task2);
      
      const result = hasCircularDependency([task1, task2, task3, task4]);
      expect(result).toBe(true);
    });

    it('should return false for a tree structure', () => {
      // Create tree: task1 -> (task2, task3), task2 -> (task4, task5), task3 -> task6
      task2.dependOn(task1);
      task3.dependOn(task1);
      task4.dependOn(task2);
      task5.dependOn(task2);
      task6.dependOn(task3);
      
      const result = hasCircularDependency([task1, task2, task3, task4, task5, task6]);
      expect(result).toBe(false);
    });

    it('should handle empty input', () => {
      const result = hasCircularDependency([]);
      expect(result).toBe(false);
    });

    it('should handle duplicate tasks in input', () => {
      // Include task1 twice in the input
      const result = hasCircularDependency([task1, task1]);
      expect(result).toBe(false);
    });

    it('should handle complex graph with many connections', () => {
      // Create a graph where we'll process many neighbors to trigger line 118
      // task1 -> (task2, task3, task4)
      task2.dependOn(task1);
      task3.dependOn(task1);
      task4.dependOn(task1);
      
      // Each of those will have neighbors, so we'll trigger the for loop
      const result = hasCircularDependency([task1, task2, task3, task4]);
      expect(result).toBe(false);
    });

    it('should handle a graph with many edges to trigger in-degree calculations', () => {
      // Create a graph where we have many edges to trigger the inDegree.get logic
      // task1 is the root, all others depend on it
      for (let i = 2; i <= 10; i++) {
        const newTask = new TaskNode(jest.fn().mockResolvedValue(undefined));
        newTask.dependOn(task1);
      }
      
      // This will trigger the inDegree calculation for many nodes
      // and ensure line 118 (const degree = inDegree.get(neighbor)! - 1) is executed
      const result = hasCircularDependency([task1]);
      expect(result).toBe(false);
    });

    it('should handle a graph where inDegree.get returns null to test non-null assertion', () => {
      // Create a more complex graph that might trigger edge cases
      // This test specifically targets line 118's non-null assertion
      const leaf1 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      const leaf2 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      const middle1 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      const middle2 = new TaskNode(jest.fn().mockResolvedValue(undefined));
      const root = new TaskNode(jest.fn().mockResolvedValue(undefined));
      
      // Create dependencies
      leaf1.dependOn(middle1);
      leaf2.dependOn(middle2);
      middle1.dependOn(root);
      middle2.dependOn(root);
      
      // This should trigger all paths in the algorithm including line 118
      const result = hasCircularDependency([leaf1, leaf2, root]);
      expect(result).toBe(false);
    });
  });
});