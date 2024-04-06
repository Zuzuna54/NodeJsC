"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const customError_1 = require("../utils/customError");
const fs_1 = __importDefault(require("fs"));
const logStream = fs_1.default.createWriteStream('error.log', { flags: 'a' });
const errorHandler = (err, res) => {
    logStream.write(`[${new Date().toISOString()}] ${err.stack}\n`);
    const statusCode = err instanceof customError_1.CustomError ? err.statusCode : 500;
    const message = err instanceof customError_1.CustomError ? err.message : 'Internal Server Error';
    res.status(statusCode).json({ error: message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map