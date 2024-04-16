"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyHandler = void 0;
const db_1 = require("../../services/db");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const utils_1 = require("../../utils/utils");
const uploadService_1 = __importDefault(require("../../services/uploadService"));
const historyHandler = async (req, res) => {
    console.info('starting logger instance');
    const logger = new Logger_1.default();
    const fileUploadService = new uploadService_1.default(db_1.pool);
    try {
        if (!req.headers.authorization) {
            res.status(401).json({ error: 'Unauthorized: Auth Header missing' });
            return;
        }
        const token = req.headers.authorization.split(' ')[1];
        const user = (0, utils_1.decodeToken)(token);
        const lastLogin = user === null || user === void 0 ? void 0 : user.lastLogIn;
        const username = user === null || user === void 0 ? void 0 : user.username;
        logger.info(`test user: ${user}`);
        for (const key in user) {
            logger.info(`1${key}: ${user[key]}`);
        }
        if (!username) {
            logger.error(`Username missing from token`);
            res.status(401).json({ error: 'Username missing from token' });
            return;
        }
        if (!lastLogin) {
            logger.error(`Last log in missing from token`);
            res.status(401).json({ error: 'Last log in missing from token' });
            return;
        }
        const sessionValidated = await (0, utils_1.validateSession)(lastLogin);
        if (!sessionValidated) {
            logger.error(`Invalid session time`);
            res.status(401).json({ error: 'Invalid session time' });
            return;
        }
        logger.info('Retrieving history from the database');
        await fileUploadService.getHistory(db_1.pool, username).then((result) => {
            const response = result;
            if (response.statusCode !== 200) {
                logger.error(`Error fetching history: ${response.data}`);
                res.status(500).send({ message: 'Error fetching history' });
                return;
            }
            if (!response.data) {
                res.status(400).send({ message: 'No history found' });
                return;
            }
            logger.info(`reponse message: ${response.message}`);
            logger.info('History retrieved successfully');
            const history = response.data;
            res.status(200).json({ history });
            return;
        }).catch((error) => {
            logger.error(`Error fetching history:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch history' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error fetching history:, ${error}`);
        res.status(500).send({ error: 'Failed to fetch history' });
        return;
    }
};
exports.historyHandler = historyHandler;
//# sourceMappingURL=historyHandler.js.map