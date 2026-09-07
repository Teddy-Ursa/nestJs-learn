import { addTask } from "./commands/add-task.js";
import { completeTask } from "./commands/complete-task.js";
import { listTasks } from "./commands/list-tasks.js";
import { removeTask } from "./commands/remove-task.js";
import { showStats } from "./commands/show-stats.js";
import { StorageError, ValidationError } from "./errors.js";

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];
    const commandArgs = args.slice(1);

    switch (command) {
        case "add":
            await addTask(commandArgs);
            return;

        case "list":
            await listTasks();
            return;

        case "done":
            await completeTask(commandArgs);
            return;
        
        case "remove":
            await removeTask(commandArgs);
            return;

        case "stats":
            await showStats();
            return;

        default:
            throw new ValidationError("Используйте комманду add, done, remove, stats или list");    
    }
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