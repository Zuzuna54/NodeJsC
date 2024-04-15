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

        } catch (error) {

            logger.error(`Error fetching file from database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch file from database. Error: ' + error;
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


        } catch (error) {

            logger.error(`Error uploading file to S3: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to upload file to S3.';
            return returnResult;
        }
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
    async storeCSVInDatabase(fileName: string, csvContent: string, pool: Pool): Promise<GenericReturn> {


        logger.info('Storing CSV file in the database');
        // Create a new GenericReturn object with non default values
        const returnResult: GenericReturn = new GenericReturn('none', 100, 'intiated', 'initiated', '[]');
        const query = 'INSERT INTO csv_files (file_name, content) VALUES ($1, $2) RETURNING file_name';
        const values = [fileName, csvContent];

        try {

            await pool.query(query, values).then((result: QueryResult) => {

                logger.info(`CSV file stored in the database: ${result.rows[0].file_name}`);
                returnResult.result = 'Success';
                returnResult.statusCode = 200;
                returnResult.message = 'CSV file stored in the database.';
                returnResult.data = result.rows[0].file_name;
                return returnResult

            }).catch((error) => {

                logger.error(`Error storing CSV file in database: ${error}`);
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to store CSV file in database Error: ' + error;
                return returnResult;

            });

            return returnResult;

        } catch (error) {

            logger.error(`Error storing CSV file in database: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to store CSV file in database Error: ' + error;
            return returnResult;
        }


    };

    // Function to get history of uploaded files and CSVs
    async getHistory(pool: Pool): Promise<GenericReturn> {

        logger.info('Retrieving history from the database');
        const returnResult: GenericReturn = new GenericReturn('none', 100, 'intiated', 'initiated', '[]');
        const query = 'SELECT file_name, content FROM csv_files';

        await pool.query(query).then((result: QueryResult) => {

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
    };

}

export default UploadService;