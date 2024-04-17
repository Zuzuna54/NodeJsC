import { Request, Response } from "express";
import Logger from "../../utils/Logger";
import { S3 } from "aws-sdk";
import { pool } from "../../services/db";
import { validateSession, formatSentences, analyzeTextWithProximity, decodeToken } from "../../utils/utils";
import GenericReturn from "../../utils/genericReturn";
import UploadService from "../../services/uploadService";



export const searchWordHandler = async (req: Request, res: Response): Promise<void> => {

    // Import necessary modules
    console.info('starting s3 and logger instances')
    const s3: S3 = new S3();
    const logger: Logger = new Logger();
    logger.info(`Initiating the searchWordHandler\n`);
    const fileUploadService: UploadService = new UploadService(pool);

    try {

        //Starting file upload class
        logger.info(`Starting file upload class\n`);

        //check request fot auth token
        if (!req.headers.authorization) {
            logger.error(`Auth Header Missing`);
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

        //validate the session
        const sessionValidated: boolean = await validateSession(lastLogin);
        if (!sessionValidated) {
            logger.error(`Invalid session time`);
            res.status(401).json({ error: 'Invalid session time' });
            return;
        }

        // Extract the word to search for from the request body or query parameters
        const { word, file_name } = req.body;

        if (!word || !file_name) {
            res.status(400).send({ message: 'Filename or search word missing from the request: ' + req.body });
            return;
        }

        // Retrieve the uploaded file content from S3
        const fileName = file_name;
        logger.info(`Getting the file by name: ${fileName}\n`);
        getFileByName(fileName, username, logger, fileUploadService, res, s3, word);

    } catch (error) {
        logger.error(`Error searching for word: ${error}`);
        res.status(500).send({ error: 'Failed to search for word' });
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
    s3: S3,
    word: string
): Promise<void> => {

    try {

        await fileUploadService.getFileByName(fileName, username).then(async (result) => {

            const response: GenericReturn = result;
            logger.info(`Response message: ${response.message}\n`);
            logger.info(`Response data: ${response.data}\n`);
            logger.info(`Response status code: ${response.statusCode}\n`);
            // Check if the file exists was retrieved successfully via status code and respond with 400 if it does
            if (response.statusCode !== 200) {
                logger.info(`File does not exist exists\n`);
                res.status(400).send({ message: 'File does not exists' });
                return;
            }
            // Check if the file exists was retrieved successfully
            if (!response.data) {
                logger.error(`Error fetching file:, ${response.data}`);
                res.status(500).send({ error: 'Failed to fetch file' });
                return;
            }


            //log all response data
            logger.info(`Response message: ${response.message}`);
            const responseData = response.data;

            // Retrieve the file content from S3
            logger.info(`Fetching file from S3\n`);
            getFileFromS3(fileName, s3, logger, res, fileUploadService, word, username, responseData);


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



// Function to fetch the file content from S3
const getFileFromS3 = async (
    fileName: string,
    s3: S3,
    logger: Logger,
    res: Response,
    fileUploadService: UploadService,
    word: string,
    username: string,
    responseData: Record<string, string>
): Promise<void> => {

    try {

        await fileUploadService.getFileFromS3(fileName, s3).then(async (data) => {

            const response: GenericReturn = data
            // Check if the file content was retrieved successfully via status code
            if (response.statusCode !== 200) {
                logger.error(`Error fetching file content: ${response.data}`);
                res.status(500).send({ error: 'Failed to fetch file content' });
                return;
            }
            // Check if the file content was retrieved successfully
            if (!response.data) {
                logger.error(`Error fetching file content: ${response.data}`);
                res.status(500).send({ error: 'Failed to fetch file content' });
                return;
            }

            //log response message
            logger.info(`response message: ${response.message}\n`);
            logger.info(`File content retrieved successfully\n`);

            // Perform the search for the word
            logger.info(`Calculating word count and finding sentences containing the word\n`);
            const { wordCount, sentences } = analyzeTextWithProximity(response.data, word);

            // Generate CSV content
            logger.info(`Generating CSV content\n`);
            const csvContent = `${word},${wordCount}\n\nSentences containing the word:\n${sentences.join('\n')}`;

            // Store the CSV file in the database
            logger.info(`Storing CSV file in the database\n`);

            //log reponse data
            logger.info(`Response data: ${responseData.word}\n`);

            // Store the CSV file in the database conditionally as per the word and word count
            if (!responseData.word) {

                logger.info(`word, wordcount or content missing in the database\n`);
                logger.info(`updating CSV file data in the database with latest info\n`);
                updateCSVInDatabase(fileName, csvContent, pool, logger, fileUploadService, res, wordCount, sentences, username, word);

            } else {

                logger.info(`word, wordcount or content found in the database\n`);
                logger.info(`storing CSV file data in the database as new Entry\n`);
                storeCSVInDatabase(fileName, csvContent, pool, logger, fileUploadService, res, wordCount, sentences, username, word);

            }

        }).catch((error) => {

            logger.error(`Error fetching file content:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch file content' });
            return;

        })

    } catch (error) {

        logger.error(`Error fetching file content from s3:, ${error}`);
        res.status(500).send({ error: 'Failed to fetch file content from s3' });
        return;
    }

}



//Function to store the CSV file in the database
const storeCSVInDatabase = async (
    fileName: string,
    csvContent: string,
    pool: any,
    logger: Logger,
    fileUploadService: UploadService,
    res: Response,
    wordCount: number,
    sentences: string[],
    username: string,
    word: string
): Promise<void> => {


    try {

        const dateStr = new Date().toISOString();

        await fileUploadService.storeCSVInDatabase(fileName, csvContent, word, wordCount.toString(), dateStr, username, pool).then((data) => {

            const response: GenericReturn = data;

            // Check if the CSV file was stored successfully via status code
            if (response.statusCode !== 200) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }
            // Check if the CSV file was stored successfully
            if (!response.data) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }

            logger.info(`response message: ${response.message}\n`);
            logger.info(`CSV file stored in the database: ${data}\n`);

            // Return the CSV file name for download
            res.status(200).send({ data, wordCount, sentences: formatSentences(sentences), word });
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



//Function to update the CSV file in the database
const updateCSVInDatabase = async (
    fileName: string,
    csvContent: string,
    pool: any,
    logger: Logger,
    fileUploadService: UploadService,
    res: Response,
    wordCount: number,
    sentences: string[],
    username: string,
    word: string
): Promise<void> => {

    try {

        const dateStr = new Date().toISOString();

        await fileUploadService.updateCSVInDatabase(fileName, csvContent, word, wordCount.toString(), dateStr, username, pool).then((data) => {

            const response: GenericReturn = data;

            // Check if the CSV file was stored successfully via status code
            if (response.statusCode !== 200) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }
            // Check if the CSV file was stored successfully
            if (!response.data) {
                logger.error(`Error storing CSV file in database: ${response.data}`);
                res.status(500).send({ error: 'Failed to store CSV file in database' });
                return;
            }

            logger.info(`response message: ${response.message}\n`);
            logger.info(`CSV file stored in the database: ${data}\n`);

            // Return the CSV file name for download
            res.status(200).send({ data, wordCount, sentences: formatSentences(sentences), word });
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