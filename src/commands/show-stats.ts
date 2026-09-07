import { loadTasks } from "../storage.js";

export async function showStats(): Promise<void> {
    const tasks = await loadTasks();
    const completeTasks = tasks.filter(task => task.completed);

    console.log(`Всего задач: ${tasks.length}`);
    console.log(`Выполнено: ${completeTasks.length}`);
    console.log(`Ожидают выполнения: ${tasks.length - completeTasks.length}`);
    console.log(`Прогресс: ${getPercentage(tasks.length, completeTasks.length)}%`);
}

function getPercentage(whole: number, part: number): string {
    if (whole === 0) return whole.toFixed(1);
    return ((part / whole) * 100).toFixed(1);
}