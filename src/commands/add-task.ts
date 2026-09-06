import { getArgumentValue } from '../arguments.js';
import { createNewTask } from '../createNewTask.js';
import { saveTasks, loadTasks } from "../storage.js";
import { ValidationError } from "../errors.js";

export async function addTask(args: string[]): Promise<void> {
    const title = getArgumentValue(args, "--title");

    if (title === undefined || title.trim() === "") {
       throw new ValidationError("Передайте название через --title");
    }

    const loadedTasks = await loadTasks();
    const normalizedTitle = title.trim().toLowerCase();
    const cleanedTitle = title.trim();
    const taskAlreadyExists = loadedTasks.some(task => task.title.trim().toLowerCase() === normalizedTitle);

    if (taskAlreadyExists) {
        throw new ValidationError(`Задача ${title.trim()} уже существует`);
    }

    const newTask = createNewTask(cleanedTitle);
    loadedTasks.push(newTask);
    await saveTasks(loadedTasks);
    
    console.log(`Задача добавлена: ${newTask.title}`);
    console.log(`Всего задач: ${loadedTasks.length}`);
}
