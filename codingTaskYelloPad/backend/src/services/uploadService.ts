//Upload service postgreSql queries
require('dotenv').config();
import { Pool, QueryResult } from 'pg';
import GenericReturn from '../utils/genericReturn';
import { S3 } from 'aws-sdk';
import logger from '../utils/Logger';

class UploadService {
    private pool: Pool;
    private s3: S3;

    constructor(pool: Pool) {
        this.pool = pool;
        this.s3 = new S3();
    }

    async insertFile(userId: string, fileName: string, csvFileName: string): Promise<GenericReturn> {

        const query: string = 'INSERT INTO files (name) VALUES ($1, $2)';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [userId, fileName, csvFileName]);

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


        } catch (error) {

            logger.error(`Error inserting file into database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to insert file into database.';
            return returnResult;
        }
    }

    async getFileById(id: string): Promise<GenericReturn> {

        const query: string = 'SELECT * FROM files WHERE id = $1';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [id]);

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

        } catch (error) {

            logger.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database.';
            return returnResult;
        }
    }

    async getFileByName(name: string): Promise<GenericReturn> {

        const query: string = 'SELECT * FROM files WHERE name = $1';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [name]);

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

        } catch (error) {

            logger.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database.';
            return returnResult;
        }
    }

    async getAllUserFiles(userId: string): Promise<GenericReturn> {

        const query: string = 'SELECT * FROM files where userId = $1';
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, [userId]);

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

        } catch (error) {

            logger.error(`Error fetching files from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch files from database.';
            return returnResult;
        }

    };

    async uploadFileToS3(fileName: string, fileContent: Buffer): Promise<GenericReturn> {

        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const bucketName: string | undefined = process.env.S3_BUCKET_NAME;
            const secretAccessKey: string | undefined = process.env.AWS_SECRET_ACCESS_KEY;
            const accessKeyId: string | undefined = process.env.AWS_ACCESS_KEY_ID;

            console.log(bucketName);
            console.log(secretAccessKey);
            console.log(accessKeyId);

            if (!bucketName) {
                logger.error(`S3 bucket name is missing`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'S3 bucket name is missing';
                return returnResult;
            }

            const s3key: string = `${fileName}.csv`;

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
                return returnResult;

            }).catch((error) => {

                logger.error(`Error uploading file to S3: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to upload file to S3.';
                return returnResult;

            });

            returnResult.result = 'failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;


        } catch (error) {

            logger.error(`Error uploading file to S3: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;
        }
    }
}

export default UploadService;