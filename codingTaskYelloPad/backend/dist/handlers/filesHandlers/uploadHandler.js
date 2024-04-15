"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadHandler = void 0;
const Logger_1 = __importDefault(require("../../utils/Logger"));
const db_1 = require("../../services/db");
const uploadService_1 = __importDefault(require("../../services/uploadService"));
const utils_1 = require("../../utils/utils");
const logger = new Logger_1.default();
const uploadHandler = async (req, res) => {
    logger.info(`Initiating the uploadHandler\n`);
    try {
        if (!req.headers.authorization) {
            res.status(401).json({ error: 'Unauthorized: Auth Header Missing' });
            return;
        }
        const token = req.headers.authorization.split(' ')[1];
        const lastLogin = (0, utils_1.decodeTokenLastLogin)(token);
        if (!lastLogin) {
            res.status(401).json({ error: 'Last log in missing from token' });
            return;
        }
        const sessionValidated = await (0, utils_1.validateSession)(lastLogin);
        if (!sessionValidated) {
            res.status(401).json({ error: 'Invalid session time' });
            return;
        }
        logger.info(`Starting file upload class\n`);
        const fileUploadService = new uploadService_1.default(db_1.pool);
        logger.info(`Request to upload a file\n`);
        if (!req.file) {
            res.status(400).send({ message: 'No file uploaded' });
            return;
        }
        const { originalname, buffer } = req.file;
        logger.info(`Checking if the file already exists\n`);
        await fileUploadService.getFileByName(originalname).then(async (result) => {
            const response = result;
            if (response.statusCode === 200) {
                logger.info(`File already exists\n`);
                res.status(400).send({ message: 'File already exists' });
                return;
            }
            if (response.statusCode === 500) {
                logger.error(`Error fetching file: ${response.message}`);
                res.status(response.statusCode).send({ message: response.message });
                return;
            }
            logger.info(`Response data: ${response.data}`);
            logger.info(`Response message: ${response.message}`);
            logger.info(`Response status code: ${response.statusCode}`);
            logger.info(`Uploading the file\n`);
            await fileUploadService.uploadFileToS3(originalname, buffer).then(async (uploadResult) => {
                const response = uploadResult;
                if (response.statusCode !== 200) {
                    logger.error(`Error uploading file: ${response.message}`);
                    res.status(response.statusCode).send({ message: response.message });
                    return;
                }
                logger.info(`Response data: ${response.data}`);
                logger.info(`Response message: ${response.message}`);
                res.status(response.statusCode).send({ message: response.message });
                return;
            }).catch((error) => {
                logger.error(`Error uploading file: ${error}`);
                res.status(500).send({ error: 'Failed to upload file' });
                return;
            });
        }).catch((error) => {
            logger.error(`Error fetching file:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch file' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
        return;
    }
};
exports.uploadHandler = uploadHandler;
//# sourceMappingURL=uploadHandler.js.map