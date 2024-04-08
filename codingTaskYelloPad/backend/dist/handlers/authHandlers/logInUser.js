"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInUserHandler = void 0;
require('dotenv').config();
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService_1 = __importDefault(require("../../services/userService"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
const db_1 = require("../../services/db");
const logInUserHandler = async (req, res) => {
    try {
        const userServiveHere = new userService_1.default(db_1.pool);
        Logger_1.default.info(`Request to log in a user\n`);
        const userData = req.body;
        if (!userData.username || !userData.password) {
            res.status(400).send({ message: 'Username and password are required' });
            return;
        }
        Logger_1.default.info(`Getting the user from the db\n`);
        await userServiveHere.getUserByUserName(userData.username.toLowerCase()).then((result) => {
            const user = result.data;
            if (!user) {
                res.status(400).send({ message: 'Invalid username or password' });
                return;
            }
            Logger_1.default.info(`Checking if the password is correct\n`);
            comparePasswords(userData.password, user.password, res, user, userServiveHere);
        }).catch((error) => {
            Logger_1.default.error(`Error fetching user:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        Logger_1.default.error(`Error logging in user:, ${error}`);
        throw error;
    }
};
exports.logInUserHandler = logInUserHandler;
const comparePasswords = async (password, hashedPassword, res, user, userServiceHere) => {
    try {
        Logger_1.default.info(`Validating the password\n`);
        await bcryptjs_1.default.compare(password, hashedPassword).then((result) => {
            if (!result) {
                res.status(400).send({ message: 'Invalid password' });
                return;
            }
            else {
                Logger_1.default.info(`Password is valid\n`);
                const tokenSecret = process.env.TOKEN_SECRET;
                if (!tokenSecret) {
                    Logger_1.default.error('Please define the TOKEN_SECRET environment variable inside .env.local');
                    throw new Error('Please define the TOKEN_SECRET environment variable inside .env.local');
                }
                Logger_1.default.info(`Creating and assigning access token\n`);
                const signature = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    lastLogIn: Date.now()
                };
                const accessToken = jsonwebtoken_1.default.sign({ user: signature }, tokenSecret);
                Logger_1.default.info(`Creating and assigning refresh token\n`);
                const refreshSignature = {
                    id: user.id,
                    username: user.username,
                    lastLogIn: Date.now()
                };
                const refretshToken = jsonwebtoken_1.default.sign({ user: refreshSignature }, tokenSecret);
                Logger_1.default.info(`Updating the lastLogin property of the user and responding with the tokens and user data\n`);
                updateLastLoginAndRespond(res, user, accessToken, refretshToken, userServiceHere);
            }
        }).catch((error) => {
            Logger_1.default.error(`Error comparing passwords:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        Logger_1.default.error(`Error comparing passwords:, ${error}`);
        throw error;
    }
};
const updateLastLoginAndRespond = async (res, user, accessToken, refreshToken, userServiceHere) => {
    try {
        Logger_1.default.info(`Updating the lastLogin property of the user\n`);
        await userServiceHere.updateUser(user).then((result) => {
            if (result.statusCode === 200) {
                Logger_1.default.info(`Responding with the tokens and user data\n`);
                const response = {
                    accessToken,
                    refreshToken,
                    user: result,
                    message: 'User logged in successfully',
                    statusCode: 200,
                };
                res.status(200).send(response);
            }
            else {
                res.status(400).send({ message: 'Error updating the lastLogin property of the user' });
                return;
            }
            Logger_1.default.info(`User updated: ${result}`);
        }).catch((error) => {
            Logger_1.default.error(`Error updating the lastLogin property of the user:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        Logger_1.default.error(`Error updating the lastLogin property of the user:, ${error}`);
        throw error;
    }
};
//# sourceMappingURL=logInUser.js.map