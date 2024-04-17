import { Request, Response } from "express";
import Logger from "../../utils/Logger";
import { pool } from "../../services/db";
import GenericReturn from '../../utils/genericReturn';
import { decodeToken, validateSession } from "../../utils/utils";
import UploadService from "../../services/uploadService";



export const uploadHandler = async (req: Request, res: Response): Promise<void> => {


    const fileUploadService: UploadService = new UploadService(pool);
    const logger: Logger = new Logger();
    logger.info(`Initiating the uploadHandler\n`);

    try {

        //check request fot auth token
        if (!req.headers.authorization) {
            res.status(401).json({ error: 'Unauthorized: Auth Header Missing' });
            return;
        }

        //check if the token is valid
        const token: string = req.headers.authorization.split(' ')[1];
        const user: Record<string, any> | null = decodeToken(token);
        const lastLogin: string = user?.lastLogIn;
        const username: string = user?.username;

        //check if username is missing
        if (!username) {
            logger.error(`Username missing from token`);
            res.status(401).json({ error: 'Username missing from token' });
            return;
        }
        //check if last login is missing
        if (!lastLogin) {
            logger.error(`Last log in missing from token`);
            res.status(401).json({ error: 'Last log in missing from token' });
            return;
        }
        //validate the session
        const sessionValidated: boolean = await validateSession(lastLogin);
        if (!sessionValidated) {
            logger.error(`Invalid session time`);
            res.status(401).json({ error: 'Invalid session time' });
            return;
        }


        // Check if the file exists in the request
        logger.info(`Request to upload a file\n`);
        if (!req.file) {
            logger.error(`No file uploaded`);
            res.status(400).send({ message: 'No file uploaded' });
            return;
        }

        // Extract file details
        const { originalname, buffer } = req.file;

        // Check if the file already exists
        logger.info(`Checking if the file already exists\n`);
        getFileByName(originalname, username, logger, fileUploadService, res, originalname, buffer);

    } catch (error) {

        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
        return;

    }
}



// Function to getfile by name from the database
const getFileByName = async (
    fileName: string,
    username: string,
    logger: Logger,
    fileUploadService: UploadService,
    res: Response,
    originalname: string,
    buffer: any
): Promise<void> => {

    try {

        await fileUploadService.getFileByName(fileName, username).then(async (result) => {

            const response: GenericReturn = result;
            // Check if the file exists was retrieved successfully via status code and respond with 400 if it does
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

            //log all response data
            logger.info(`Response message: ${response.message}`);

            // Upload the file to S3
            logger.info(`Uploading the file\n`);
            uploadFileToS3(originalname, buffer, fileUploadService, res, logger, username);

        }).catch((error) => {

            logger.error(`Error fetching file:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch file' });
            return;

        });

    } catch (error) {

        logger.error(`Error fetching file:, ${error}`);
        res.status(500).send({ error: 'Failed to fetch file' });
        return;

    }

}



//function to upload file to s3
const uploadFileToS3 = async (
    originalname: string,
    buffer: any,
    fileUploadService: UploadService,
    res: Response,
    logger: Logger,
    username: string
): Promise<void> => {

    try {

        // Upload the file to S3
        logger.info(`Uploading the file\n`);
        await fileUploadService.uploadFileToS3(originalname, buffer).then(async (uploadResult: GenericReturn) => {

            const response: GenericReturn = uploadResult;

            // Check if the file was uploaded successfully via status code
            if (response.statusCode !== 200) {
                logger.error(`Error uploading file: ${response.message}`);
                res.status(response.statusCode).send({ message: response.message });
                return;
            }
            // log all response data
            logger.info(`Response data: ${response.data}`);
            logger.info(`Response message: ${response.message}`);

            // Store the CSV file in the database
            storeCSVInDatabase(originalname, "", pool, logger, fileUploadService, res, 0, username, '');
        }).catch((error) => {

            logger.error(`Error uploading file: ${error}`);
            res.status(500).send({ error: 'Failed to upload file' });
            return;

        });

    } catch (error) {

        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
        return;

    }
}



//Function to add data to the db for the uploaded file
const storeCSVInDatabase = async (
    fileName: string,
    csvContent: string,
    pool: any,
    logger: Logger,
    fileUploadService: UploadService,
    res: Response,
    wordCount: number,
    username: string,
    word: string
): Promise<void> => {


    try {

        const dateStr = new Date().toISOString();

        await fileUploadService.storeCSVInDatabase(fileName, csvContent, word, wordCount.toString(), dateStr, username, pool).then((data) => {

            const response: GenericReturn = data;

            // Check if the CSV file was stored successfully via status code
            if (response.statusCode !== 200) {
                logger.error(`Error storing CSV file data in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file data in database' });
                return;
            }
            // Check if the CSV file was stored successfully
            if (!response.data) {
                logger.error(`Error storing CSV file data in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file data in database' });
                return;
            }

            logger.info(`response message: ${response.message}\n`);
            logger.info(`CSV file stored in the database: ${data}\n`);

            // Return the CSV file name for download
            res.status(200).send({ result: response.result, message: response.message })
            return;

        }).catch((error) => {
            logger.error(`Error storing CSV file in database: ${error}`);
            res.status(500).send({ error: 'Failed to store CSV file in database' });
            return;
        });

    } catch (error) {

        logger.error(`Error storing CSV file in database: ${error}`);
        res.status(500).send({ error: 'Failed to store CSV file in database' });
        return;
    }

}