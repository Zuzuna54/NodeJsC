"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserHandler = void 0;
const utils_1 = require("../../utils/utils");
const Logger_1 = __importDefault(require("../../utils/Logger"));
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userService_1 = __importDefault(require("../../services/userService"));
const createUserHandler = async (req, res) => {
    const pool = req.app.get('pool');
    try {
        const userServiceHere = new userService_1.default(pool);
        Logger_1.default.info(`Request to register a user\n`);
        const { username, email, password } = req.body;
        const userData = req.body;
        Logger_1.default.info(`email: ${JSON.stringify(email)}`);
        Logger_1.default.info(`Validating the email\n`);
        const emailValidated = (0, utils_1.validateEmail)(email);
        if (!emailValidated) {
            res.status(400).send({ message: 'Invalid email' });
            return;
        }
        Logger_1.default.info(`Validating the username\n`);
        const usernameValidated = (0, utils_1.validateUsername)(username);
        if (!usernameValidated) {
            res.status(400).send({ message: 'Invalid username' });
            return;
        }
        Logger_1.default.info(`Validating the password\n`);
        const passwordValidated = (0, utils_1.validatePassword)(password);
        if (!passwordValidated) {
            res.status(400).send({ message: 'Invalid password, must be 8 chars or longer' });
            return;
        }
        Logger_1.default.info(`Checking if the user already exists\n`);
        await userServiceHere.getUserByUserName(username).then((result) => {
            if (result.statusCode === 200) {
                Logger_1.default.info(`User already exists\n`);
                res.status(400).send({ message: 'User with that email or username already exists' });
                return result;
            }
            else {
                Logger_1.default.info(`User does not exist\n`);
                Logger_1.default.info(`Creating the user\n`);
                createNewUser(res, userData, userServiceHere);
                return result;
            }
        }).catch((error) => {
            Logger_1.default.error(`Error checking if the user already exists:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        Logger_1.default.error(`Error creating user:, ${error}`);
        throw error;
    }
};
exports.createUserHandler = createUserHandler;
const createNewUser = async (res, userData, userServiceHere) => {
    try {
        Logger_1.default.info(`Hashing the password\n`);
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(userData.password, saltRounds);
        Logger_1.default.info(`hashedPassword: ${hashedPassword}`);
        Logger_1.default.info(`Creating the user\n`);
        const user = {
            username: userData.username,
            email: userData.email,
            id: (0, uuid_1.v4)(),
            password: hashedPassword,
        };
        Logger_1.default.info(`user: ${user}`);
        Logger_1.default.info(`Saving the user to the db\n`);
        await userServiceHere.createUser(user).then((result) => {
            if (result.statusCode === 200) {
                Logger_1.default.info(`User created\n`);
                Logger_1.default.info(`Getting the user from the result\n`);
                Logger_1.default.info(`Sending the response\n`);
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
                Logger_1.default.error(`Failed to create user\n`);
                res.status(500).send({ message: 'Failed to create user' });
                return result;
            }
        }).catch((error) => {
            Logger_1.default.error(`Error saving the user to the db:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        Logger_1.default.error(`Error saving the user to the db:, ${error}`);
        throw error;
    }
};
//# sourceMappingURL=createUserHandler.js.map