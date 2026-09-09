import { loadTasks, saveTasks } from "./storage.js";
import { createServer } from "node:http";
import { ServerResponse, IncomingMessage } from "node:http";
import type { CreateTaskBody } from "./types.js";
import { error } from "node:console";
import { createNewTask } from "./createNewTask.js";

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

        if (request.method === "POST" && url.pathname === "/tasks") {
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

            try {
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
            } catch (error: unknown) {
                if (error instanceof SyntaxError) {
                    sendJson(response, 400, {error: "Некорректный JSON"});
                    return;
                }

                throw error;
            }

            return;
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

function isCreateTaskBody(value: unknown): value is CreateTaskBody {
    return (typeof value === "object" && value !== null && "title" in value && typeof value.title === "string" && value.title.trim() !== "");
}

server.listen(port, host, () => {
    console.log(`Сервер запущен: http://${host}:${port}`);
});
