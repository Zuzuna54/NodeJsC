"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessTokenHandler = void 0;
require('dotenv').config();
const utils_1 = require("../../utils/utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Logger_1 = __importDefault(require("../../utils/Logger"));
const userService_1 = __importDefault(require("../../services/userService"));
const db_1 = require("../../services/db");
const logger = new Logger_1.default();
const refreshAccessTokenHandler = async (req, res) => {
    logger.info('Initiating the refreshAccessTokenHandler\n');
    try {
        const userServiveHere = new userService_1.default(db_1.pool);
        logger.info(`Request to refresh the access token\n`);
        const body = req.body;
        const tokenHere = (body === null || body === void 0 ? void 0 : body.refreshToken) || '';
        const user = (0, utils_1.decodeToken)(tokenHere);
        logger.info(`Validating the token\n`);
        if (!tokenHere) {
            logger.error(`Token is required`);
            res.status(498).send({ message: 'Token is required' });
            return;
        }
        logger.info(`Validating the session\n`);
        const sessionValidated = await (0, utils_1.validateRefreshSession)(user === null || user === void 0 ? void 0 : user.lastLogIn);
        if (!sessionValidated) {
            logger.error(`Invalid session`);
            res.status(440).send({ message: 'Invalid session' });
            return;
        }
        const tokenSecret = process.env.TOKEN_SECRET;
        if (!tokenSecret) {
            logger.error(`Token secret is missing`);
            res.status(500).send({ message: 'Token secret is missing' });
            return;
        }
        logger.info(`Getting the user from the db\n`);
        await userServiveHere.getUserByUserName(user === null || user === void 0 ? void 0 : user.username).then((result) => {
            const user = result.data;
            if (!user) {
                res.status(400).send({ message: 'Invalid username' });
                return;
            }
            logger.info(`Creating the access token\n`);
            const signature = {
                id: user.id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                lastLogIn: Date.now()
            };
            const accessToken = jsonwebtoken_1.default.sign(signature, tokenSecret);
            logger.info(`Sending the response\n`);
            res.status(200).send({ accessToken: accessToken });
        }).catch((error) => {
            logger.error(`Error fetching user:, ${error}`);
            throw error;
        });
    }
    catch (error) {
        logger.error(`Error refreshing the access token: ${error}`);
        throw error;
    }
};
exports.refreshAccessTokenHandler = refreshAccessTokenHandler;
//# sourceMappingURL=refreshAcessToken.js.map