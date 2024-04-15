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
    async insertFile(userId, fileName, csvFileName) {
        const query = 'INSERT INTO files (name) VALUES ($1, $2)';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [userId, fileName, csvFileName]);
            if (result.rowCount !== 1) {
                logger.error('Failed to insert file into database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to insert file into database.';
                return returnResult;
            }
            logger.info('File inserted into database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'File inserted into database.';
            return returnResult;
        }
        catch (error) {
            logger.error(`Error inserting file into database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to insert file into database.';
            return returnResult;
        }
    }
    async getFileById(id) {
        const query = 'SELECT * FROM files WHERE id = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rowCount !== 1) {
                logger.error('Failed to fetch file from database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch file from database.';
                return returnResult;
            }
            logger.info('File fetched from database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.data = result.rows[0];
            return returnResult;
        }
        catch (error) {
            logger.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database.';
            return returnResult;
        }
    }
    async getFileByName(name) {
        const query = 'SELECT * FROM files WHERE name = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [name]);
            if (result.rowCount !== 1) {
                logger.error('Failed to fetch file from database. File does not exist.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 400;
                returnResult.message = 'Failed to fetch file from database. File does not exist.';
                return returnResult;
            }
            logger.info('File fetched from database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.data = result.rows[0];
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
    async getAllUserFiles(userId) {
        const query = 'SELECT * FROM files where userId = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [userId]);
            if (result.rowCount === 0) {
                logger.error('Failed to fetch files from database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch files from database.';
                return returnResult;
            }
            logger.info('Files fetched from database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.data = result.rows;
            return returnResult;
        }
        catch (error) {
            logger.error(`Error fetching files from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch files from database.';
            return returnResult;
        }
    }
    ;
    async uploadFileToS3(fileName, fileContent) {
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
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
            await this.s3.upload(params).promise().then((data) => {
                logger.info(`File uploaded to S3: ${data.Location}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'File uploaded to S3.';
                returnResult.data = data.Location;
            }).catch((error) => {
                logger.error(`Error uploading file to S3: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to upload file to S3.';
            });
            return returnResult;
        }
        catch (error) {
            logger.error(`Error uploading file to S3: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;
        }
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
    async storeCSVInDatabase(fileName, csvContent, pool) {
        logger.info('Storing CSV file in the database');
        const returnResult = new genericReturn_1.default('none', 100, 'intiated', 'initiated', '[]');
        const query = 'INSERT INTO csv_files (file_name, content) VALUES ($1, $2) RETURNING file_name';
        const values = [fileName, csvContent];
        try {
            await pool.query(query, values).then((result) => {
                logger.info(`CSV file stored in the database: ${result.rows[0].file_name}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'CSV file stored in the database.';
                returnResult.data = result.rows[0].file_name;
                return returnResult;
            }).catch((error) => {
                logger.error(`Error storing CSV file in database: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to store CSV file in database Error: ' + error;
                return returnResult;
            });
            return returnResult;
        }
        catch (error) {
            logger.error(`Error storing CSV file in database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to store CSV file in database Error: ' + error;
            return returnResult;
        }
    }
    ;
    async getHistory(pool) {
        logger.info('Retrieving history from the database');
        const returnResult = new genericReturn_1.default('none', 100, 'intiated', 'initiated', '[]');
        const query = 'SELECT file_name, content FROM csv_files';
        await pool.query(query).then((result) => {
            logger.info('History retrieved from the database');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'History retrieved from the database.';
            returnResult.data = result.rows.map(row => ({
                fileName: row.file_name,
                content: row.content
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