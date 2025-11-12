import { TaskProcessor } from "./task-processor";
import type { ProcessorFactory, iTaskProcessorConfig } from "./type";

/**
 * Processor factory function
 * Create task processor instance based on configuration
 * @type {ProcessorFactory}
 * @param {iTaskProcessorConfig} config - Processor configuration
 * @returns {TaskProcessor} Task processor instance
 */
export const useProcessor: ProcessorFactory = (config: iTaskProcessorConfig): TaskProcessor => new TaskProcessor(config);