"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSentences = exports.analyzeTextWithProximity = exports.analyzeText = exports.validateRefreshSession = exports.validateSession = exports.validatePassword = exports.validatePasswordSpaces = exports.validatePasswordLength = exports.validateUsername = exports.decodeToken = exports.validateEmail = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Logger_1 = __importDefault(require("./Logger"));
const logger = new Logger_1.default();
const validateEmail = (email) => {
    logger.info(`initiating validateEmail \n`);
    const emailRegex = /\S+@\S+\.\S+/;
    logger.info(`emailRegex: ${emailRegex}`);
    logger.info(`Validating the email\n`);
    const emailValidated = emailRegex.test(email);
    logger.info(`emailValidated: ${emailValidated}`);
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
    logger.info(`initiating validateUsername \n`);
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    logger.info(`usernameRegex: ${usernameRegex}`);
    logger.info(`Validating the username\n`);
    const usernameValidated = usernameRegex.test(username);
    logger.info(`usernameValidated: ${usernameValidated}`);
    return usernameValidated;
};
exports.validateUsername = validateUsername;
const validatePasswordLength = (password) => {
    logger.info(`initiating validatePassword \n`);
    logger.info(`Validating the password\n`);
    const passwordValidated = password.length >= 8;
    logger.info(`passwordValidated: ${passwordValidated}`);
    return passwordValidated;
};
exports.validatePasswordLength = validatePasswordLength;
const validatePasswordSpaces = (password) => {
    logger.info(`initiating validatePassword \n`);
    const passwordRegex = /\s/;
    logger.info(`passwordRegex: ${passwordRegex}`);
    logger.info(`Validating the password\n`);
    const passwordValidated = passwordRegex.test(password);
    logger.info(`passwordValidated: ${passwordValidated}`);
    return passwordValidated;
};
exports.validatePasswordSpaces = validatePasswordSpaces;
const validatePassword = (password) => {
    logger.info(`initiating validatePassword \n`);
    if (password.length < 8)
        return false;
    logger.info(`Validating the password\n`);
    const passwordValidated = (0, exports.validatePasswordLength)(password) && !(0, exports.validatePasswordSpaces)(password);
    logger.info(`passwordValidated: ${passwordValidated}`);
    return passwordValidated;
};
exports.validatePassword = validatePassword;
const validateSession = (lastLogin) => {
    logger.info(`initiating validateSession \n`);
    logger.info(`Validating the session\n`);
    const lastLoginDate = new Date(lastLogin);
    const currentDate = new Date();
    const diff = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes = diff / (1000 * 60);
    const sessionValidated = diffInMinutes < 30;
    logger.info(`sessionValidated: ${sessionValidated}`);
    return sessionValidated;
};
exports.validateSession = validateSession;
const validateRefreshSession = (lastLogin) => {
    logger.info(`initiating validateSession \n`);
    logger.info(`Validating the session\n`);
    const lastLoginDate = new Date(lastLogin);
    const currentDate = new Date();
    const diff = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes = diff / (1000 * 60);
    const sessionValidated = diffInMinutes < 240;
    logger.info(`sessionValidated: ${sessionValidated}`);
    return sessionValidated;
};
exports.validateRefreshSession = validateRefreshSession;
const analyzeText = (text, word) => {
    const escapedSearchString = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedSearchString, 'gi');
    const matches = text.match(regex);
    const wordCount = matches ? matches.length : 0;
    const sentences = [];
    let currentSentence = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentSentence += char;
        if (char === '.' || char === '!' || char === '?') {
            if (text[i + 1] === ' ' && /[a-z]/.test(text[i + 2])) {
                continue;
            }
            if (currentSentence.toLowerCase().includes(word.toLowerCase())) {
                sentences.push(currentSentence.trim());
            }
            currentSentence = '';
        }
    }
    if (currentSentence.trim() !== '' && currentSentence.toLowerCase().includes(word.toLowerCase())) {
        sentences.push(currentSentence.trim());
    }
    return { wordCount, sentences };
};
exports.analyzeText = analyzeText;
const analyzeTextWithProximity = (text, word) => {
    const escapedSearchString = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const typoRegex = new RegExp(`(${escapedSearchString}|${escapedSearchString
        .split('')
        .map((char, index) => `(${escapedSearchString.slice(0, index)}[^${char}]?${escapedSearchString.slice(index + 1)})`)
        .join('|')})`, 'gi');
    const matches = text.match(typoRegex) || [];
    const wordCount = matches.length;
    const sentences = [];
    let currentSentence = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentSentence += char;
        if (char === '.' || char === '!' || char === '?') {
            if (text[i + 1] === ' ' && /[a-z]/.test(text[i + 2])) {
                continue;
            }
            if (matches.some(match => currentSentence.toLowerCase().includes(match.toLowerCase()))) {
                sentences.push(currentSentence.trim());
            }
            currentSentence = '';
        }
    }
    if (currentSentence.trim() !== '' && matches.some(match => currentSentence.toLowerCase().includes(match.toLowerCase()))) {
        sentences.push(currentSentence.trim());
    }
    return { wordCount, sentences };
};
exports.analyzeTextWithProximity = analyzeTextWithProximity;
const formatSentences = (sentences) => {
    return sentences.map(sentence => `- ${sentence.replace(/\n/g, '').replace(/\s+/g, ' ').trim()}`);
};
exports.formatSentences = formatSentences;
//# sourceMappingURL=utils.js.map