import type { ErrorHandlingStrategy } from "../enum"
import type { iTaskxContext, iTask } from "../task/type"

/**
 * Task processor configuration interface
 * @interface iTaskProcessorConfig
 */
export interface iTaskProcessorConfig {
    /** Error handling strategy */
    errorHandlingStrategy?: ErrorHandlingStrategy
}

/**
 * Task processor class (forward declaration to avoid circular dependencies)
 */
export interface iTaskProcessor {
    /** Get context */
    get context(): iTaskxContext
    /** Process task list */
    process(tasks: iTask[]): Promise<void>
}

/**
 * Processor factory function type definition
 * @typedef {Function} ProcessorFactory
 * @param {iTaskProcessorConfig} config - Processor configuration
 * @returns {iTaskProcessor} Task processor instance
 */
export type ProcessorFactory = (config: iTaskProcessorConfig) => iTaskProcessor
