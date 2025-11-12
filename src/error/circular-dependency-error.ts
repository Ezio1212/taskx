/**
 * Circular dependency error class
 * Throw this error when a circular dependency is detected in the task network
 * @class CircularDependencyError
 * @extends {Error}
 */
export class CircularDependencyError extends Error {
    /**
     * Create a circular dependency error instance
     * @constructor
     */
    constructor() {
        super('Circular Dependency Error')
        this.name = 'CircularDependencyError'
    }
}