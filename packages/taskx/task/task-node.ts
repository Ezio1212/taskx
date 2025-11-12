import { ErrorHandlingStrategy } from '../enum'
import type { AsyncMethod, iTaskxContext, iTask } from './type'

/**
 * Wrapped task class
 * Provides task execution and dependency management functionality
 * @class WrappedTask
 */
export class TaskNode implements iTask {
    /** Flag indicating whether the task has an error */
    private error = false
    /** List of downstream tasks */
    next: TaskNode[] = []

    /**
     * Create a wrapped task instance
     * @constructor
     * @param {AsyncMethod} process - Task execution method
     * @param {TaskNode[]} [parents=[]] - Parent task list
     */
    constructor(
        private process: AsyncMethod,
        public parents: TaskNode[] = [],
    ) {}

    /**
     * Try to process the current task
     * Check preconditions and error handling strategy, then execute the task and trigger downstream tasks
     * @param {iTaskxContext} context - Task network context
     * @returns {Promise<void>} Asynchronous execution result
     */
    async tryProcess(context: iTaskxContext): Promise<void> {
        /** Define array of break condition functions */
        const breakConditions = [
            /** Check if parent tasks are completed or if current task is already completed */
            () => this.parents.some((parent) => !context.completed.has(parent.process)) || context.completed.has(this.process),
            /** Check if it's STOP_ALL strategy and an error has occurred */
            () => context.errorHandlingStrategy === ErrorHandlingStrategy.STOP_ALL && context.error,
            /** Check if it's STOP_DOWNSTREAM strategy and a parent task has an error */
            () => context.errorHandlingStrategy === ErrorHandlingStrategy.STOP_DOWNSTREAM && this.parents.some((parent) => parent.error),
        ]

        /** Find the first satisfied break condition */
        const touchBreakIndex = breakConditions.findIndex((condition) => condition())

        /** If there is a break condition */
        if (touchBreakIndex !== -1) {
            /** If the break is caused by parent task error */
            if (touchBreakIndex === 2) {
                this.error = true
            }
            return
        }

        try {
            /** Execute the task processing method */
            await this.process(context)
        } catch (e) {
            /** Catch and record the error */
            context.error = e
            this.error = true
        } finally {
            /** Mark the task as completed */
            context.completed.add(this.process)
        }

        /** Process all downstream tasks in parallel */
        await Promise.all(this.next.map((tasks) => tasks.tryProcess(context)))
    }

    /**
     * Add task dependency relationship
     * @param {...TaskNode[]} parents - Parent task list
     * @returns {TaskNode} Return current task instance, supporting chained calls
     */
    dependOn(...parents: TaskNode[]): TaskNode {
        /** Add parent tasks to the current task's parent list */
        this.parents.push(...parents)

        /** Add current task to all parent tasks' child task list */
        parents.forEach((parent) => parent.next.push(this))
        return this
    }
}