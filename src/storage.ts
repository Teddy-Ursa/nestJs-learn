import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { StorageError } from "./errors.js";
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
            if (error instanceof StorageError) {
                console.error(error.name);
                console.error(error.message);
                console.error(error.cause);
                process.exitCode = 1;
            }
            
            throw new StorageError(
                "Файл tasks.json содержит некорректный JSON",
                error
            )
        }

        throw new StorageError("Не удалось загрузить задачи", error);
    }
    
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}