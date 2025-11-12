import type { ErrorHandlingStrategy } from "../enum"

/**
 * Task network context interface
 * @interface iTaskxContext
 */
export interface iTaskxContext {
    /** Map to store task execution results */
    results: Map<AsyncMethod, any>
    /** Set of completed task methods */
    completed: Set<AsyncMethod>
    /** Error information, if an error occurs */
    error?: any
    /** Error handling strategy */
    errorHandlingStrategy: ErrorHandlingStrategy
}

/**
 * Async method type definition
 * @param {iTaskxContext} context - Task network context
 * @returns {Promise<void>} Async operation result
 */
export type AsyncMethod = (context: iTaskxContext) => Promise<void>

/**
 * Wrapped task class (forward declaration to avoid circular dependencies)
 */
export interface iTask {
    /** Try to process the task */
    tryProcess(context: iTaskxContext): Promise<void>
    /** Add dependency relationship */
    dependOn(...parents: iTask[]): iTask
}
