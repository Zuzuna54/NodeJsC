"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const genericReturn_1 = __importDefault(require("../utils/genericReturn"));
const aws_sdk_1 = require("aws-sdk");
const Logger_1 = __importDefault(require("../utils/Logger"));
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
                Logger_1.default.error('Failed to insert file into database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to insert file into database.';
                return returnResult;
            }
            Logger_1.default.info('File inserted into database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'File inserted into database.';
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error inserting file into database: ${error}`);
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
                Logger_1.default.error('Failed to fetch file from database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch file from database.';
                return returnResult;
            }
            Logger_1.default.info('File fetched from database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.data = result.rows[0];
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error fetching file from database: ${error}`);
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
                Logger_1.default.error('Failed to fetch file from database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch file from database.';
                return returnResult;
            }
            Logger_1.default.info('File fetched from database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.data = result.rows[0];
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database.';
            return returnResult;
        }
    }
    async getAllUserFiles(userId) {
        const query = 'SELECT * FROM files where userId = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [userId]);
            if (result.rowCount === 0) {
                Logger_1.default.error('Failed to fetch files from database.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch files from database.';
                return returnResult;
            }
            Logger_1.default.info('Files fetched from database.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.data = result.rows;
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error fetching files from database: ${error}`);
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
                Logger_1.default.error(`S3 bucket name is missing`);
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
                Logger_1.default.info(`File uploaded to S3: ${data.Location}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'File uploaded to S3.';
                returnResult.data = data.Location;
            }).catch((error) => {
                Logger_1.default.error(`Error uploading file to S3: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to upload file to S3.';
            });
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error uploading file to S3: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;
        }
    }
}
exports.default = UploadService;
//# sourceMappingURL=uploadService.js.map