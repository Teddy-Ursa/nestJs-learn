export class ValidationError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "ValidationError";
    }
}

export class StorageError extends Error {
    constructor(message: string, cause?: unknown) {
        super(message, {cause});

        this.name = "StorageError";
    }
}