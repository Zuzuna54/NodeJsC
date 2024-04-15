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
    try {
        logger.info(`Starting file upload class\n`);
        const fileUploadService = new uploadService_1.default(db_1.pool);
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
        const { word, file_name } = req.body;
        if (!word || !file_name) {
            res.status(400).send({ message: 'Filename or search word missing from the request: ' + req.body });
            return;
        }
        const fileName = file_name;
        logger.info(`Retrieving file content from S3: ${fileName}\n`);
        getFileFromS3(fileName, s3, logger, res, fileUploadService, word);
    }
    catch (error) {
        logger.error(`Error searching for word: ${error}`);
        res.status(500).send({ error: 'Failed to search for word' });
        return;
    }
};
exports.searchWordHandler = searchWordHandler;
const getFileFromS3 = async (fileName, s3, logger, res, fileUploadService, word) => {
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
            const wordCount = (0, utils_1.countOccurrences)(response.data, word);
            const sentences = (0, utils_1.findSentences)(response.data, word);
            logger.info(`Generating CSV content\n`);
            const csvContent = `${word},${wordCount}\n\nSentences containing the word:\n${sentences.join('\n')}`;
            logger.info(`Storing CSV file in the database\n`);
            storeCSVInDatabase(fileName, csvContent, db_1.pool, logger, fileUploadService, res, wordCount, sentences);
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
const storeCSVInDatabase = async (fileName, csvContent, pool, logger, fileUploadService, res, wordCount, sentences) => {
    try {
        await fileUploadService.storeCSVInDatabase(fileName, csvContent, pool).then((data) => {
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