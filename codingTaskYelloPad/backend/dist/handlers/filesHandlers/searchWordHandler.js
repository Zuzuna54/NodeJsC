"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchWordHandler = void 0;
const Logger_1 = __importDefault(require("../../utils/Logger"));
const aws_sdk_1 = require("aws-sdk");
const db_1 = require("../../services/db");
const utils_1 = require("../../utils/utils");
const uploadService_1 = __importDefault(require("../../services/uploadService"));
const searchWordHandler = async (req, res) => {
    console.info('starting s3 and logger instances');
    const s3 = new aws_sdk_1.S3();
    const logger = new Logger_1.default();
    logger.info(`Initiating the searchWordHandler\n`);
    const fileUploadService = new uploadService_1.default(db_1.pool);
    try {
        logger.info(`Starting file upload class\n`);
        if (!req.headers.authorization) {
            logger.error(`Auth Header Missing`);
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
        const sessionValidated = await (0, utils_1.validateSession)(lastLogin);
        if (!sessionValidated) {
            logger.error(`Invalid session time`);
            res.status(401).json({ error: 'Invalid session time' });
            return;
        }
        const { word, file_name } = req.body;
        if (!word || !file_name) {
            res.status(400).send({ message: 'Filename or search word missing from the request: ' + req.body });
            return;
        }
        const fileName = file_name;
        logger.info(`Getting the file by name: ${fileName}\n`);
        getFileByName(fileName, username, logger, fileUploadService, res, s3, word);
    }
    catch (error) {
        logger.error(`Error searching for word: ${error}`);
        res.status(500).send({ error: 'Failed to search for word' });
        return;
    }
};
exports.searchWordHandler = searchWordHandler;
const getFileByName = async (fileName, username, logger, fileUploadService, res, s3, word) => {
    try {
        await fileUploadService.getFileByName(fileName, username).then(async (result) => {
            const response = result;
            logger.info(`Response message: ${response.message}\n`);
            logger.info(`Response data: ${response.data}\n`);
            logger.info(`Response status code: ${response.statusCode}\n`);
            if (response.statusCode !== 200) {
                logger.info(`File does not exist exists\n`);
                res.status(400).send({ message: 'File does not exists' });
                return;
            }
            if (!response.data) {
                logger.error(`Error fetching file:, ${response.data}`);
                res.status(500).send({ error: 'Failed to fetch file' });
                return;
            }
            logger.info(`Response message: ${response.message}`);
            const responseData = response.data;
            logger.info(`Fetching file from S3\n`);
            getFileFromS3(fileName, s3, logger, res, fileUploadService, word, username, responseData);
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
const getFileFromS3 = async (fileName, s3, logger, res, fileUploadService, word, username, responseData) => {
    try {
        await fileUploadService.getFileFromS3(fileName, s3).then(async (data) => {
            const response = data;
            if (response.statusCode !== 200) {
                logger.error(`Error fetching file content: ${response.data}`);
                res.status(500).send({ error: 'Failed to fetch file content' });
                return;
            }
            if (!response.data) {
                logger.error(`Error fetching file content: ${response.data}`);
                res.status(500).send({ error: 'Failed to fetch file content' });
                return;
            }
            logger.info(`response message: ${response.message}\n`);
            logger.info(`File content retrieved successfully\n`);
            logger.info(`Calculating word count and finding sentences containing the word\n`);
            const { wordCount, sentences } = (0, utils_1.analyzeText)(response.data, word);
            logger.info(`Generating CSV content\n`);
            const csvContent = `${word},${wordCount}\n\nSentences containing the word:\n${sentences.join('\n')}`;
            logger.info(`Storing CSV file in the database\n`);
            logger.info(`Response data: ${responseData.word}\n`);
            if (!responseData.word) {
                logger.info(`word, wordcount or content missing in the database\n`);
                logger.info(`updating CSV file data in the database with latest info\n`);
                updateCSVInDatabase(fileName, csvContent, db_1.pool, logger, fileUploadService, res, wordCount, sentences, username, word);
            }
            else {
                logger.info(`word, wordcount or content found in the database\n`);
                logger.info(`storing CSV file data in the database as new Entry\n`);
                storeCSVInDatabase(fileName, csvContent, db_1.pool, logger, fileUploadService, res, wordCount, sentences, username, word);
            }
        }).catch((error) => {
            logger.error(`Error fetching file content:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch file content' });
            return;
        });
    }
    catch (error) {
        logger.error(`Error fetching file content from s3:, ${error}`);
        res.status(500).send({ error: 'Failed to fetch file content from s3' });
        return;
    }
};
const storeCSVInDatabase = async (fileName, csvContent, pool, logger, fileUploadService, res, wordCount, sentences, username, word) => {
    try {
        const dateStr = new Date().toISOString();
        await fileUploadService.storeCSVInDatabase(fileName, csvContent, word, wordCount.toString(), dateStr, username, pool).then((data) => {
            const response = data;
            if (response.statusCode !== 200) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }
            if (!response.data) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }
            logger.info(`response message: ${response.message}\n`);
            logger.info(`CSV file stored in the database: ${data}\n`);
            res.status(200).send({ data, wordCount, sentences: (0, utils_1.formatSentences)(sentences) });
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
const updateCSVInDatabase = async (fileName, csvContent, pool, logger, fileUploadService, res, wordCount, sentences, username, word) => {
    try {
        const dateStr = new Date().toISOString();
        await fileUploadService.updateCSVInDatabase(fileName, csvContent, word, wordCount.toString(), dateStr, username, pool).then((data) => {
            const response = data;
            if (response.statusCode !== 200) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }
            if (!response.data) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }
            logger.info(`response message: ${response.message}\n`);
            logger.info(`CSV file stored in the database: ${data}\n`);
            res.status(200).send({ data, wordCount, sentences: (0, utils_1.formatSentences)(sentences) });
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
//# sourceMappingURL=searchWordHandler.js.map