
import { registerTask } from "taskx";
import type { iTask, iTaskxContext, AsyncMethod } from "taskx";
import { logTaskFinish, logTaskStart } from "../utils";

function createAsyncMethod(time: number, taskName: string): AsyncMethod {
    return async (_context: iTaskxContext) => {
        return new Promise<void>((resolve) => {
            logTaskStart(taskName);
            setTimeout(() => {
                logTaskFinish(taskName);
                resolve();
            }, time);
        });
    };
}

function createErrorMethod(taskName: string): AsyncMethod {
    return async (_context: iTaskxContext) => {
        logTaskStart(taskName);
        throw new Error(`${taskName} Error`);
    };
}

type DepTree = number[][];

export function createTasks(depTree: DepTree, time: number[], errorAt: number[]): iTask[] {
    const result: iTask[] = [];

    for (let i = 0; i < depTree.length; i++) {
        const logText = `Task ${i}`;
        result.push(
            registerTask(errorAt.includes(i)
            ? createErrorMethod(logText)
            : createAsyncMethod(time[i]!, logText))
        );
    }

    for (let i = 0; i < depTree.length; i++) {
        const dep = depTree[i];
        if (dep!.length > 0) {
            // @ts-ignore
            result[i]!.dependOn(...dep.map(j => result[j]));
        }
    }

    return result;
}