# Taskx - 异步任务依赖网络执行器

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

Taskx 是一个专为管理复杂异步任务依赖关系而设计的 TypeScript 库。它通过智能的依赖图执行机制，让开发者能够轻松构建和管理复杂的异步工作流。

## 核心特性

### 🚀 智能依赖管理
- 通过 `dependOn()` 方法建立清晰的依赖关系链
- 自动处理任务间的复杂依赖关系
- 支持双向依赖链接维护

### ⚡ 高效的执行机制
- 从根任务开始并行执行
- 任务完成后立即触发下游任务
- 基于 Promise 的并行执行优化

### 🛡️ 强大的错误处理
- **STOP_ALL 策略**: 遇到错误立即停止所有任务
- **STOP_DOWNSTREAM 策略**: 仅停止受影响的下游任务
- 智能错误传播机制

### 🔍 循环依赖检测
- 使用拓扑排序算法检测循环依赖
- 运行时自动检测并防止无限递归
- 提供清晰的错误信息

## 安装

```bash
npm install taskx
# 或
yarn add taskx
```

## 快速开始

### 基本用法

```typescript
import { useProcessor, registerTask, ErrorHandlingStrategy } from 'taskx';

const asyncMethodA = async (context) => {
    console.log('Async method A started.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    context.results.set(asyncMethodA, 'result A');
    console.log('Async method A finished.');
}

const asyncMethodB = async (context) => {
    console.log('Async method B started.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('result from B:', context.results.get(asyncMethodA));
    console.log('Async method B finished.');
}

// 创建异步任务
const taskA = registerTask(asyncMethodA);
const taskB = registerTask(asyncMethodB);

// 建立依赖关系：taskB 依赖于 taskA
taskB.dependOn(taskA);

// 执行任务
async function runTasks() {
    await useProcessor().process([taskB]);
    console.log('所有任务完成');
}

runTasks();
```

### 复杂依赖示例

```typescript
import { useProcessor, registerTask } from 'taskx';

// 创建多个任务
const task1 = registerTask(async () => console.log('任务1'));
const task2 = registerTask(async () => console.log('任务2'));
const task3 = registerTask(async () => console.log('任务3'));
const task4 = registerTask(async () => console.log('任务4'));

// 建立复杂依赖关系
// task3 依赖于 task1 和 task2
// task4 依赖于 task2
task3.dependOn(task1, task2);
task4.dependOn(task2);

// 执行
// task1 和 task2 并行执行
// task4 会在 task2 完成后立即执行（不依赖task1的执行）
// task3 会在 task1 和 task2 完成后执行（同时依赖task1和task2）
await useProcessor().process([task3, task4]); // 可以不传task1和task2，因为它们是task3和task4的依赖

```

## API 参考

### 核心函数

#### `registerTask(process: AsyncMethod): iTask`
注册一个新的异步任务。

**参数:**
- `process`: 异步执行函数，接收 `iTaskxContext` 参数

**返回值:** 任务实例，支持链式调用

#### `useProcessor(config?: iTaskProcessorConfig): iTaskProcessor`
创建任务处理器实例。

**参数:**
- `config`: 可选配置对象
  - `errorHandlingStrategy`: 错误处理策略，默认为 `STOP_ALL`

**返回值:** 任务处理器实例

### 错误处理策略

#### `ErrorHandlingStrategy.STOP_ALL`
遇到错误时立即停止所有任务的执行。

#### `ErrorHandlingStrategy.STOP_DOWNSTREAM`
遇到错误时仅停止受影响的下游任务，不影响其他并行分支。

### 演示：对比错误处理策略

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

// 创建具有复杂依赖关系的任务
const taskA = registerTask(asyncMethodA);

const taskB = registerTask(asyncMethodB);

const taskC = registerTask(asyncMethodC);

const taskD = registerTask(asyncMethodD);

const taskE = registerTask(asyncMethodE);

const taskF = registerTask(asyncMethodF);

// 设置复杂依赖关系
// A   B
// | / |
// C   D
// | / | 
// E   F
taskC.dependOn(taskA, taskB);
taskD.dependOn(taskB);
taskE.dependOn(taskC, taskD);
taskF.dependOn(taskD);

// 示例1：STOP_ALL 策略
console.log('=== STOP_ALL 策略演示 ===');
async function demoStopAll() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    });
    
    try {
        await processor.process([taskE, taskF]);
    } catch (error) {
        console.log('❌ 捕获到错误:', error.message);
        console.log('已完成的任务:', Array.from(processor.context.completed));
    }
    
    // 预期输出：
    // - 任务A和B并行开始执行
    // - 任务A和任务B都完成后，立即执行任务C，任务C出错
    // - 任务E不会被执行，因为任务E依赖的任务C出错
    // - 任务B完成后，立即执行任务D
    //      - 如果任务D启动在任务C出错后，则任务D不会被启动
    // - 任务D完成后，立即执行任务F
    //      - 如果任务D未启动，则不会执行任务F
}

// 示例2：STOP_DOWNSTREAM 策略
console.log('\n=== STOP_DOWNSTREAM 策略演示 ===');
async function demoStopDownstream() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM
    });
    
    try {
        await processor.process([taskA, taskB, taskC, taskD, taskE]);
    } catch (error) {
        console.log('❌ 捕获到错误:', error.message);
        console.log('已完成的任务:', Array.from(processor.context.completed));
    }
    
    // 预期输出：
    // - 任务A和B并行开始执行
    // - 任务A和任务B都完成后，立即执行任务C，任务C出错
    // - 任务E不会被执行，因为任务E依赖的任务C出错
    // - 任务B完成后，立即执行任务D (不会受到另一分支错误的影响)
    // - 任务D完成后，立即执行任务F
}

// 运行两个演示
await demoStopAll();
await demoStopDownstream();
```

**关键区别总结：**

| 策略 | 行为 | 适用场景 |
|------|------|----------|
| **STOP_ALL** | 任何任务出错都停止整个工作流未启动的部分 | 关键业务流程（所有任务必须成功） |
| **STOP_DOWNSTREAM** | 错误仅影响相关依赖任务 | 有独立并行分支的工作流 |

### 任务处理器方法

#### `processor.process(tasks: iTask[]): Promise<void>`
执行给定的任务列表。

**参数:**
- `tasks`: 要执行的任务数组

**抛出:**
- `CircularDependencyError`: 检测到循环依赖时抛出
- `Error`: 任务执行过程中出现错误时抛出

#### `processor.context: iTaskxContext`
获取任务执行上下文，包含执行结果和状态信息。

## 高级用法

### 任务结果共享

```typescript
const processData = registerTask(async (context) => {
    const result = await expensiveOperation();
    context.results.set(processData, result);
});

const useData = registerTask(async (context) => {
    const data = context.results.get(processData);
    // 使用处理后的数据
});

useData.dependOn(processData);
```

### 自定义错误处理

```typescript
const riskyTask = registerTask(async (context) => {
    try {
        await riskyOperation();
    } catch (error) {
        // 自定义错误处理逻辑
        context.results.set(riskyTask, { error: error.message });
        throw error; // 继续传播错误
    }
});
```

## 性能特点

- **智能调度**: 基于任务之间的依赖关系作为任务通讯，保障任何一个任务的执行不被无关的任务阻塞
- **轻量高效**: 核心代码简洁，无额外依赖，启动速度快
- **类型安全**: 完整的 TypeScript 类型支持，开发效率高
- **可扩展性**: 易于集成到现有项目中，快速上手

## 限制

- 任务依赖图必须是有限的（不能有循环依赖）

    - 执行任务网络前，如果依赖关系存在循环依赖，会抛出相关异常

- 任务执行函数必须是异步的

- 不支持在执行过程中动态修改依赖关系

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT License](../LICENSE)

## 更新日志

### v1.0.x
- 初始版本发布
- 核心依赖管理功能
- 错误处理策略
- 循环依赖检测

---

**Taskx** - 极速、高效的异步工作流解决方案，让复杂依赖变得简单快捷！

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