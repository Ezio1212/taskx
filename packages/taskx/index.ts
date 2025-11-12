
/**
 * Import necessary types and classes
 */
import { CircularDependencyError } from './error/circular-dependency-error'

/**
 * Export processor factory function
 * Create task processor instance based on configuration
 * @type {ProcessorFactory}
 * @param {iTaskProcessorConfig} config - Processor configuration
 * @returns {iTaskProcessor} Task processor instance
 */
export { useProcessor } from './processor'

/**
 * Task registration function
 * Wrap async methods as task instances
 * @type {TaskRegistor}
 * @param {AsyncMethod} process - Async processing method
 * @returns {WrappedTask} Wrapped task
 */
export { registerTask } from './task'

/**
 * Export error handling strategy enumeration
 */
export { ErrorHandlingStrategy } from './enum'

/**
 * Export type definitions (types that users may need)
 */
export type { 
    AsyncMethod, 
    iTaskxContext, 
    iTask
} from './task/type'

export type {
    iTaskProcessor,
    iTaskProcessorConfig
} from './processor/type';

/**
 * Export error classes (but not recommended for direct use by users)
 */
export { CircularDependencyError }