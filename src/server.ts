import { loadTasks } from "./storage.js";
import { createServer } from "node:http";
import { ServerResponse } from "node:http";

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
    const url = request.url;

    console.log(`${method} ${url}`);

    try {
        if (method === "GET" && url === "/health") {
            sendJson(response, 200, {status: "ok"});
            return;
        }

        if (method === "GET" && url === "/api") {
            sendJson(response, 200, {
                "name": "Task API",
                "version": "1.0.0"
            });

            return;
        }

        if (method === "GET" && url === "/tasks") {
            const tasks = await loadTasks();

            sendJson(response, 200, tasks);
            return;
        }


        if (url === "/health" || url === "/api") {
            response.setHeader("Allow", "GET");

            sendJson(response, 405, {error: "Method Not Allowed"});
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

server.listen(port, host, () => {
    console.log(`Сервер запущен: http://${host}:${port}`);
});
