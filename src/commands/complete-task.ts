import { getArgumentValue } from "../arguments.js";
import { ValidationError } from "../errors.js";
import { loadTasks, saveTasks } from "../storage.js";

export async function completeTask(args: string[]): Promise<void> {
    const idText = getArgumentValue(args, "--id");

    if (idText === undefined) {
        throw new ValidationError("Передайте идентификатор через --id");
    }

    const taskId = Number(idText);

    if (!Number.isSafeInteger(taskId) || taskId <= 0) {
        throw new ValidationError("ID должен быть положительным целым числом");
    }

    const tasks = await loadTasks();
    const task = tasks.find(task => task.id === taskId);

    if (task === undefined) {
        throw new ValidationError(`Задача с ID ${taskId} отсутствует`);
    }

    if (task.completed) {
        console.log(`Задача с ID ${taskId} уже выполнена`);
        return;
    }

    task.completed = true;

    await saveTasks(tasks);
    console.log(`Задача выполнена: ${task.title}`);
}