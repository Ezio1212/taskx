/**
 * Shared utility functions for Taskx demos
 */

let start: Date = new Date();

/**
 * Reset the start time for a new demo
 */
export function resetStartTime(): void {
    start = new Date();
}

/**
 * Format time in 00:000 format (seconds and milliseconds)
 */
export function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;
    return `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Log task start
 */
export function logTaskStart(taskName: string): void {
    console.log(`[${formatTime(+new Date() - +start)}] ${taskName} started.`);
}

/**
 * Log task start
 */
export function logTaskFinish(taskName: string): void {
    console.log(`[${formatTime(+new Date() - +start)}] ${taskName} finished.`);
}

/**
 * Log all tasks completion
 */
export function logAllTasksFinished(): void {
    const end = new Date();
    console.log(`[${formatTime(+end - +start)}] All Task Finished.`);
}
