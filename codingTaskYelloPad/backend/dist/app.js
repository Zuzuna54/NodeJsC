"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const Logger_1 = __importDefault(require("./utils/Logger"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const main = async () => {
    try {
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(body_parser_1.default.json());
        app.use('/awesome/applicant', userRoutes_1.default);
        app.use('/awesome/tasks', uploadRoutes_1.default);
        app.use('/awesome/auth', authRoutes_1.default);
        const port = process.env.PORT || "8002";
        app.set('port', port);
        Logger_1.default.info(`Server running on port ${app.get('port')}`);
    }
    catch (error) {
        Logger_1.default.error(`Error connecting to MongoDB:, ${error}`);
        throw error;
    }
};
main().catch((err) => {
    Logger_1.default.error(err);
});
//# sourceMappingURL=app.js.map