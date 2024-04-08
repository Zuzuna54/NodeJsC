import { Request, Response } from "express";
import logger from "../../utils/Logger";
import { pool } from "../../services/db";
import uploadService from "../../services/uploadService";
import GenericReturn from "src/utils/genericReturn";

export const uploadHandler = async (req: Request, res: Response): Promise<void> => {

    logger.info(`Initiating the uploadHandler\n`);

    try {

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
        const fileExistsResult = await fileUploadService.getFileByName(originalname);

        if (fileExistsResult.data) {

            res.status(400).send({ message: 'File already exists' });
            return;

        }

        // Upload the file to S3
        logger.info(`Uploading the file\n`);
        const uploadResult: GenericReturn = await fileUploadService.uploadFileToS3(originalname, buffer);
        res.status(uploadResult.statusCode).send({ message: uploadResult.message, fileName: originalname });

    } catch (error) {

        logger.error(`Error uploading file: ${error}`);
        res.status(500).send({ error: 'Failed to upload file' });

    }
}
