import { error } from "node:console";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function sequential(): Promise<void> {
  await delay(1000);
  await delay(1000);
}

async function concurent(): Promise<void> {
    const first = delay(1000);
    const second = delay(1000);

    await Promise.all([first, second]);
}

async function successfulTask(): Promise<void> {
  await delay(1000);
  console.log("Первая операция завершена");
}

async function failingTask(): Promise<void> {
  await delay(300);
  throw new Error("Вторая операция сломалась");
}
/* 
async function main(): Promise<void> {
    console.time("Последовательно");
    await sequential();
    console.timeEnd("Последовательно");

    console.time("Конкурентно");
    await concurent();
    console.timeEnd("Конкурентно");
}

main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
}); */

/* async function main(): Promise<void> {
    try {
        await Promise.all([
            successfulTask(),
            failingTask()
        ]);

        console.log("Обе операции завершены успешно")
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log(error.message);
        }
    } 

    console.log("Продолжаем после catch");
} */


async function main(): Promise<void> {
    const results = await Promise.allSettled([
        successfulTask(),
        failingTask()
    ]);

    for (const result of results) {
        if (result.status === "fulfilled") {
            console.log("Успех: ", result.value);
        } else {
            console.log("Ошибка: ", result.reason);
        }
    }

     console.log("Все операции завершены");
}

main();