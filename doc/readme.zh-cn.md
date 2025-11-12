# Taskx - 异步任务依赖网络执行器

<p align="center">
  <a href="./readme.md">English</a> |
  中文
</p>

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

// 创建异步任务
const taskA = registerTask(async (context) => {
    console.log('任务A开始执行');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('任务A完成');
});

const taskB = registerTask(async (context) => {
    console.log('任务B开始执行');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('任务B完成');
});

// 建立依赖关系：taskB 依赖于 taskA
taskB.dependOn(taskA);

// 执行任务
async function runTasks() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    });
    
    await processor.process([taskA, taskB]);
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
// task4 依赖于 task3
task3.dependOn(task1, task2);
task4.dependOn(task3);

// 执行：task1 和 task2 并行执行，完成后 task3 执行，最后 task4 执行
await useProcessor().process([task1, task2, task3, task4]);
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

// 创建具有复杂依赖关系的任务
const taskA = registerTask(async () => {
    console.log('任务A: 加载用户数据');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('任务A: 用户数据加载完成');
});

const taskB = registerTask(async () => {
    console.log('任务B: 处理支付');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('任务B: 支付处理完成');
});

const taskC = registerTask(async () => {
    console.log('任务C: 发送通知');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('任务C: 通知发送完成');
});

const taskD = registerTask(async () => {
    console.log('任务D: 失败任务 - 抛出错误');
    throw new Error('任务D: 数据库连接失败');
});

const taskE = registerTask(async () => {
    console.log('任务E: 生成报告');
    await new Promise(resolve => setTimeout(resolve, 150));
    console.log('任务E: 报告生成完成');
});

// 复杂依赖关系设置：
// taskC 依赖于 taskA 和 taskB
// taskD 依赖于 taskC（会失败）
// taskE 依赖于 taskB（并行分支）
taskC.dependOn(taskA, taskB);
taskD.dependOn(taskC);
taskE.dependOn(taskB);

// 示例1：STOP_ALL 策略
console.log('=== STOP_ALL 策略演示 ===');
async function demoStopAll() {
    const processor = useProcessor({
        errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL
    });
    
    try {
        await processor.process([taskA, taskB, taskC, taskD, taskE]);
    } catch (error) {
        console.log('❌ 捕获到错误:', error.message);
        console.log('已完成的任务:', Array.from(processor.context.completed));
    }
    
    // 预期输出：
    // - 任务A和B并行执行
    // - 任务C在A和B完成后执行
    // - 任务D开始执行但失败
    // - 任务E永远不会执行（STOP_ALL停止所有任务）
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
    // - 任务A和B并行执行
    // - 任务C在A和B完成后执行
    // - 任务D开始执行但失败
    // - 任务E正常执行（并行分支不受影响）
}

// 运行两个演示
await demoStopAll();
await demoStopDownstream();
```

**关键区别总结：**

| 策略 | 行为 | 适用场景 |
|------|------|----------|
| **STOP_ALL** | 任何任务出错都停止整个工作流 | 关键业务流程（所有任务必须成功） |
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

## 错误处理

### 基本错误处理

```typescript
try {
    await processor.process(tasks);
} catch (error) {
    if (error instanceof CircularDependencyError) {
        console.error('检测到循环依赖:', error.message);
    } else {
        console.error('任务执行错误:', error.message);
    }
}
```

### 错误传播示例

```typescript
const taskA = registerTask(async () => {
    throw new Error('任务A失败');
});

const taskB = registerTask(async () => {
    console.log('任务B正常执行');
});

const taskC = registerTask(async () => {
    console.log('任务C正常执行');
});

// taskB 依赖于 taskA
taskB.dependOn(taskA);

// 使用 STOP_ALL 策略：taskA 失败会导致所有任务停止
// 使用 STOP_DOWNSTREAM 策略：taskA 失败只会影响 taskB，taskC 仍可执行
taskC.dependOn(taskA);
```

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

- **极速执行**: 基于 Promise 的并行执行优化，最大化利用系统资源
- **轻量高效**: 核心代码简洁，无额外依赖，启动速度快
- **智能调度**: 自动识别并行任务，减少不必要的等待时间
- **类型安全**: 完整的 TypeScript 类型支持，开发效率高
- **可扩展性**: 易于集成到现有项目中，快速上手

## 限制

- 任务依赖图必须是有限的（不能有循环依赖）
- 任务执行函数必须是异步的
- 不支持动态修改依赖关系（执行过程中）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT License](../LICENSE)

## 更新日志

### v1.0.0
- 初始版本发布
- 核心依赖管理功能
- 错误处理策略
- 循环依赖检测

---

**Taskx** - 极速、高效的异步工作流解决方案，让复杂依赖变得简单快捷！