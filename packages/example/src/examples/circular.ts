import { useProcessor, ErrorHandlingStrategy, registerTask } from "taskx";
import { logAllTasksFinished, resetStartTime } from "../utils";
import { createAsyncMethod } from "../tasks";


/**
 * Circular dependency detection demo
 */
export async function circularExample() {
    console.log('===== Circular Dependency Detection Demo =====');
    resetStartTime();
    
    // Create circular dependency: task[3] -> task[0] -> task[1] -> task[2] -> task[0]
    const [task0, task1, task2, task3]= [
        registerTask(createAsyncMethod(1000, 'Task 0')),
        registerTask(createAsyncMethod(1000, 'Task 1')),
        registerTask(createAsyncMethod(1000, 'Task 2')),
        registerTask(createAsyncMethod(1000, 'Task 3'))
    ];

    task0.dependOn(task2, task3);
    task1.dependOn(task0);
    task2.dependOn(task1);

    // This will throw a circular dependency error
    try {
        await useProcessor({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL })
            .process([task0, task1, task2, task3]);
    } catch (error: any) {
        console.log('Caught circular dependency error:', error.message);
    }
    
    logAllTasksFinished();
}