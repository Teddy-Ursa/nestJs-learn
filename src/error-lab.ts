import { ValidationError } from "./errors.js";

function parseMinute(value: string): number {
    console.log("2: начинаем проверку");

    const minutes = Number(value);

    if (Number.isNaN(minutes) || minutes <= 0) {
        throw new ValidationError("Количество минут должно быть положительным числом");
    }

    console.log("3: проверка завершена");
    return minutes;
}

function main(): void {
    console.log("1: начало");

    try {
        const minutes = parseMinute("abc");
        console.log(`4: минут: ${minutes}`);
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            console.log(`Ошибка ввода: ${error.message}`);
            process.exitCode = 2;
        } else {
            console.log("Неожиданная ошибка");
            process.exitCode = 1;
        }

        console.log("5: ошибка перехвачена");

    } finally {
        console.log("7: блок finally")
    }

    console.log("8: конец");
}

main();