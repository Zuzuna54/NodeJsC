"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyHandler = void 0;
const db_1 = require("../../services/db");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const logger = new Logger_1.default();
const historyHandler = async (req, res) => {
    try {
        const query = 'SELECT file_name, content FROM csv_files';
        const result = await db_1.pool.query(query);
        const history = result.rows.map(row => ({
            fileName: row.file_name,
            content: row.content
        }));
        res.status(200).json({ history });
    }
    catch (error) {
        logger.error(`Error retrieving history: ${error}`);
        res.status(500).json({ error: 'Failed to retrieve history' });
    }
};
exports.historyHandler = historyHandler;
//# sourceMappingURL=historyHandler.js.map