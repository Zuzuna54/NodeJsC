require('dotenv').config();
import bcryptjs from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../../models/userModel';
import Logger from '../../utils/Logger';
import GenericReturn from '../../utils/genericReturn';
import { pool } from '../../services/db';
import UserService from '../../services/userService';

//Function to log in a user
export const logInUserHandler = async (req: Request, res: Response): Promise<void> => {

    const userServiveHere: UserService = new UserService(pool);
    const logger: Logger = new Logger();
    logger.info(`Request to log in a user\n`);

    try {


        //Get the user data from the request body
        const userData: User = req.body;

        //Validate that the password and username are not empty
        if (!userData.username || !userData.password) {

            res.status(400).send({ message: 'Username and password are required' });
            return;

        }

        //Get the user from the db
        logger.info(`Getting the user from the db\n`);
        await userServiveHere.getUserByUserName(userData.username.toLowerCase()).then((result: GenericReturn) => {

            const response: GenericReturn = result;
            //Check if the user exists via status code
            if (response.statusCode !== 200) {

                logger.error(`Error fetching user: ${response.message}`);
                res.status(400).send({ message: `${response.message}` });
                return;

            }

            const user: User = result.data;

            //Check if the user exists
            if (!user) {

                logger.error(`Invalid username`);
                res.status(400).send({ message: 'Invalid username' });
                return;

            }

            //Check if the password is correct
            logger.info(`Checking if the password is correct\n`);
            comparePasswords(userData.password, user.password, res, user, userServiveHere, logger);

        }).catch((error) => {

            logger.error(`Error fetching user:, ${error}`);
            res.status(500).send({ message: 'Error fetching user' });
            return;

        });
    } catch (error) {

        logger.error(`Error logging in user:, ${error}`);
        res.status(500).send({ message: 'Error logging in user' });
        return;

    }

}


//Function to compare passwords
const comparePasswords = async (
    password: string,
    hashedPassword: string,
    res: Response,
    user: User,
    userServiceHere: UserService,
    logger: Logger

): Promise<void> => {

    try {

        //Validate the password
        logger.info(`Validating the password\n`);
        await bcryptjs.compare(password, hashedPassword).then((result: boolean) => {

            if (!result) {

                res.status(400).send({ message: 'Invalid password' });
                return;

            } else {

                logger.info(`Password is valid\n`);

                //Get token secret from environment variables
                const tokenSecret: Secret | undefined = process.env.TOKEN_SECRET;
                if (!tokenSecret) {

                    logger.error('Please define the TOKEN_SECRET environment variable inside .env.local');
                    res.status(500).send({ message: 'Token secret is missing' });
                    return;

                }

                //Create and assign acess token
                logger.info(`Creating and assigning access token\n`);
                const signature: Record<string, any> = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    lastLogIn: Date.now()
                }
                const accessToken: string = jwt.sign({ user: signature }, tokenSecret);

                //Create and assign refresh token
                logger.info(`Creating and assigning refresh token\n`);
                const refreshSignature: Record<string, any> = {
                    id: user.id,
                    username: user.username,
                    lastLogIn: Date.now()
                }
                const refretshToken: string = jwt.sign({ user: refreshSignature }, tokenSecret);

                //Update the lastLogin property of the user and respond with the tokens and user data

                logger.info(`Updating the lastLogin property of the user and responding with the tokens and user data\n`);
                updateLastLoginAndRespond(res, user, accessToken, refretshToken, userServiceHere, logger);

            }

        }).catch((error) => {

            logger.error(`Error comparing passwords:, ${error}`);
            res.status(500).send({ message: 'Error comparing passwords' });
            return;

        });
    } catch (error) {

        logger.error(`Error comparing passwords:, ${error}`);
        res.status(500).send({ message: 'Error comparing passwords' });
        return;

    }

}


//Function to update the lastLogin property of a user and respond with the tokens and user data
const updateLastLoginAndRespond = async (
    res: Response,
    user: User,
    accessToken: string,
    refreshToken: string,
    userServiceHere: UserService,
    logger: Logger
): Promise<void> => {

    try {

        //Update the lastLogin property of the user
        logger.info(`Updating the lastLogin property of the user\n`);
        await userServiceHere.updateUser(user).then((result: GenericReturn) => {

            if (result.statusCode === 200) {

                //Respond with the tokens and user data
                logger.info(`Responding with the tokens and user data\n`);
                const response: Record<string, any> = {
                    accessToken,
                    refreshToken,
                    user: result,
                    message: 'User logged in successfully',
                    statusCode: 200,
                }
                res.status(200).send(response);
                return;

            } else {

                logger.error(`Error updating the lastLogin property of the user`);
                res.status(400).send({ message: 'Error updating the lastLogin property of the user' });
                return;

            }



        }).catch((error) => {

            logger.error(`Error updating the lastLogin property of the user:, ${error}`);
            res.status(500).send({ message: 'Error updating the lastLogin property of the user' });
            return;

        });

    } catch (error) {

        logger.error(`Error updating the lastLogin property of the user:, ${error}`);
        res.status(500).send({ message: 'Error updating the lastLogin property of the user' });
        return;

    }

}