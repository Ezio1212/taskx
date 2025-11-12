import { useProcessor, ErrorHandlingStrategy, registerTask } from "taskx";
import { resetStartTime, logAllTasksFinished} from "../utils";
import { createAsyncMethod } from "../tasks";

/**
 * Simplified regular demo with fixed dependencies:
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
    const cost = [2000, 1000, 1000, 1000, 1500, 1500, 3000, 1000];

    const tasks = cost.map((c, i) => registerTask(createAsyncMethod(c, `Task ${i}`)));

    [[], [], [1], [1], [2, 3], [2, 3], [0, 1], [4, 5, 6]].forEach((dep, i) => {
        if (dep.length > 0) {
            tasks[i]!.dependOn(...dep.map(j => tasks[j]!));
        }
    })

    await useProcessor({ errorHandlingStrategy: ErrorHandlingStrategy.STOP_ALL })
        .process(tasks);
    
    logAllTasksFinished();
}