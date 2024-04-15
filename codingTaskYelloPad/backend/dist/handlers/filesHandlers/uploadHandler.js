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
const uploadHandler = async (req, res) => {
    const logger = new Logger_1.default();
    logger.info(`Initiating the uploadHandler\n`);
    try {
        if (!req.headers.authorization) {
            res.status(401).json({ error: 'Unauthorized: Auth Header Missing' });
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
        logger.info(`Starting file upload class\n`);
        const fileUploadService = new uploadService_1.default(db_1.pool);
        logger.info(`Request to upload a file\n`);
        if (!req.file) {
            logger.error(`No file uploaded`);
            res.status(400).send({ message: 'No file uploaded' });
            return;
        }
        const { originalname, buffer } = req.file;
        logger.info(`Checking if the file already exists\n`);
        getFileByName(originalname, username, logger, fileUploadService, res, originalname, buffer);
    }
    catch (error) {
        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
        return;
    }
};
exports.uploadHandler = uploadHandler;
const getFileByName = async (fileName, username, logger, fileUploadService, res, originalname, buffer) => {
    try {
        await fileUploadService.getFileByName(fileName, username).then(async (result) => {
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
            logger.info(`Response message: ${response.message}`);
            logger.info(`Uploading the file\n`);
            uploadFileToS3(originalname, buffer, fileUploadService, res, logger, username);
        }).catch((error) => {
            logger.error(`Error fetching file:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch file' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error fetching file:, ${error}`);
        res.status(500).send({ error: 'Failed to fetch file' });
        return;
    }
};
const uploadFileToS3 = async (originalname, buffer, fileUploadService, res, logger, username) => {
    try {
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
            storeCSVInDatabase(originalname, "", db_1.pool, logger, fileUploadService, res, 0, username, '');
        }).catch((error) => {
            logger.error(`Error uploading file: ${error}`);
            res.status(500).send({ error: 'Failed to upload file' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
        return;
    }
};
const storeCSVInDatabase = async (fileName, csvContent, pool, logger, fileUploadService, res, wordCount, username, word) => {
    try {
        const dateStr = new Date().toISOString();
        await fileUploadService.storeCSVInDatabase(fileName, csvContent, word, wordCount.toString(), dateStr, username, pool).then((data) => {
            const response = data;
            if (response.statusCode !== 200) {
                logger.error(`Error storing CSV file data in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file data in database' });
                return;
            }
            if (!response.data) {
                logger.error(`Error storing CSV file data in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file data in database' });
                return;
            }
            logger.info(`response message: ${response.message}\n`);
            logger.info(`CSV file stored in the database: ${data}\n`);
            res.status(200).send({ result: response.result, message: response.message });
            return;
        }).catch((error) => {
            logger.error(`Error storing CSV file in database: ${error}`);
            res.status(500).send({ error: 'Failed to store CSV file in database' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error storing CSV file in database: ${error}`);
        res.status(500).send({ error: 'Failed to store CSV file in database' });
        return;
    }
};
//# sourceMappingURL=uploadHandler.js.map