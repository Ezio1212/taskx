import { useProcessor, ErrorHandlingStrategy } from "taskx";
import { resetStartTime, logAllTasksFinished } from "../utils";
import { createTasks } from "../tasks";

/**
 * STOP_ALL error handling demo with fixed dependencies:
 */
export async function errorStopAllExample() {
    console.log('===== STOP_ALL Error Handling Demo =====');
    resetStartTime();

    // Set fixed dependencies: 2 -> 1, 3 -> 1, 4 -> 2 & 3, 5 -> 2 & 3, 6 -> 0 & 1, 7 -> 4 & 5 & 6
    // Error occured at 6
    //    0    1
    //    | /  |  \  
    //    E    2   3
    //    |    | X |
    //     \   4   5
    //      \  |  /  
    //         7
    const tasks = createTasks(
        [[], [], [1], [1], [2, 3], [2, 3], [0, 1], [4, 5, 6]],
        [100, 200, 100, 100, 150, 150, 300],
        [6]
    )
    
    try {
        await useProcessor({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL })
            .process(tasks);
    } catch (error: any) {
        console.log('Caught error:', error.message);
    }
    
    logAllTasksFinished();
}

/**
 * STOP_DOWNSTREAM error handling demo with fixed dependencies:
 */
export async function errorStopDownstreamExample() {
    console.log('\n===== STOP_DOWNSTREAM Error Handling Demo =====');
    resetStartTime();

    // Set fixed dependencies: 2 -> 1, 3 -> 1, 4 -> 2 & 3, 5 -> 2 & 3, 6 -> 0 & 1, 7 -> 4 & 5 & 6
    // Error occured at 6
    //    0    1
    //    | /  |  \  
    //    E    2   3
    //    |    | X |
    //     \   4   5
    //      \  |  /  
    //         7
    const tasks = createTasks(
        [[], [], [1], [1], [2, 3], [2, 3], [0, 1], [4, 5, 6]],
        [100, 200, 100, 100, 150, 150, 300],
        [6]
    )
    
    try {
        await useProcessor({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_DOWNSTREAM })
            .process(tasks);
    } catch (error: any) {
        console.log('Caught error:', error.message);
    }
    
    logAllTasksFinished();
}
