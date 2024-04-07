require('dotenv').config();
import { decodeToken, validateRefreshSession } from '../../utils/utils';
import { Request, Response } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import logger from '../../utils/Logger';
import userService from '../../services/userService';
import GenericReturn from '../../utils/genericReturn';
import { pool } from 'src/services/db';

//Function to refresh the access token
export const refreshAccessTokenHandler = async (req: Request, res: Response): Promise<void> => {

    try {


        const userServiveHere = new userService(pool);
        // Log the request
        logger.info(`Request to refresh the access token\n`);
        // Get the token from the request headers
        const body: Record<string, any> | null = req.body;
        const tokenHere: string = body?.refreshToken || '';
        const user: Record<string, any> | null = decodeToken(tokenHere);

        // Validate the token
        logger.info(`Validating the token\n`);

        if (!tokenHere) {

            logger.error(`Token is required`);
            res.status(498).send({ message: 'Token is required' });
            return;

        }

        //Validate the session
        logger.info(`Validating the session\n`);
        const sessionValidated: boolean = await validateRefreshSession(user?.lastLogIn);
        if (!sessionValidated) {

            logger.error(`Invalid session`);
            res.status(440).send({ message: 'Invalid session' });
            return;

        }

        //Get the token secret
        const tokenSecret: Secret | undefined = process.env.TOKEN_SECRET;
        if (!tokenSecret) {

            logger.error(`Token secret is missing`);
            res.status(500).send({ message: 'Token secret is missing' });
            return;

        }


        //Get the user from the db
        logger.info(`Getting the user from the db\n`);
        await userServiveHere.getUserByUserName(user?.username).then((result: GenericReturn) => {

            const user: Record<string, any> = result.data;

            //Check if the user exists
            if (!user) {

                res.status(400).send({ message: 'Invalid username' });
                return;

            }


            //Create the access token
            logger.info(`Creating the access token\n`);
            const signature: Record<string, any> = {
                id: user.id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                lastLogIn: Date.now()
            }
            const accessToken: string = jwt.sign(signature, tokenSecret);


            //Send the response
            logger.info(`Sending the response\n`);
            res.status(200).send({ accessToken: accessToken });


        }).catch((error: any) => {

            logger.error(`Error fetching user:, ${error}`);
            throw error;

        });

    } catch (error) {

        logger.error(`Error refreshing the access token: ${error}`);
        throw error;

    }

}


