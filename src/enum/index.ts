/**
 * Error handling strategy enumeration
 * @enum {string}
 */
export enum ErrorHandlingStrategy {
    /** Stop all tasks when an error occurs */
    STOP_ALL = 'stop-all',
    /** Only stop downstream tasks when an error occurs */
    STOP_DOWNSTREAM = 'stop-downstream',
}
