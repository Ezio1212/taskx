import { circularExample } from "./examples/circular";
import { errorStopAllExample, errorStopDownstreamExample } from "./examples/error-handling";
import { regularExample } from "./examples/regular";


/**
 * Main function - run all demos
 */
async function main() {
    console.log('Taskx Refactored Example Demos');
    console.log('=================================\n');
    
    const demos = [
        { func: regularExample, name: 'Regular Example' },
        { func: errorStopAllExample, name: 'STOP_ALL Error Handling' },
        { func: errorStopDownstreamExample, name: 'STOP_DOWNSTREAM Error Handling' },
        { func: circularExample, name: 'Circular Dependency Detection' },
    ];
    
    for (let i = 0; i < demos.length; i++) {
        console.log(`=== Starting Demo: ${demos[i]!.name} ===`);
        
        try {
            await demos[i]!.func();
        } catch (error) {
            console.error('Error during demo:', error);
        }
        
        console.log(`=== ${demos[i]!.name} Demo Completed ===\n`);
    }
    
    console.log('\n✅ All demos completed!');
}

// Run main function
main();