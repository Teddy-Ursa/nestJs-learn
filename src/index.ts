import { getArgumentValue } from './arguments.js';
import { createNewTask } from './createNewTask.js';
import { saveTasks, loadTasks } from "./storage.js";
import { StorageError, ValidationError } from "./errors.js";
import type { Task } from "./types.js";

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const title = getArgumentValue(args, "--title");

    if (title === undefined || title.trim() === "") {
       throw new ValidationError("Передайте название через --title");
    }

    let loadedTasks = await loadTasks();
    const normalizedTitle = title.trim().toLowerCase();
    const taskAlredyExists = loadedTasks.some(task => task.title.trim().toLowerCase() === normalizedTitle);

    if (taskAlredyExists) {
        throw new ValidationError(`Задача ${title.trim()} уже существует`);
    }

    const newTask = createNewTask(title);
    loadedTasks.push(newTask);
    await saveTasks(loadedTasks);
    
    console.log(`Задача добавлена: ${newTask.title}`);
    console.log(`Всего задач: ${loadedTasks.length}`);
}

main().catch((error: unknown) => {
    if (error instanceof ValidationError) {
        console.error(`Ошибка ввода: ${error.message}`);
        process.exitCode = 2;
        return;
    }

    if (error instanceof StorageError) {
        console.error(`Ошибка хранилища: ${error.message}`);
        process.exitCode = 3;
        return;
    }
    
    console.error("Непредвиденная ошибка:", error);
    process.exitCode = 1;
});