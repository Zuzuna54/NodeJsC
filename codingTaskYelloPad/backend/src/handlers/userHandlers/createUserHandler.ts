import {
    validateEmail,
    validateUsername,
    validatePassword,
    validateUserType,
} from '../../utils/utils';
import logger from '../../logger/Logger';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import userService from '../../mongoCalls/userService/userService';
import { Request, Response } from 'express';
import { UserAttributes } from '../../models/User';
import { ACTIVE } from '../../utils/consts';


//Function to register a user
export const createUserHandler = async (req: Request, res: Response): Promise<void> => {

    try {

        const userServiceHere = new userService();

        //Log the request
        logger.info(`Request to register a user\n`);

        //Get the user data from the request body
        const { username, email, password, userType } = req.body;
        const userData: UserAttributes = req.body;
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

        logger.info(`Validating the userType\n`);
        const userTypeValidated: boolean = validateUserType(userType);
        if (!userTypeValidated) {
            res.status(400).send({ message: 'Invalid userType' });
            return;
        }

        //Check if the user already exists
        logger.info(`Checking if the user already exists\n`);
        await userServiceHere.getUserByUserName(username, email).then((result: UserAttributes | null) => {

            if (result) {

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

        }).catch((error) => {

            logger.error(`Error checking if the user already exists:, ${error}`);
            throw error;

        });
    } catch (error) {

        logger.error(`Error creating user:, ${error}`);
        throw error;
    }

}


//Function to create a new user
const createNewUser = async (res: Response, userData: UserAttributes, userServiceHere: userService): Promise<void> => {

    try {
        //Hash the password
        logger.info(`Hashing the password\n`);
        const saltRounds: number = 10;
        const hashedPassword: string = await bcrypt.hash(userData.password, saltRounds);
        logger.info(`hashedPassword: ${hashedPassword}`);

        //Create the user
        logger.info(`Creating the user\n`);
        const user: UserAttributes = {
            ...userData,
            id: uuidv4(),
            password: hashedPassword,
            status: ACTIVE,
            createdAt: new Date().toISOString(),
            updatedAt: "NOT UPDATED",
            lastLogin: "NOT LOGGED IN",

        }

        logger.info(`user: ${user}`);

        //Save the user to the db
        logger.info(`Saving the user to the db\n`);
        await userServiceHere.createUser(user).then((result: UserAttributes) => {

            //User created
            logger.info(`User created\n`);

            //Get the user from the result
            logger.info(`Getting the user from the result\n`);
            const newUser: UserAttributes = result;

            //Send the user in the response
            console.log(`Sending the user in the response\n`);
            const response: Record<string, any> = {
                result: "success",
                user: newUser,
                message: 'User created',
                statusCode: 200,
            };

            res.status(200).send({ response });


        }).catch((error) => {

            console.log(`error: ${error}`);
            throw error;

        });
    } catch (error) {

        console.log(`error: ${error}`);
        throw error;

    }
}
