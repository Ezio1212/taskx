
import type { iTaskxContext, AsyncMethod } from "taskx";
import { logTaskFinish, logTaskStart } from "../utils";

export function createAsyncMethod(time: number, taskName: string): AsyncMethod {
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

export function createErrorAsyncMethod(taskName: string): AsyncMethod {
    return async (_context: iTaskxContext) => {
        logTaskStart(taskName);
        throw new Error(`${taskName} Error`);
    };
}
