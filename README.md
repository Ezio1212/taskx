# Taskx - Asynchronous Task Dependency Network Executor

[![license][license]][license-url]
[![npm][npm]][npm-url]
[![build][build]][build-url]
[![ci status][ci]][ci-url]
[![coverage][cover]][cover-url]
[![PR's welcome][prs]][prs-url]
[![install size][install-size]][install-size-url]
[![minified size][minified-size]][minified-size-url]
[![downloads][downloads]][downloads-url]

[English][readme-en] | [中文][readme-zh-cn]

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

const asyncMethodA = async (context) => {
    console.log('Async method A started.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    context.results.set(asyncMethodA, 'result A');
    console.log('Async method A finished.');
};

const asyncMethodB = async (context) => {
    console.log('Async method B started.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('result from B:', context.results.get(asyncMethodA));
    console.log('Async method B finished.');
};

// Create asynchronous tasks
const taskA = registerTask(asyncMethodA);
const taskB = registerTask(asyncMethodB);

// Establish dependency: taskB depends on taskA
taskB.dependOn(taskA);

// Execute tasks
async function runTasks() {
    await useProcessor().process([taskB]);
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
// task4 depends on task2
task3.dependOn(task1, task2);
task4.dependOn(task2);

// Execution
// task1 and task2 run in parallel
// task4 will execute immediately after task2 completes (does not depend on task1)
// task3 will execute after both task1 and task2 complete (depends on both task1 and task2)
await useProcessor().process([task3, task4]); // task1 and task2 don't need to be passed as they are dependencies of task3 and task4
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

const asyncMethodA = async () => {
    console.log('Async method A started.');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Async method A finished.');
};

const asyncMethodB = async () => {
    console.log('Async method B started.');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Async method B finished.');
};

const asyncMethodC = async () => {
    console.log('Async method C started.');
    // await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Async method C errored.');
    throw new Error('Async method C errored.');
};

const asyncMethodD = async () => {
    console.log('Async method D started.');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Async method D finished.');
};

const asyncMethodE = async () => {
    console.log('Async method E started.');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Async method E finished.');
};

const asyncMethodF = async () => {
    console.log('Async method F started.');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Async method F finished.');
};

// Create tasks with complex dependencies
const taskA = registerTask(asyncMethodA);

const taskB = registerTask(asyncMethodB);

const taskC = registerTask(asyncMethodC);

const taskD = registerTask(asyncMethodD);

const taskE = registerTask(asyncMethodE);

const taskF = registerTask(asyncMethodF);

// Set up complex dependencies
// A   B
// | / |
// C   D
// | / | 
// E   F
taskC.dependOn(taskA, taskB);
taskD.dependOn(taskB);
taskE.dependOn(taskC, taskD);
taskF.dependOn(taskD);

// Example 1: STOP_ALL Strategy
console.log('=== STOP_ALL Strategy Demo ===');
async function demoStopAll() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    });
    
    try {
        await processor.process([taskE]);
    } catch (error) {
        console.log('❌ Error caught:', error.message);
        console.log('Completed tasks:', Array.from(processor.context.completed));
    }
    
    // Expected output:
    // - Tasks A and B start execution in parallel
    // - After both taskA and taskB complete, taskC executes immediately, taskC fails
    // - TaskE will not be executed because taskC (which it depends on) failed
    // - After taskB completes, taskD executes immediately
    //   - If taskD starts after taskC fails, taskD will not be started
    // - After taskD completes, taskF executes immediately
    //   - If taskD does not started, taskF will not be started
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
        console.log('Completed tasks:', Array.from(processor.context.completed));
    }
    
    // Expected output:
    // - Tasks A and B start execution in parallel
    // - After both taskA and taskB complete, taskC executes immediately, taskC fails
    // - TaskE will not be executed because it depends on failed taskC
    // - After taskB completes, taskD executes immediately (not affected by the error in the other branch)
    // - After taskD completes, taskF executes immediately (not affected by the error in the other branch)
}

// Run both demos
await demoStopAll();
await demoStopDownstream();
```

**Key Differences Summary:**

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| **STOP_ALL** | Error in any task stops all unstarted parts of the workflow | Critical business processes (all tasks must succeed) |
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

- **Intelligent Scheduling**: Communication between tasks based on dependency relationships, ensuring no task execution is blocked by unrelated tasks
- **Lightweight & Efficient**: Clean core code, no extra dependencies, fast startup
- **Type Safety**: Full TypeScript type support, improving development efficiency
- **Extensibility**: Easy integration into existing projects, quick onboarding

## Limitations

- Task dependency graphs must be finite (no circular dependencies allowed)
  - Before executing the task network, if dependencies contain circular dependencies, relevant exceptions will be thrown
- Task execution functions must be asynchronous
- Dynamic dependency modification during execution is not supported

## Contributing

Issues and Pull Requests are welcome!

## License

[MIT License](./LICENSE)

## Changelog

### v1.0.x
- Initial version release
- Core dependency management functionality
- Error handling strategies
- Circular dependency detection

---

**Taskx** - Fast, efficient asynchronous workflow solution that makes complex dependencies simple and quick!

[npm]: https://img.shields.io/npm/v/taskx.svg
[npm-url]: https://npmjs.com/package/taskx
[build]: https://github.com/Ezio1212/taskx/actions/workflows/build.yml/badge.svg?branch=main
[build-url]: https://github.com/Ezio1212/taskx/actions/workflows/build.yml
[ci]: https://github.com/Ezio1212/taskx/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/Ezio1212/taskx/actions/workflows/ci.yml
[cover]: https://codecov.io/github/Ezio1212/taskx/branch/main/graph/badge.svg?token=1JU9RH9IFB
[cover-url]: https://codecov.io/gh/Ezio1212/taskx
[prs]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[prs-url]: https://github.com/Ezio1212/taskx/issues
[install-size]: https://packagephobia.com/badge?p=taskx
[install-size-url]: https://packagephobia.com/result?p=taskx
[minified-size]: https://img.shields.io/bundlejs/size/taskx
[minified-size-url]: https://www.npmjs.com/package/taskx
[downloads]: https://img.shields.io/npm/dm/taskx.svg
[downloads-url]: https://npmcharts.com/compare/taskx?minimal=true
[license]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/Ezio1212/taskx/blob/main/LICENSE

[readme-zh-cn]: ./doc/readme.zh-cn.md
[readme-en]: /README.md