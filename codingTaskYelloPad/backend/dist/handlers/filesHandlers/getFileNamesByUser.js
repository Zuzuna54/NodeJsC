"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileNamesByUser = void 0;
const db_1 = require("../../services/db");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const utils_1 = require("../../utils/utils");
const uploadService_1 = __importDefault(require("../../services/uploadService"));
const getFileNamesByUser = async (req, res) => {
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
        await fileUploadService.getAllFileNamesByUsername(db_1.pool, username).then((result) => {
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
            logger.info(`Filtering the data to return unique file names`);
            const uniqueFileNames = new Set(response.data);
            logger.info(`sending response back to the client`);
            res.status(200).send({ message: response.message, data: [...uniqueFileNames] });
        }).catch((error) => {
            logger.error(`Error fetching history: ${error}`);
            res.status(500).send({ message: 'Error fetching history' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error fetching history: ${error}`);
        res.status(500).send({ message: 'Error fetching history' });
        return;
    }
};
exports.getFileNamesByUser = getFileNamesByUser;
//# sourceMappingURL=getFileNamesByUser.js.map