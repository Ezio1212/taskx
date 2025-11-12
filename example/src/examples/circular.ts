import { useProcessor, ErrorHandlingStrategy } from "taskx";
import { logAllTasksFinished, resetStartTime } from "../utils";
import { createTasks } from "../tasks";


/**
 * Circular dependency detection demo
 */
export async function circularExample() {
    console.log('===== Circular Dependency Detection Demo =====');
    resetStartTime();
    
    // Create circular dependency: task[0] -> task[1] -> task[2] -> task[0]
    const tasks = createTasks([[1], [2], [0]], [100, 200, 100], []);
    
    // This will throw a circular dependency error
    try {
        await useProcessor({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL })
            .process(tasks);
    } catch (error: any) {
        console.log('Caught circular dependency error:', error.message);
    }
    
    logAllTasksFinished();
}