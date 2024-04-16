//Upload service postgreSql queries
require('dotenv').config();
import { Pool, QueryResult } from 'pg';
import GenericReturn from '../utils/genericReturn';
import { S3 } from 'aws-sdk';
import Logger from '../utils/Logger';


const logger = new Logger();

class UploadService {
    private pool: Pool;
    private s3: S3;

    constructor(pool: Pool) {
        this.pool = pool;
        this.s3 = new S3();
    }


    // Function to get file by name
    async getFileByName(filename: string, username: String): Promise<GenericReturn> {

        logger.info(`Fetching file from database: ${filename}`);
        const query: string = 'SELECT * FROM csv_files WHERE filename = $1 AND username = $2';
        const values = [filename, username];
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

        try {

            const result: QueryResult = await this.pool.query(query, values);

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
            returnResult.data = data
            return returnResult;

        } catch (error) {

            logger.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database. Error: ' + error;
            return returnResult;
        }
    }



    // Function to upload file to S3
    async uploadFileToS3(fileName: string, fileContent: Buffer): Promise<GenericReturn> {

        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');
        logger.info(`Uploading file to S3: ${fileName}`);

        try {

            const bucketName: string | undefined = process.env.S3_BUCKET_NAME;

            if (!bucketName) {
                logger.error(`S3 bucket name is missing`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'S3 bucket name is missing';
                return returnResult;
            }

            const s3key: string = `${fileName}`;

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

            } catch (error) {

                logger.error(`Error uploading file to S3: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 501;
                returnResult.message = 'Failed to upload file to S3.';
                return returnResult;

            }


        } catch (error) {

            logger.error(`Error uploading file to S3: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 502;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;
        }

        return returnResult;
    }



    // Function to retrieve file content from S3
    async getFileFromS3(fileName: string, s3: S3): Promise<GenericReturn> {

        logger.info(`Retrieving file content from S3 file: ${fileName}`);
        const bucketName: string | undefined = process.env.S3_BUCKET_NAME;
        const returnResult: GenericReturn = new GenericReturn('', 0, '', '', '');

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

        return new Promise<GenericReturn>((resolve, reject) => {
            s3.getObject(params, (err, data) => {
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

                } else {
                    returnResult.result = 'Success';
                    returnResult.statusCode = 200;
                    returnResult.data = data.Body?.toString() ?? '';
                    returnResult.message = 'File retrieved from S3.';
                    resolve(returnResult);
                }
            });
        });
    };



    // Function to store CSV content in the database and return the file name
    async storeCSVInDatabase(fileName: string, csvContent: string, word: string, wordCount: string, date: string, username: string, pool: Pool): Promise<GenericReturn> {

        logger.info('Storing CSV file data in the database');
        // Create a new GenericReturn object with non default values
        const returnResult: GenericReturn = new GenericReturn('none', 100, 'intiated', 'initiated', '[]');
        const query = 'INSERT INTO csv_files (filename, content, word, wordcount, date, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING filename';
        const values = [fileName, csvContent, word, wordCount, date, username];

        try {

            await pool.query(query, values).then((result: QueryResult) => {

                logger.info(`CSV file stored data in the database: ${result.rows[0].filename}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'CSV file data stored in the database.';
                returnResult.data = "filename: " + result.rows[0].filename;
                return returnResult

            }).catch((error) => {

                logger.error(`Error storing CSV file data in database: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 501;
                returnResult.message = 'Failed to store CSV file data in database Error: ' + error;
                return returnResult;

            });

            return returnResult;

        } catch (error) {

            logger.error(`Error storing CSV file data in database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 502;
            returnResult.message = 'Failed to store CSV file data in database Error: ' + error;
            return returnResult;
        }
    };



    // Function to update CSV content in the database and return the status
    async updateCSVInDatabase(fileName: string, csvContent: string, word: string, wordCount: string, date: string, username: string, pool: Pool): Promise<GenericReturn> {

        logger.info('Updating CSV file in the database');
        // Create a new GenericReturn object with non-default values
        const returnResult: GenericReturn = new GenericReturn('none', 100, 'initiated', 'initiated', '[]');
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

            } else {

                logger.warn('No records were updated.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 404;
                returnResult.message = 'No matching records found for update.';

            }

            return returnResult;

        } catch (error) {

            logger.error(`Error updating CSV file in database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to update CSV file in database. Error: ' + error;
            return returnResult;

        }
    }



    // Function to get history of uploaded files and CSVs
    async getHistory(pool: Pool, username: string): Promise<GenericReturn> {

        logger.info('Retrieving history from the database');
        const returnResult: GenericReturn = new GenericReturn('none', 100, 'intiated', 'initiated', '[]');
        const query = 'SELECT * FROM csv_files where username = $1';

        await pool.query(query, [username]).then((result: QueryResult) => {

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
    };

    // Function to get all file names by username
    async getAllFileNamesByUsername(pool: Pool, username: string): Promise<GenericReturn> {

        logger.info('Retrieving all file names from the database');
        const returnResult: GenericReturn = new GenericReturn('none', 100, 'intiated', 'initiated', '[]');
        const query = 'SELECT filename FROM csv_files WHERE username = $1';

        await pool.query(query, [username]).then((result: QueryResult) => {

            logger.info('File names retrieved from the database');

            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'File names retrieved from the database.';
            returnResult.data = result.rows.map(row => row.filename);

            return returnResult;

        }).catch((error) => {

            logger.error(`Error retrieving file names: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to retrieve file names Error: ' + error;
            return returnResult;

        });

        return returnResult;
    };

}

export default UploadService;