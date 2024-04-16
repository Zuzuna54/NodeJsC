// handler to get all files in db 
import { Request, Response } from 'express';
import { pool } from '../../services/db';
import Logger from '../../utils/Logger';
import { decodeToken, validateSession } from '../../utils/utils';
import UploadService from '../../services/uploadService';
import GenericReturn from '../../utils/genericReturn';


const getAllFilesinDB = async (req: Request, res: Response): Promise<void> => {

    console.info('starting logger instance')
    const logger = new Logger();
    const fileUploadService = new UploadService(pool);

    try {

        //check request fot auth token
        if (!req.headers.authorization) {
            res.status(401).json({ error: 'Unauthorized: Auth Header missing' });
            return;
        }

        //check if the token is valid
        const token = req.headers.authorization.split(' ')[1];
        const user: Record<string, any> | null = decodeToken(token);
        const fileName = req.body.fileName;
        const lastLogin = user?.lastLogIn;
        const username = user?.username;

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

        // Query the database to retrieve the history of uploaded files and CSVs
        logger.info('Retrieving history from the database');
        await fileUploadService.getFileByName(fileName, username).then((result) => {

            const response: GenericReturn = result
            // Check if the history was retrieved successfully via status code
            if (response.statusCode !== 200) {
                logger.error(`Error fetching history: ${response.data}`);
                res.status(500).send({ message: 'Error fetching history' });
                return;
            }

            // Send the history back to the client
            res.status(200).send(response.data);
            return;
        });

    } catch (error) {
        logger.error(`Error fetching history: ${error}`);
        res.status(500).send({ message: 'Error fetching history' });
    }
};

export default getAllFilesinDB;


