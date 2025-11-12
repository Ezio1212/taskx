import type { AsyncMethod, iTask } from './type'
import { TaskNode } from './task-node'

/**
 * Task registration function type definition
 * @typedef {Function} TaskRegistor
 * @param {AsyncMethod} process - Async processing method
 * @returns {iTask} Wrapped task
 */
export type TaskRegistor = (process: AsyncMethod) => iTask;

/**
 * Task registration function
 * Wrap async methods as task instances
 * @type {TaskRegistor}
 * @param {AsyncMethod} process - Async processing method
 * @returns {TaskNode} Wrapped task
 */
export const registerTask: TaskRegistor = (process: AsyncMethod): TaskNode => new TaskNode(process)