import { Request, Response } from "express";
import Logger from "../../utils/Logger";
import { pool } from "../../services/db";
import uploadService from "../../services/uploadService";
import GenericReturn from '../../utils/genericReturn';
import { decodeTokenLastLogin, validateSession } from "../../utils/utils";

const logger = new Logger();

export const uploadHandler = async (req: Request, res: Response): Promise<void> => {

    logger.info(`Initiating the uploadHandler\n`);

    try {

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

        //Starting file upload class
        logger.info(`Starting file upload class\n`);
        const fileUploadService = new uploadService(pool);

        // Log the request
        logger.info(`Request to upload a file\n`);

        // Check if the file exists in the request
        if (!req.file) {
            res.status(400).send({ message: 'No file uploaded' });
            return;
        }

        // Extract file details
        const { originalname, buffer } = req.file;

        // Check if the file already exists
        logger.info(`Checking if the file already exists\n`);
        await fileUploadService.getFileByName(originalname).then(async (result: GenericReturn) => {

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
            logger.info(`Response data: ${response.data}`);
            logger.info(`Response message: ${response.message}`);
            logger.info(`Response status code: ${response.statusCode}`)

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

                res.status(response.statusCode).send({ message: response.message });
                return;
            }).catch((error) => {

                logger.error(`Error uploading file: ${error}`);
                res.status(500).send({ error: 'Failed to upload file' });
                return;

            });

        }).catch((error) => {

            logger.error(`Error fetching file:, ${error}`);
            res.status(500).send({ error: 'Failed to fetch file' });
            return;

        });

    } catch (error) {

        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });
        return;

    }
}
