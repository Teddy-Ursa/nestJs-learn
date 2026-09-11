import { Router } from "express";
import { createNewTask } from "../createNewTask.js";
import {
  loadTasks,
  saveTasks,
} from "../storage.js";
import type { CreateTaskBody } from "../types.js";
import { request } from "node:http";

export const tasksRouter = Router();

tasksRouter.get("/", async (request, response) => {
    const tasks = await loadTasks();
    const completed = request.query.completed;

    if (completed === undefined) {
        response.status(200).json(tasks)
        return;
    }

     if (completed !== "true" && completed !== "false") {
        response
            .status(400)
            .json({error: "completed должен иметь булевое значение"});

        return;
    }

    const shouldBeCompleted = completed === "true";
    const filteredTasks = tasks.filter(
        task => task.completed === shouldBeCompleted
    );

    response.status(200).json(filteredTasks);
});

 tasksRouter.get("/:id", async (request, response) => {
    const taskId= Number(request.params.id);

    if (!Number.isSafeInteger(taskId) || taskId <= 0) {
        response.status(400).json({error: "ID должен быть положительным целым числом"});
        return;
    }

    const tasks = await loadTasks();
    const task = tasks.find(
        task => task.id === taskId
    );

    if (task === undefined) {
        response.status(404).json({error: `Задача с ID ${taskId} не найдена`});
        return;
    }

    response.status(200).json(task);
 });

 tasksRouter.post("/", async (request, response) => {
    if (!request.is("application/json")) {
        response.status(415).json({
            error: "Content-Type должен быть application/json"
        });
        return;
    }

    const body: unknown = request.body;

    if (!isCreateTaskBody(body)) {
        response.status(400).json({
            error: "title должен быть непустой строкой"
        });
        return;
    }

    const cleanedTitle = body.title.trim();
    const normalizedTitle = cleanedTitle.toLowerCase();
    const tasks = await loadTasks();
    const taskAlreadyExists = tasks.some(
        task => task.title.trim().toLowerCase() === normalizedTitle
    );

    if (taskAlreadyExists) {
        response.status(409).json({
            error: "Задача уже существует"
        });
        return;
    }

    const newTask = createNewTask(cleanedTitle);
    tasks.push(newTask);
    console.log(tasks);
    await saveTasks(tasks);

    response.status(201).json(newTask);
 });

 function isCreateTaskBody(
  value: unknown,
): value is CreateTaskBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    typeof value.title === "string" &&
    value.title.trim() !== ""
  );
}