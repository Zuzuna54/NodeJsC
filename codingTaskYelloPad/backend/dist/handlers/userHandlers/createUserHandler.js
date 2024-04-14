"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserHandler = void 0;
const utils_1 = require("../../utils/utils");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userService_1 = __importDefault(require("../../services/userService"));
const db_1 = require("../../services/db");
const logger = new Logger_1.default();
const createUserHandler = async (req, res) => {
    logger.info(`initiating the createUserHandler\n`);
    try {
        const userServiceHere = new userService_1.default(db_1.pool);
        logger.info(`Request to register a user\n`);
        const { username, email, password } = req.body;
        const userData = req.body;
        logger.info(`email: ${JSON.stringify(email)}`);
        logger.info(`Validating the email\n`);
        const emailValidated = (0, utils_1.validateEmail)(email);
        if (!emailValidated) {
            res.status(400).send({ message: 'Invalid email' });
            return;
        }
        logger.info(`Validating the username\n`);
        const usernameValidated = (0, utils_1.validateUsername)(username);
        if (!usernameValidated) {
            res.status(400).send({ message: 'Invalid username' });
            return;
        }
        logger.info(`Validating the password\n`);
        const passwordValidated = (0, utils_1.validatePassword)(password);
        if (!passwordValidated) {
            res.status(400).send({ message: 'Invalid password, must be 8 chars or longer' });
            return;
        }
        logger.info(`Checking if the user already exists\n`);
        await userServiceHere.getUserByUserName(username).then((result) => {
            if (result.statusCode === 200) {
                logger.info(`User already exists\n`);
                res.status(400).send({ message: 'User with that email or username already exists' });
                return result;
            }
            else {
                logger.info(`User does not exist\n`);
                logger.info(`Creating the user\n`);
                createNewUser(res, userData, userServiceHere);
                return result;
            }
        }).catch((error) => {
            logger.error(`Error checking if the user already exists:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        logger.error(`Error creating user:, ${error}`);
        throw error;
    }
};
exports.createUserHandler = createUserHandler;
const createNewUser = async (res, userData, userServiceHere) => {
    try {
        logger.info(`Hashing the password\n`);
        const saltRounds = 10;
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, saltRounds);
        logger.info(`hashedPassword: ${hashedPassword}`);
        logger.info(`Creating the user\n`);
        const user = {
            username: userData.username,
            email: userData.email,
            id: (0, uuid_1.v4)(),
            password: hashedPassword,
        };
        logger.info(`user: ${user}`);
        logger.info(`Saving the user to the db\n`);
        await userServiceHere.createUser(user).then((result) => {
            if (result.statusCode === 200) {
                logger.info(`User created\n`);
                logger.info(`Getting the user from the result\n`);
                logger.info(`Sending the response\n`);
                const response = {
                    result: "success",
                    user: user.username,
                    message: 'User created',
                    statusCode: 200,
                };
                res.status(200).send({ response });
                return result;
            }
            else {
                logger.error(`Failed to create user\n`);
                res.status(500).send({ message: 'Failed to create user ' + result.message });
                return result;
            }
        }).catch((error) => {
            logger.error(`Error saving the user to the db:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        logger.error(`Error saving the user to the db:, ${error}`);
        throw error;
    }
};
//# sourceMappingURL=createUserHandler.js.map