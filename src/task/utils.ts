import type { TaskNode } from "./task-node";

/**
 * Get root task list
 * Find all tasks without parent tasks from the task list
 * @param {TaskNode[]} tasks - Task list
 * @returns {TaskNode[]} Root task list
 */
export function getRootTasks(tasks: TaskNode[]): TaskNode[] {
    /** Visited task set to avoid duplicate processing */
    const visited = new Set<TaskNode>()
    /** Result array for root tasks */
    const result: TaskNode[] = []
    /** Processing queue, initially the input task list */
    let queue: TaskNode[] = [...tasks]

    /** Breadth-first traversal of all tasks */
    while (queue.length > 0) {
        const items = queue;
        queue = []
        items.forEach((task) => {
            /** Skip if the task has been visited */
            if (visited.has(task)) {
                return
            }
            /** Mark the task as visited */
            visited.add(task)
            /** If the task has no parent tasks, add to result list */
            if (task.parents.length === 0) {
                result.push(task)
            }
            /** Add parent tasks to the queue for continued processing */
            queue.push(...task.parents)
        })
    }
    return result
}

/**
 * Get all tasks
 * Get all related tasks from the task list (including upstream and downstream)
 * @param {TaskNode[]} tasks - Task list
 * @returns {TaskNode[]} List of all related tasks
 */
export function getAllTasks(tasks: TaskNode[]): TaskNode[] {
    /** Set of all tasks */
    const allTasks = new Set<TaskNode>()
    /** Processing queue, initially the input task list */
    const queue: TaskNode[] = [...tasks]

    /** Breadth-first traversal of all related tasks */
    while (queue.length > 0) {
        const current = queue.shift()!

        /** Skip if the task has been processed */
        if (allTasks.has(current)) {
            continue
        }

        /** Mark the task as processed */
        allTasks.add(current)
        /** Add downstream tasks to the queue */
        queue.push(...current.next)
        /** Add upstream tasks to the queue */
        queue.push(...current.parents)
    }

    /** Return array form of all tasks */
    return Array.from(allTasks)
}

/**
 * Check if there is a circular dependency
 * Use topological sorting algorithm to detect if there are circular dependencies in the task network
 * @param {TaskNode[]} tasks - Task list
 * @returns {boolean} Whether there is a circular dependency
 */
export function hasCircularDependency(tasks: TaskNode[]): boolean {
    /** Build graph structure represented by adjacency list */
    const graph = new Map<TaskNode, TaskNode[]>()
    /** Store the in-degree of each node */
    const inDegree = new Map<TaskNode, number>()

    /** Initialize graph and in-degree table */
    tasks.forEach((task) => {
        graph.set(task, [...task.next])
        inDegree.set(task, 0)
    })

    /** Calculate the in-degree of each node */
    tasks.forEach((task) => {
        task.next.forEach((next) => {
            if (inDegree.has(next)) {
                inDegree.set(next, (inDegree.get(next) || 0) + 1)
            }
        })
    })

    /** Topological sorting queue */
    const queue: TaskNode[] = []
    /** Visited node counter */
    let visitedCount = 0

    /** Find all nodes with in-degree 0 and add to queue */
    tasks.forEach((task) => {
        if (inDegree.get(task) === 0) {
            queue.push(task)
        }
    })

    /** Topological sorting process */
    while (queue.length > 0) {
        const current = queue.shift()!
        /** Increase visited count */
        visitedCount++

        /** Get all neighbors of the current node */
        const neighbors = graph.get(current)!
        /** Decrease the in-degree of all neighbors */
        for (const neighbor of neighbors) {
            /** Decrease the in-degree of the neighbor node */
            const degree = inDegree.get(neighbor)! - 1
            inDegree.set(neighbor, degree)

            /** If neighbor node's in-degree becomes 0, add to queue */
            if (degree === 0) {
                queue.push(neighbor)
            }
        }
    }

    /** If visited node count is not equal to total node count, there is a circular dependency */
    return visitedCount !== tasks.length
}