import { useProcessor, ErrorHandlingStrategy } from "taskx";
import { resetStartTime, logAllTasksFinished} from "../utils";
import { createTasks } from "../tasks";

/**
 * Simplified regular demo with fixed dependencies:
 * C depends on B, D depends on B, E depends on C and D, F depends on C and D, G depends on A and B, H depends on E, F, and G
 */
export async function regularExample() {
    console.log('==== Simplified Regular Demo =====');
    resetStartTime();

    // Set fixed dependencies: 2 -> 1, 3 -> 1, 4 -> 2 & 3， 5 ->2,3
    //    0    1
    //    | /  |  \  
    //    6    2   3
    //    |    | X |
    //     \   4   5
    //      \  |  /  
    //         7
    const tasks = createTasks(
        [[], [], [1], [1], [2, 3], [2, 3], [0, 1], [4, 5, 6]],
        [200, 100, 100, 100, 150, 150, 300, 100].map(e => e * 10),
        []
    )
    
    await useProcessor({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL })
        .process(tasks);
    
    logAllTasksFinished();
}