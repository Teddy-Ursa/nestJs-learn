import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type {Task} from "./types.js";

const dataDirectory = path.join(process.cwd(), "data");
const taskFilePath = path.join(dataDirectory, "tasks.json");

export async function saveTasks(tasks: Task[]): Promise<void> {
    await mkdir(dataDirectory, {recursive: true});
    const json = JSON.stringify(tasks, null, 2);
    await writeFile(taskFilePath, json, "utf-8");
}

export async function loadTasks(): Promise<Task[]> {
    try {
        const json = await readFile(taskFilePath, "utf-8");
        return JSON.parse(json) as Task[]; 
    } catch (error: unknown) {
        if (isNodeError(error) && error.code === "ENOENT") {
            return [];
        }

        if (error instanceof SyntaxError) {
            throw new Error(
                "Файл tasks.json содержит некорректный JSON",
                {cause: error}
            )
        }

        throw error;
    }
    
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}