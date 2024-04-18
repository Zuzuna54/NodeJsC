import jwt, { Secret } from 'jsonwebtoken';
import Logger from './Logger';


const logger: Logger = new Logger();
//Helper fucntion to check if the email is valid
export const validateEmail = (email: string): boolean => {

    logger.info(`initiating validateEmail \n`);

    //Regex to validate email
    const emailRegex: RegExp = /\S+@\S+\.\S+/;
    logger.info(`emailRegex: ${emailRegex}`);

    //Validate the email
    logger.info(`Validating the email\n`)
    const emailValidated: boolean = emailRegex.test(email);
    logger.info(`emailValidated: ${emailValidated}`);

    return emailValidated

};


//Helper function to decode the JWT token and return the user
export const decodeToken = (token: string): Record<string, any> | null => {

    const tokenSecret: Secret | undefined = process.env.TOKEN_SECRET;
    if (!tokenSecret) {
        console.error('Error: TOKEN_SECRET environment variable is not set');
        return null
    }

    // Verify the token
    const decodedToken: string | jwt.JwtPayload = jwt.verify(token, tokenSecret as Secret);
    const decodedTokenRecord: Record<string, any> = JSON.parse(JSON.stringify(decodedToken));
    const user: Record<string, any> = decodedTokenRecord.user;

    return user
}



//Helper function to validate username not to contain empty spaces and special characters
export const validateUsername = (username: string): boolean => {

    if (username.length < 3) return false;

    logger.info(`initiating validateUsername \n`);

    //Regex to validate username
    const usernameRegex: RegExp = /^[a-zA-Z0-9]+$/;
    logger.info(`usernameRegex: ${usernameRegex}`);

    //Validate the username
    logger.info(`Validating the username\n`)
    const usernameValidated: boolean = usernameRegex.test(username);
    logger.info(`usernameValidated: ${usernameValidated}`);

    return usernameValidated

};


//Helper function to validate password to be longer than 8 characters
export const validatePasswordLength = (password: string): boolean => {

    logger.info(`initiating validatePassword \n`);

    //Validate the password
    logger.info(`Validating the password\n`)
    const passwordValidated: boolean = password.length >= 8;
    logger.info(`passwordValidated: ${passwordValidated}`);

    return passwordValidated

};


//Helper function to validate password not to contain empty spaces
export const validatePasswordSpaces = (password: string): boolean => {

    logger.info(`initiating validatePassword \n`);

    //Regex to validate password
    const passwordRegex: RegExp = /\s/;
    logger.info(`passwordRegex: ${passwordRegex}`);

    //Validate the password
    logger.info(`Validating the password\n`)
    const passwordValidated: boolean = passwordRegex.test(password);
    logger.info(`passwordValidated: ${passwordValidated}`);

    return passwordValidated

};


//Helper function to validate password
export const validatePassword = (password: string): boolean => {

    logger.info(`initiating validatePassword \n`);

    //Check if the password is less than 8 characters
    if (password.length < 8) return false;

    //Validate the password
    logger.info(`Validating the password\n`)
    const passwordValidated: boolean = validatePasswordLength(password) && !validatePasswordSpaces(password);
    logger.info(`passwordValidated: ${passwordValidated}`);

    return passwordValidated

};


//Helper function that takes in a date and validates that session is still active
export const validateSession = (lastLogin: string): boolean => {

    logger.info(`initiating validateSession \n`);

    //Validate the session
    logger.info(`Validating the session\n`)
    const lastLoginDate: Date = new Date(lastLogin);
    const currentDate: Date = new Date();
    const diff: number = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes: number = diff / (1000 * 60);
    const sessionValidated: boolean = diffInMinutes < 30;
    logger.info(`sessionValidated: ${sessionValidated}`);

    return sessionValidated

};


//Helper function that validates refresh token is still valid
export const validateRefreshSession = (lastLogin: string): boolean => {

    logger.info(`initiating validateSession \n`);

    //Validate the session
    logger.info(`Validating the session\n`)
    const lastLoginDate: Date = new Date(lastLogin);
    const currentDate: Date = new Date();
    const diff: number = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes: number = diff / (1000 * 60); // convert to minutes
    const sessionValidated: boolean = diffInMinutes < 240; // 4 hours
    logger.info(`sessionValidated: ${sessionValidated}`);

    return sessionValidated

};


//Helper function to analyze text and return the word count and sentences containing the word
export const analyzeText = (text: string, word: string): { wordCount: number, sentences: string[] } => {

    const escapedSearchString = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedSearchString, 'gi');
    const matches = text.match(regex);
    const wordCount = matches ? matches.length : 0;

    const sentences: string[] = [];
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


// Function to analyze text and return the word count and sentences containing the word account for 2 possible typos in the word, and add proximity value as a parameter for a different search word, and only return matches where we have words with posssible typos and proximity value as a parameter with matches diifertent search word
export const analyzeTextWithProximity = (text: string, word: string): { wordCount: number, sentences: string[] } => {
    // Escape search string
    const escapedSearchString = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Construct regular expression for matching the target word with possible typos
    const typoRegex = new RegExp(
        `(${escapedSearchString}|${escapedSearchString
            .split('')
            .map(
                (char, index) =>
                    `(${escapedSearchString.slice(0, index)}[^${char}]?${escapedSearchString.slice(index + 1)})`
            )
            .join('|')})`,
        'gi'
    );

    // Match the target word with possible typos in the text
    const matches = text.match(typoRegex) || [];
    const wordCount = matches.length;

    // Extract sentences containing matches
    const sentences: string[] = [];
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





// Function to format sentences for human readability
export const formatSentences = (sentences: string[]): string[] => {
    return sentences.map(sentence => `- ${sentence.replace(/\n/g, '').replace(/\s+/g, ' ').trim()}`);
};