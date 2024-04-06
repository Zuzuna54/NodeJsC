// src/middlewares/errorHandler.ts
import { Response } from 'express';
import { CustomError } from '../utils/customError';
import fs from 'fs';

const logStream = fs.createWriteStream('error.log', { flags: 'a' });

export const errorHandler = (err: Error, res: Response) => {
    // Log error to error.log file
    logStream.write(`[${new Date().toISOString()}] ${err.stack}\n`);

    // Send error notification to developers (example: using email or a messaging service)

    // Determine the type of error and set appropriate response status and message
    const statusCode = err instanceof CustomError ? err.statusCode : 500;
    const message = err instanceof CustomError ? err.message : 'Internal Server Error';

    // Send response to client
    res.status(statusCode).json({ error: message });
};