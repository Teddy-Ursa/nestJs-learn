import { loadTasks, saveTasks } from "./storage.js";
import { createServer } from "node:http";
import { ServerResponse, IncomingMessage } from "node:http";
import type { CreateTaskBody } from "./types.js";
import type { UpdateTaskBody } from "./types.js";
import { error } from "node:console";
import { createNewTask } from "./createNewTask.js";
import { platform } from "node:os";

function sendJson(response: ServerResponse, statusCode: number, data: unknown): void {
    const body = JSON.stringify(data);

    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(body);
}

const port = 3000;
const host = "127.0.0.1";

const server = createServer( async (request, response) => {
    const method = request.method;
    const url = new URL(request.url ?? "/", "http://localhost");

    console.log(`${method} ${url}`);

    try {
        if (method === "GET" && url.pathname === "/health") {
            sendJson(response, 200, {status: "ok"});
            return;
        }

        if (method === "GET" && url.pathname === "/api") {
            sendJson(response, 200, {
                "name": "Task API",
                "version": "1.0.0"
            });

            return;
        }

        if (method === "GET" && url.pathname === "/tasks") {
            const tasks = await loadTasks();
            const completed = url.searchParams.get("completed");

            if (completed === null) {
                sendJson(response, 200, tasks);
                return;
            }

            if (completed !== "true" && completed !== "false") {
                sendJson(response, 400, {error: "completed должен иметь булевое значение"})
                return;
            }

            const shouldBeCompleted = completed === "true";

            const filteredTasks = tasks.filter(
                (task) => task.completed === shouldBeCompleted
            );

            sendJson(response, 200, filteredTasks);
            return;
        }


        if (url.pathname === "/health" || url.pathname === "/api") {
            response.setHeader("Allow", "GET");

            sendJson(response, 405, {error: "Method Not Allowed"});
            return;
        }

        if (method === "POST" && url.pathname === "/tasks") {
            const contentType = request.headers["content-type"];
            const mediaType = contentType
                ?.split(";")[0]
                ?.trim()
                .toLowerCase();

            if (mediaType !== "application/json") {
                sendJson(response, 415, {error: "Content-Type должен быть application/json"});
                return;
            }

            let body: unknown;

            try {
                body = await readJsonBody(request);
            } catch (error: unknown) {
                if (error instanceof SyntaxError) {
                    sendJson(response, 400, {
                    error: "Некорректный JSON",
                    });
                    return;
                }

                throw error;
            }

            if (!isCreateTaskBody(body)) {
                sendJson(response, 400, {error: "title должен быть непустой строкой"});
                return;
            }
            
            const cleanedTitle = body.title.trim();
            const normalizedTitle = cleanedTitle.toLowerCase();
            const tasks = await loadTasks();
            const taskAlreadyExists = tasks.some((task) => task.title.trim().toLowerCase() === normalizedTitle);

            if (taskAlreadyExists) {
                sendJson(response, 409, {error: "Задача уже существует"});
                return;
            }

            const newTask = createNewTask(cleanedTitle)
            tasks.push(newTask);
            await saveTasks(tasks);
            sendJson(response, 201, newTask);

            return;
        }

        const taskIdText = getTaskIdText(url.pathname);

        if (taskIdText !== undefined) {
            if (method === "GET") {
                const taskId = Number(taskIdText);

                if (!Number.isSafeInteger(taskId) || taskId <= 0) {
                    sendJson(response, 400, {error: "ID должен быть положительным целым числом"});
                    return;
                }

                const tasks = await loadTasks();
                const task = tasks.find(task => task.id === taskId);

                if (task === undefined) {
                    sendJson(response, 404, {error: `Задача с ID ${taskId} не найдена`});
                    return;
                }

                sendJson(response, 200, task);
                return;
            }

            if (method === "PATCH") {
                const taskId = Number(taskIdText);

                if (!Number.isSafeInteger(taskId) || taskId <= 0) {
                    sendJson(response, 400, {error: "ID должен быть положительным целым числом"});
                    return;
                }
            
                const contentType = request.headers["content-type"];
                const mediaType = contentType
                    ?.split(";")[0]
                    ?.trim()
                    .toLowerCase();

                if (mediaType !== "application/json") {
                    sendJson(response, 415, {error: "Content-Type должен быть application/json"});
                    return;
                }

                let body: unknown;

                try {
                    body = await readJsonBody(request);
                } catch (error: unknown) {
                    if (error instanceof SyntaxError) {
                        sendJson(response, 400, {error: "Некорректный JSON"});
                        return;
                    }

                    throw error;
                }

                if (!isUpdateTaskBody(body)) {
                    sendJson(response, 400, {error: "Тело запроса имеет неверную структуру"});
                    return;
                }

                const tasks = await loadTasks();
                const task = tasks.find(task => task.id === taskId);

                if (task === undefined) {
                    sendJson(response, 404, {error: `Задача с ID ${taskId} не найдена`});
                    return;
                }

                if (body.title) {
                    const normalizedTitle = body.title?.toLowerCase();
                    const cleanedTitle = normalizedTitle?.trim();
                    const hasConflict = tasks.some(task => task.id !== taskId && task.title.toLowerCase().trim() === cleanedTitle);

                    if (hasConflict) {
                        sendJson(response, 409, {error: "Задача с таким title уже существует"});
                        return;
                    }

                    task.title = cleanedTitle;
                }

                if  (body.completed !== undefined) {
                    task.completed = body.completed;
                }

                await saveTasks(tasks);
                sendJson(response, 200, task);
                return;
            }

            if (method === "DELETE") {
                const taskId = Number(taskIdText);

                if (!Number.isSafeInteger(taskId) || taskId <= 0) {
                    sendJson(response, 400, {error: "ID должен быть положительным целым числом"});
                    return;
                }

                const tasks = await loadTasks();
                const task = tasks.find(task => task.id === taskId);

                if (task === undefined) {
                    sendJson(response, 404, {error: `Задача с ID ${taskId} не найдена`});
                    return;
                }

                const updatedTasks = tasks.filter(task => task.id !== taskId);

                await saveTasks(updatedTasks);

                response.statusCode = 204;
                response.end();
                return;
            }
        }

        sendJson(response, 404, {error: "Not Found"});
    } catch (error: unknown) {
        console.error(error);

        sendJson(response, 500, {
        error: "Internal Server Error",
        });
    }
});

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
    let body = '';
    for await (const chunk of request) {
        body += chunk.toString();
    }

    return JSON.parse(body) as unknown;
}

function getStatus(isCompleted: boolean): string {
    return isCompleted ? "выполнено" : "выполняется";
}

function isCreateTaskBody(value: unknown): value is CreateTaskBody {
    return (typeof value === "object" && value !== null && "title" in value && typeof value.title === "string" && value.title.trim() !== "");
}

function isUpdateTaskBody(
  value: unknown,
): value is UpdateTaskBody {
  if (typeof value !== "object" || value === null) return false;

  const hasTitle = "title" in value;
  const hasCompleted = "completed" in value;

  if (!hasTitle && !hasCompleted) return false;
  if (hasTitle && (typeof value.title !== "string" || value.title.trim() === ""))return false;
  if (hasCompleted && typeof value.completed !== "boolean") return false;

  return true;
}

function getTaskIdText(pathname: string):string | undefined {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length !== 2 || segments[0] !== "tasks") return undefined;
    
    return segments[1];
}


server.listen(port, host, () => {
    console.log(`Сервер запущен: http://${host}:${port}`);
});
