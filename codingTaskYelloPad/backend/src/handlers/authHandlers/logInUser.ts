require('dotenv').config();
import bcryptjs from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from '../../models/userModel';
import userService from '../../services/userService';
import logger from '../../utils/Logger';
import GenericReturn from 'src/utils/genericReturn';
import { pool } from '../../services/db';


//Function to log in a user
export const logInUserHandler = async (req: Request, res: Response): Promise<void> => {

    try {

        //Get the pool from the request
        const userServiveHere = new userService(pool);

        //Log the request
        logger.info(`Request to log in a user\n`);

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

            const user: User = result.data;

            //Check if the user exists
            if (!user) {

                res.status(400).send({ message: 'Invalid username or password' });
                return;

            }

            //Check if the password is correct
            logger.info(`Checking if the password is correct\n`);
            comparePasswords(userData.password, user.password, res, user, userServiveHere);

        }).catch((error) => {

            logger.error(`Error fetching user:, ${error}`);
            throw error;

        });
    } catch (error) {

        logger.error(`Error logging in user:, ${error}`);
        throw error;

    }

}


//Function to compare passwords
const comparePasswords = async (
    password: string,
    hashedPassword: string,
    res: Response,
    user: User,
    userServiceHere: userService
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
                    throw new Error(
                        'Please define the TOKEN_SECRET environment variable inside .env.local',
                    );

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
                updateLastLoginAndRespond(res, user, accessToken, refretshToken, userServiceHere);

            }

        }).catch((error) => {

            logger.error(`Error comparing passwords:, ${error}`);
            throw error;

        });
    } catch (error) {

        logger.error(`Error comparing passwords:, ${error}`);
        throw error;

    }

}


//Function to update the lastLogin property of a user and respond with the tokens and user data
const updateLastLoginAndRespond = async (
    res: Response,
    user: User,
    accessToken: string,
    refreshToken: string,
    userServiceHere: userService
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


            } else {

                res.status(400).send({ message: 'Error updating the lastLogin property of the user' });
                return;

            }

            logger.info(`User updated: ${result}`);

        }).catch((error) => {

            logger.error(`Error updating the lastLogin property of the user:, ${error}`);
            throw error;

        });

    } catch (error) {

        logger.error(`Error updating the lastLogin property of the user:, ${error}`);
        throw error;

    }

}