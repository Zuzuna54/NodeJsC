import { Request, Response } from "express";
import Logger from "../../utils/Logger";
import { S3 } from "aws-sdk";
import { pool } from "../../services/db";
import { decodeTokenLastLogin, validateSession, formatSentences, countOccurrences, findSentences } from "../../utils/utils";
import uploadService from "../../services/uploadService";
import GenericReturn from "../../utils/genericReturn";


export const searchWordHandler = async (req: Request, res: Response): Promise<void> => {

    // Import necessary modules
    console.info('starting s3 and logger instances')
    const s3 = new S3();
    const logger = new Logger();
    logger.info(`Initiating the searchWordHandler\n`);

    try {

        //Starting file upload class
        logger.info(`Starting file upload class\n`);
        const fileUploadService = new uploadService(pool);

        //check request fot auth token
        if (!req.headers.authorization) {
            res.status(401).json({ error: 'Unauthorized: Auth Header Missing' });
            return;
        }

        //check if the token is valid
        const token = req.headers.authorization.split(' ')[1];
        const lastLogin = decodeTokenLastLogin(token);
        if (!lastLogin) {
            res.status(401).json({ error: 'Last log in missing from token' });
            return;
        }
        //validate the session
        const sessionValidated: boolean = await validateSession(lastLogin);
        if (!sessionValidated) {
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
        logger.info(`Retrieving file content from S3: ${fileName}\n`);
        getFileFromS3(fileName, s3, logger, res, fileUploadService, word);

    } catch (error) {
        logger.error(`Error searching for word: ${error}`);
        res.status(500).send({ error: 'Failed to search for word' });
        return;
    }
}



// Function to fetch the file content from S3
const getFileFromS3 = async (fileName: string, s3: S3, logger: Logger, res: Response, fileUploadService: uploadService, word: string): Promise<void> => {

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

            logger.info(`response message: ${response.message}\n`);
            logger.info(`File content retrieved successfully\n`);

            // Perform the search for the word
            logger.info(`Calculating word count and finding sentences containing the word\n`);
            const wordCount = countOccurrences(response.data, word);
            const sentences = findSentences(response.data, word);

            // Generate CSV content
            logger.info(`Generating CSV content\n`);
            const csvContent = `${word},${wordCount}\n\nSentences containing the word:\n${sentences.join('\n')}`;

            // Store the CSV file in the database
            logger.info(`Storing CSV file in the database\n`);
            storeCSVInDatabase(fileName, csvContent, pool, logger, fileUploadService, res, wordCount, sentences);


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
const storeCSVInDatabase = async (fileName: string, csvContent: string, pool: any, logger: Logger, fileUploadService: uploadService, res: Response, wordCount: number, sentences: string[]): Promise<void> => {


    try {

        await fileUploadService.storeCSVInDatabase(fileName, csvContent, pool).then((data) => {

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
            res.status(200).send({ data, wordCount, sentences: formatSentences(sentences) });
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