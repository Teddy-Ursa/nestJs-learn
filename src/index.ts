import { getArgumentValue } from './arguments.js';
import { createNewTask } from './createNewTask.js';
import { saveTasks, loadTasks } from "./storage.js";
import type { Task } from "./types.js";

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const title = getArgumentValue(args, "--title");

    if (title === undefined || title.trim() === "") {
        console.error("Ошибка: передайте название через --title");
        process.exitCode = 1;
        return;
    }

    let loadedTasks = await loadTasks();
    const normalizedTitle = title.trim().toLowerCase();
    const taskAlredyExists = loadedTasks.some(task => task.title.trim().toLowerCase() === normalizedTitle);

    if (taskAlredyExists) {
        console.log("Такая задача уже существует!");
        return;
    }

    const newTask = createNewTask(title);
    loadedTasks.push(newTask);
    await saveTasks(loadedTasks);
    
    console.log(`Задача добавлена: ${newTask.title}`);
    console.log(`Всего задач: ${loadedTasks.length}`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Неизвестная ошибка";
    console.error(`Ошибка: ${message}`);
    process.exitCode = 1;
});