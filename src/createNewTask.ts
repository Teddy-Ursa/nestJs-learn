import type { Task } from "./types.js";

export function createNewTask(title: string, completed = false): Task {
    return {
        id: Date.now(),
        title,
        completed
    };
}