"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const genericReturn_1 = __importDefault(require("../utils/genericReturn"));
const aws_sdk_1 = require("aws-sdk");
const Logger_1 = __importDefault(require("../utils/Logger"));
const logger = new Logger_1.default();
class UploadService {
    constructor(pool) {
        this.pool = pool;
        this.s3 = new aws_sdk_1.S3();
    }
    async getFileByName(filename, username) {
        logger.info(`Fetching file from database: ${filename}`);
        const query = 'SELECT * FROM csv_files WHERE filename = $1 AND username = $2';
        const values = [filename, username];
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, values);
            if (!result.rowCount) {
                logger.error('Failed to fetch file from database. File does not exist.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 400;
                returnResult.message = 'Failed to fetch file from database. File does not exist.';
                return returnResult;
            }
            logger.info('File fetched from database.');
            const data = result.rows[result.rowCount - 1];
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'File fetched from database.';
            returnResult.data = data;
            return returnResult;
        }
        catch (error) {
            logger.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database. Error: ' + error;
            return returnResult;
        }
    }
    async uploadFileToS3(fileName, fileContent) {
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        logger.info(`Uploading file to S3: ${fileName}`);
        try {
            const bucketName = process.env.S3_BUCKET_NAME;
            if (!bucketName) {
                logger.error(`S3 bucket name is missing`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'S3 bucket name is missing';
                return returnResult;
            }
            const s3key = `${fileName}`;
            const params = {
                Bucket: bucketName,
                Key: s3key,
                Body: fileContent
            };
            try {
                await this.s3.upload(params).promise().then((data) => {
                    logger.info(`File uploaded to S3: ${data.Location}`);
                    returnResult.result = 'Success';
                    returnResult.statusCode = 200;
                    returnResult.message = 'File uploaded to S3.';
                    return returnResult;
                }).catch((error) => {
                    logger.error(`Error uploading file to S3: ${error}`);
                    returnResult.result = 'Failed';
                    returnResult.statusCode = 501;
                    returnResult.message = 'Failed to upload file to S3.';
                    return returnResult;
                });
            }
            catch (error) {
                logger.error(`Error uploading file to S3: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 501;
                returnResult.message = 'Failed to upload file to S3.';
                return returnResult;
            }
        }
        catch (error) {
            logger.error(`Error uploading file to S3: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 502;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;
        }
        return returnResult;
    }
    async getFileFromS3(fileName, s3) {
        logger.info(`Retrieving file content from S3 file: ${fileName}`);
        const bucketName = process.env.S3_BUCKET_NAME;
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        if (!bucketName) {
            logger.error(`S3 bucket name is missing`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'S3 bucket name is missing';
            throw returnResult;
        }
        const params = {
            Bucket: bucketName,
            Key: fileName
        };
        return new Promise((resolve, reject) => {
            s3.getObject(params, (err, data) => {
                var _a, _b;
                if (!data || !data.Body) {
                    returnResult.result = 'Failed';
                    returnResult.statusCode = 500;
                    returnResult.message = 'File not found';
                    reject(returnResult);
                }
                if (err) {
                    returnResult.result = 'Failed';
                    returnResult.statusCode = 500;
                    returnResult.message = 'Failed to retrieve file from S3 Error: ' + err;
                    reject(returnResult);
                }
                else {
                    returnResult.result = 'Success';
                    returnResult.statusCode = 200;
                    returnResult.data = (_b = (_a = data.Body) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '';
                    returnResult.message = 'File retrieved from S3.';
                    resolve(returnResult);
                }
            });
        });
    }
    ;
    async storeCSVInDatabase(fileName, csvContent, word, wordCount, date, username, pool) {
        logger.info('Storing CSV file data in the database');
        const returnResult = new genericReturn_1.default('none', 100, 'intiated', 'initiated', '[]');
        const query = 'INSERT INTO csv_files (filename, content, word, wordcount, date, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING filename';
        const values = [fileName, csvContent, word, wordCount, date, username];
        try {
            await pool.query(query, values).then((result) => {
                logger.info(`CSV file stored data in the database: ${result.rows[0].filename}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'CSV file data stored in the database.';
                returnResult.data = "filename: " + result.rows[0].filename;
                return returnResult;
            }).catch((error) => {
                logger.error(`Error storing CSV file data in database: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 501;
                returnResult.message = 'Failed to store CSV file data in database Error: ' + error;
                return returnResult;
            });
            return returnResult;
        }
        catch (error) {
            logger.error(`Error storing CSV file data in database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 502;
            returnResult.message = 'Failed to store CSV file data in database Error: ' + error;
            return returnResult;
        }
    }
    ;
    async updateCSVInDatabase(fileName, csvContent, word, wordCount, date, username, pool) {
        logger.info('Updating CSV file in the database');
        const returnResult = new genericReturn_1.default('none', 100, 'initiated', 'initiated', '[]');
        const query = `UPDATE csv_files SET content = $1, word = $2, wordcount = $3, date = $4 WHERE filename = $5 AND username = $6 RETURNING filename`;
        const values = [csvContent, word, wordCount, date, fileName, username];
        try {
            const result = await pool.query(query, values);
            if (result.rows.length > 0) {
                logger.info(`CSV file updated in the database: ${result.rows[0].filename}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'CSV file updated in the database.';
                returnResult.data = "filename: " + result.rows[0].filename;
            }
            else {
                logger.warn('No records were updated.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 404;
                returnResult.message = 'No matching records found for update.';
            }
            return returnResult;
        }
        catch (error) {
            logger.error(`Error updating CSV file in database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to update CSV file in database. Error: ' + error;
            return returnResult;
        }
    }
    async getHistory(pool, username) {
        logger.info('Retrieving history from the database');
        const returnResult = new genericReturn_1.default('none', 100, 'intiated', 'initiated', '[]');
        const query = 'SELECT * FROM csv_files where username = $1';
        await pool.query(query, [username]).then((result) => {
            logger.info('History retrieved from the database');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'History retrieved from the database.';
            returnResult.data = result.rows.map(row => ({
                fileName: row.filename,
                content: row.content,
                word: row.word,
                wordCount: row.wordcount,
                date: row.date
            }));
            return returnResult;
        }).catch((error) => {
            logger.error(`Error retrieving history: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to retrieve history Error: ' + error;
            return returnResult;
        });
        return returnResult;
    }
    ;
}
exports.default = UploadService;
//# sourceMappingURL=uploadService.js.map