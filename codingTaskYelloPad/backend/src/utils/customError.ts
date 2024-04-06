// src/utils/CustomError.ts
export class CustomError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        // Ensure that the error prototype is set correctly
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
