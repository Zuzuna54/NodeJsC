import {

    validateEmail,
    validateUsername,
    validatePassword

} from '../../utils/utils';
import logger from '../../utils/Logger';
import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import userService from '../../services/userService';
import { Request, Response } from 'express';
import { User } from '../../models/userModel';
import GenericReturn from 'src/utils/genericReturn';
import { pool } from '../../services/db';

//Function to register a user
export const createUserHandler = async (req: Request, res: Response): Promise<void> => {

    logger.info(`initiating the createUserHandler\n`);

    try {

        const userServiceHere = new userService(pool);

        //Log the request
        logger.info(`Request to register a user\n`);

        //Get the user data from the request body
        const { username, email, password } = req.body;
        const userData: User = req.body;
        logger.info(`email: ${JSON.stringify(email)}`);


        //Validate the user data
        logger.info(`Validating the email\n`);
        const emailValidated: boolean = validateEmail(email);
        if (!emailValidated) {
            res.status(400).send({ message: 'Invalid email' });
            return;
        }

        logger.info(`Validating the username\n`);
        const usernameValidated: boolean = validateUsername(username);
        if (!usernameValidated) {
            res.status(400).send({ message: 'Invalid username' });
            return;
        }

        logger.info(`Validating the password\n`);
        const passwordValidated: boolean = validatePassword(password);
        if (!passwordValidated) {
            res.status(400).send({ message: 'Invalid password, must be 8 chars or longer' });
            return;
        }

        //Check if the user already exists
        logger.info(`Checking if the user already exists\n`);
        await userServiceHere.getUserByUserName(username).then((result: GenericReturn) => {

            if (result.statusCode === 200) {

                logger.info(`User already exists\n`);
                res.status(400).send({ message: 'User with that email or username already exists' });
                return result;

            } else {

                logger.info(`User does not exist\n`);

                //Create the user
                logger.info(`Creating the user\n`);
                createNewUser(res, userData, userServiceHere);
                return result;

            }

        }).catch((error: Error) => {

            logger.error(`Error checking if the user already exists:, ${error}`);
            throw error;

        });

    } catch (error) {

        logger.error(`Error creating user:, ${error}`);
        throw error;
    }

}


//Function to create a new user
const createNewUser = async (res: Response, userData: User, userServiceHere: userService): Promise<void> => {

    try {
        //Hash the password
        logger.info(`Hashing the password\n`);
        const saltRounds: number = 10;
        const hashedPassword: string = await bcryptjs.hash(userData.password, saltRounds);
        logger.info(`hashedPassword: ${hashedPassword}`);

        //Create the user
        logger.info(`Creating the user\n`);
        const user: User = {
            username: userData.username,
            email: userData.email,
            id: uuidv4(),
            password: hashedPassword,
        }

        logger.info(`user: ${user}`);

        //Save the user to the db
        logger.info(`Saving the user to the db\n`);
        await userServiceHere.createUser(user).then((result: GenericReturn) => {

            if (result.statusCode === 200) {

                //User created
                logger.info(`User created\n`);

                //Get the user from the result
                logger.info(`Getting the user from the result\n`);

                //Send the user in the response
                logger.info(`Sending the response\n`);
                const response: Record<string, any> = {
                    result: "success",
                    user: user.username,
                    message: 'User created',
                    statusCode: 200,
                };

                res.status(200).send({ response });
                return result;

            } else {

                logger.error(`Failed to create user\n`);
                res.status(500).send({ message: 'Failed to create user ' + result.message });
                return result;

            }

        }).catch((error: Error) => {

            logger.error(`Error saving the user to the db:, ${error}`);
            throw error;

        });
    } catch (error) {

        logger.error(`Error saving the user to the db:, ${error}`);
        throw error;

    }
}
