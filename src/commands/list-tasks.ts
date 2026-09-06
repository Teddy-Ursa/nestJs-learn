import { loadTasks } from "../storage.js";

export async function listTasks(): Promise<void> {
    const tasks = await loadTasks();

    if (tasks.length === 0) {
        console.log("Список задач пуст");
        return;
    }

    for (const task of tasks) {
        const status = task.completed ? "[x]" : "[ ]";

        console.log(`${status} ${task.id}: ${task.title}`);
    }
}