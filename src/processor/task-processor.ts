import { ErrorHandlingStrategy } from '../enum'
import { getRootTasks, getAllTasks, hasCircularDependency } from '../task/utils'
import { CircularDependencyError } from '../error/circular-dependency-error'
import type { iTaskxContext } from '../task/type'
import type { TaskNode } from '../task/task-node'
import type { iTaskProcessor, iTaskProcessorConfig } from './type'


/**
 * Context factory function type definition
 * @typedef {Function} ContextFactory
 * @param {ErrorHandlingStrategy} errorHandlingStrategy - Error handling strategy
 * @returns {iTaskxContext} Task network context
 */
export type ContextFactory = (errorHandlingStrategy: ErrorHandlingStrategy) => iTaskxContext

/**
 * Context factory function
 * Create task network context based on error handling strategy
 * @type {ContextFactory}
 * @param {ErrorHandlingStrategy} errorHandlingStrategy - Error handling strategy
 * @returns {iTaskxContext} Task network context
 */
export const createContext: ContextFactory = (errorHandlingStrategy: ErrorHandlingStrategy): iTaskxContext => ({
    /** Create empty execution result map */
    results: new Map(),
    /** Create empty completed task set */
    completed: new Set(),
    /** Set error handling strategy */
    errorHandlingStrategy,
})

/**
 * Task processor class
 * Responsible for managing and executing task networks
 * @class TaskProcessor
 */
export class TaskProcessor implements iTaskProcessor {
    /** Task network context */
    private _context: iTaskxContext
    
    /**
     * Create task processor instance
     * @constructor
     * @param {iTaskProcessorConfig} [config] - Processor configuration
     */
    constructor(private _config?: iTaskProcessorConfig) {
        /** Create context using default strategy or strategy from configuration */
        this._context = createContext(this._config?.errorHandlingStrategy || ErrorHandlingStrategy.STOP_ALL)
    }
    
    /**
     * Get current task network context
     * @readonly
     * @returns {iTaskxContext} Task network context
     */
    get context(): iTaskxContext {
        return this._context
    }
    
    /**
     * Process task list
     * Validate task network and execute all tasks
     * @param {TaskNode[]} tasks - List of tasks to process
     * @returns {Promise<void>} Asynchronous processing result
     * @throws {CircularDependencyError} Throw when circular dependency is detected
     * @throws {Error} Throw when an error occurs during task execution
     */
    async process(tasks: TaskNode[]): Promise<void> {
        /** Get all related tasks */
        const allTasks = getAllTasks(tasks)

        /** Get root tasks (tasks without dependencies) */
        const rootTasks = getRootTasks(allTasks)

        /** Check if there is a circular dependency */
        if (hasCircularDependency(allTasks)) {
            throw new CircularDependencyError()
        }

        /** Execute all root tasks in parallel */
        await Promise.all(rootTasks.map((task) => task.tryProcess(this.context)))

        /** If there is an error in the context, throw the error */
        if (this.context.error) {
            throw this.context.error
        }
        return
    }
}