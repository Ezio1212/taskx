# Taskx - Asynchronous Task Dependency Network Executor

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/react/blob/main/LICENSE) [![NPM](https://img.shields.io/npm/v/taskx)](https://www.npmjs.com/package/taskx) [![size](https://img.shields.io/bundlejs/size/taskx)](https://www.npmjs.com/package/taskx) [![build status](https://github.com/Ezio1212/taskx/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/Ezio1212/taskx/actions/workflows/build.yml) [![ci status](https://github.com/Ezio1212/taskx/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Ezio1212/taskx/actions/workflows/ci.yml)
[![codecov](https://codecov.io/github/Ezio1212/taskx/branch/main/graph/badge.svg?token=1JU9RH9IFB)](https://codecov.io/github/Ezio1212/taskx)

English | [中文](./doc/readme.zh-cn.md)

Taskx is a TypeScript library designed specifically for managing complex asynchronous task dependencies. Through its intelligent dependency graph execution mechanism, it enables developers to easily build and manage complex asynchronous workflows.

## Core Features

### 🚀 Smart Dependency Management
- Establish clear dependency chains using `dependOn()` method
- Automatically handle complex interdependencies between tasks
- Support for bidirectional dependency linking

### ⚡ Efficient Execution Mechanism
- Parallel execution starting from root tasks
- Immediate downstream task triggering upon task completion
- Promise-based parallel execution optimization

### 🛡️ Robust Error Handling
- **STOP_ALL Strategy**: Immediately stop all tasks upon encountering an error
- **STOP_DOWNSTREAM Strategy**: Stop only affected downstream tasks
- Intelligent error propagation mechanism

### 🔍 Circular Dependency Detection
- Detect circular dependencies using topological sorting algorithm
- Runtime automatic detection and prevention of infinite recursion
- Provide clear error messages

## Installation

```bash
npm install taskx
# or
yarn add taskx
```

## Quick Start

### Basic Usage

```typescript
import { useProcessor, registerTask, ErrorHandlingStrategy } from 'taskx';

// Create asynchronous tasks
const taskA = registerTask(async (context) => {
    console.log('Task A started');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Task A completed');
});

const taskB = registerTask(async (context) => {
    console.log('Task B started');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Task B completed');
});

// Establish dependency: taskB depends on taskA
taskB.dependOn(taskA);

// Execute tasks
async function runTasks() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    });
    
    await processor.process([taskA, taskB]);
    console.log('All tasks completed');
}

runTasks();
```

### Complex Dependency Example

```typescript
import { useProcessor, registerTask } from 'taskx';

// Create multiple tasks
const task1 = registerTask(async () => console.log('Task 1'));
const task2 = registerTask(async () => console.log('Task 2'));
const task3 = registerTask(async () => console.log('Task 3'));
const task4 = registerTask(async () => console.log('Task 4'));

// Establish complex dependencies
// task3 depends on task1 and task2
// task4 depends on task3
task3.dependOn(task1, task2);
task4.dependOn(task3);

// Execution: task1 and task2 run in parallel, then task3 runs, finally task4
await useProcessor().process([task1, task2, task3, task4]);
```

## API Reference

### Core Functions

#### `registerTask(process: AsyncMethod): iTask`
Register a new asynchronous task.

**Parameters:**
- `process`: Async execution function that receives `iTaskxContext` parameter

**Returns:** Task instance supporting method chaining

#### `useProcessor(config?: iTaskProcessorConfig): iTaskProcessor`
Create a task processor instance.

**Parameters:**
- `config`: Optional configuration object
  - `errorHandlingStrategy`: Error handling strategy, defaults to `STOP_ALL`

**Returns:** Task processor instance

### Error Handling Strategies

#### `ErrorHandlingStrategy.STOP_ALL`
Immediately stop all tasks when an error is encountered.

#### `ErrorHandlingStrategy.STOP_DOWNSTREAM`
Stop only affected downstream tasks when an error occurs, without affecting other parallel branches.

### Demonstration: Comparing Error Handling Strategies

```typescript
import { useProcessor, registerTask, ErrorHandlingStrategy } from 'taskx';

// Create tasks with complex dependencies
const taskA = registerTask(async () => {
    console.log('Task A: Loading user data');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Task A: User data loaded');
});

const taskB = registerTask(async () => {
    console.log('Task B: Processing payment');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Task B: Payment processed');
});

const taskC = registerTask(async () => {
    console.log('Task C: Sending notification');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Task C: Notification sent');
});

const taskD = registerTask(async () => {
    console.log('Task D: Failed task - throwing error');
    throw new Error('Task D: Database connection failed');
});

const taskE = registerTask(async () => {
    console.log('Task E: Generating report');
    await new Promise(resolve => setTimeout(resolve, 150));
    console.log('Task E: Report generated');
});

// Complex dependency setup:
// taskC depends on taskA and taskB
// taskD depends on taskC (will fail)
// taskE depends on taskB (parallel branch)
taskC.dependOn(taskA, taskB);
taskD.dependOn(taskC);
taskE.dependOn(taskB);

// Example 1: STOP_ALL Strategy
console.log('=== STOP_ALL Strategy Demo ===');
async function demoStopAll() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    });
    
    try {
        await processor.process([taskA, taskB, taskC, taskD, taskE]);
    } catch (error) {
        console.log('❌ Error caught:', error.message);
        console.log('Tasks completed:', Array.from(processor.context.completed));
    }
    
    // Expected output:
    // - Task A and B run in parallel
    // - Task C runs after A and B complete
    // - Task D starts but fails
    // - Task E is NEVER executed (STOP_ALL stops everything)
}

// Example 2: STOP_DOWNSTREAM Strategy
console.log('\n=== STOP_DOWNSTREAM Strategy Demo ===');
async function demoStopDownstream() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
    });
    
    try {
        await processor.process([taskA, taskB, taskC, taskD, taskE]);
    } catch (error) {
        console.log('❌ Error caught:', error.message);
        console.log('Tasks completed:', Array.from(processor.context.completed));
    }
    
    // Expected output:
    // - Task A and B run in parallel
    // - Task C runs after A and B complete
    // - Task D starts but fails
    // - Task E IS executed (parallel branch unaffected)
}

// Run both demos
await demoStopAll();
await demoStopDownstream();
```

**Key Differences Summary:**

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| **STOP_ALL** | Error in any task stops entire workflow | Critical workflows where all tasks must succeed |
| **STOP_DOWNSTREAM** | Error only affects dependent tasks | Workflows with independent parallel branches |

### Task Processor Methods

#### `processor.process(tasks: iTask[]): Promise<void>`
Execute the given task list.

**Parameters:**
- `tasks`: Array of tasks to execute

**Throws:**
- `CircularDependencyError`: Thrown when circular dependencies are detected
- `Error`: Thrown when errors occur during task execution

#### `processor.context: iTaskxContext`
Get task execution context containing execution results and status information.

## Error Handling

### Basic Error Handling

```typescript
try {
    await processor.process(tasks);
} catch (error) {
    if (error instanceof CircularDependencyError) {
        console.error('Circular dependency detected:', error.message);
    } else {
        console.error('Task execution error:', error.message);
    }
}
```

### Error Propagation Example

```typescript
const taskA = registerTask(async () => {
    throw new Error('Task A failed');
});

const taskB = registerTask(async () => {
    console.log('Task B executed normally');
});

const taskC = registerTask(async () => {
    console.log('Task C executed normally');
});

// taskB depends on taskA
taskB.dependOn(taskA);

// Using STOP_ALL strategy: taskA failure stops all tasks
// Using STOP_DOWNSTREAM strategy: taskA failure only affects taskB, taskC still executes
taskC.dependOn(taskA);
```

## Advanced Usage

### Task Result Sharing

```typescript
const processData = registerTask(async (context) => {
    const result = await expensiveOperation();
    context.results.set(processData, result);
});

const useData = registerTask(async (context) => {
    const data = context.results.get(processData);
    // Use processed data
});

useData.dependOn(processData);
```

### Custom Error Handling

```typescript
const riskyTask = registerTask(async (context) => {
    try {
        await riskyOperation();
    } catch (error) {
        // Custom error handling logic
        context.results.set(riskyTask, { error: error.message });
        throw error; // Continue error propagation
    }
});
```

## Performance Characteristics

- **High-Speed Execution**: Promise-based parallel execution optimization, maximizing system resource utilization
- **Lightweight & Efficient**: Clean core code, no extra dependencies, fast startup
- **Intelligent Scheduling**: Automatic parallel task identification, reducing unnecessary waiting times
- **Type Safety**: Full TypeScript type support, improving development efficiency
- **Extensibility**: Easy integration into existing projects, quick onboarding

## Limitations

- Task dependency graphs must be finite (no circular dependencies allowed)
- Task execution functions must be asynchronous
- Dynamic dependency modification during execution is not supported

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT License](./LICENSE)

## Changelog

### v1.0.0
- Initial version release
- Core dependency management functionality
- Error handling strategies
- Circular dependency detection

---

**Taskx** - Fast, efficient asynchronous workflow solution that makes complex dependencies simple and quick!