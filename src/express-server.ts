import express from "express";
import type { Express } from "express";
import { tasksRouter } from "./http/task-router.js";
import type {
  NextFunction,
  Request,
  Response,
} from "express";

const app: Express = express();

const host = "127.0.0.1";
const port = 3001;
app.use(express.json());
app.use("/tasks", tasksRouter);

app.get("/health", (_request, response) => {
    response.status(200).json({
        status: "ok"
    });
});

app.get("/api", (_request, response) => {
    response.status(200).json({
        name: "Task Api",
        version: "1.0.0"
    });
});

app.use((_request, response) => {
  response.status(404).json({
    error: "Not Found",
  });
});

function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  console.error(error);

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    response.status(400).json({
      error: "Некорректный JSON",
    });
    return;
  }

  response.status(500).json({
    error: "Internal Server Error",
  });
}

app.use(errorHandler);


app.listen(port, host, () => {
    console.log(`Express-сервер запущен: http://${host}:${port}`);
});
