"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRefreshSession = exports.validateSession = exports.validateUserType = exports.validatePassword = exports.validatePasswordSpaces = exports.validatePasswordLength = exports.validateUsername = exports.decodeToken = exports.validateEmail = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const consts_1 = require("./consts");
const validateEmail = (email) => {
    console.log(`initiating validateEmail \n`);
    const emailRegex = /\S+@\S+\.\S+/;
    console.log(`emailRegex: ${emailRegex}`);
    console.log(`Validating the email\n`);
    const emailValidated = emailRegex.test(email);
    console.log(`emailValidated: ${emailValidated}`);
    return emailValidated;
};
exports.validateEmail = validateEmail;
const decodeToken = (token) => {
    const tokenSecret = process.env.TOKEN_SECRET;
    if (!tokenSecret) {
        console.error('Error: TOKEN_SECRET environment variable is not set');
        return null;
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, tokenSecret);
    const decodedTokenRecord = JSON.parse(JSON.stringify(decodedToken));
    const user = decodedTokenRecord.user;
    return user;
};
exports.decodeToken = decodeToken;
const validateUsername = (username) => {
    if (username.length < 3)
        return false;
    console.log(`initiating validateUsername \n`);
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    console.log(`usernameRegex: ${usernameRegex}`);
    console.log(`Validating the username\n`);
    const usernameValidated = usernameRegex.test(username);
    console.log(`usernameValidated: ${usernameValidated}`);
    return usernameValidated;
};
exports.validateUsername = validateUsername;
const validatePasswordLength = (password) => {
    console.log(`initiating validatePassword \n`);
    console.log(`Validating the password\n`);
    const passwordValidated = password.length >= 8;
    console.log(`passwordValidated: ${passwordValidated}`);
    return passwordValidated;
};
exports.validatePasswordLength = validatePasswordLength;
const validatePasswordSpaces = (password) => {
    console.log(`initiating validatePassword \n`);
    const passwordRegex = /\s/;
    console.log(`passwordRegex: ${passwordRegex}`);
    console.log(`Validating the password\n`);
    const passwordValidated = passwordRegex.test(password);
    console.log(`passwordValidated: ${passwordValidated}`);
    return passwordValidated;
};
exports.validatePasswordSpaces = validatePasswordSpaces;
const validatePassword = (password) => {
    if (password.length < 8)
        return false;
    console.log(`initiating validatePassword \n`);
    console.log(`Validating the password\n`);
    const passwordValidated = (0, exports.validatePasswordLength)(password) && !(0, exports.validatePasswordSpaces)(password);
    console.log(`passwordValidated: ${passwordValidated}`);
    return passwordValidated;
};
exports.validatePassword = validatePassword;
const validateUserType = (userType) => {
    console.log(`initiating validateUserType \n`);
    console.log(`Validating the userType\n`);
    const userTypeValidated = userType === consts_1.USER;
    console.log(`userTypeValidated: ${userTypeValidated}`);
    return userTypeValidated;
};
exports.validateUserType = validateUserType;
const validateSession = (lastLogin) => {
    console.log(`initiating validateSession \n`);
    console.log(`Validating the session\n`);
    const lastLoginDate = new Date(lastLogin);
    const currentDate = new Date();
    const diff = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes = diff / (1000 * 60);
    const sessionValidated = diffInMinutes < 30;
    console.log(`sessionValidated: ${sessionValidated}`);
    return sessionValidated;
};
exports.validateSession = validateSession;
const validateRefreshSession = (lastLogin) => {
    console.log(`initiating validateSession \n`);
    console.log(`Validating the session\n`);
    const lastLoginDate = new Date(lastLogin);
    const currentDate = new Date();
    const diff = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes = diff / (1000 * 60);
    const sessionValidated = diffInMinutes < 240;
    console.log(`sessionValidated: ${sessionValidated}`);
    return sessionValidated;
};
exports.validateRefreshSession = validateRefreshSession;
//# sourceMappingURL=utils.js.map