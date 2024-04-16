import jwt, { Secret } from 'jsonwebtoken';



//Helper fucntion to check if the email is valid
export const validateEmail = (email: string): boolean => {

    console.log(`initiating validateEmail \n`);

    //Regex to validate email
    const emailRegex: RegExp = /\S+@\S+\.\S+/;
    console.log(`emailRegex: ${emailRegex}`);

    //Validate the email
    console.log(`Validating the email\n`)
    const emailValidated: boolean = emailRegex.test(email);
    console.log(`emailValidated: ${emailValidated}`);

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

    console.log(`initiating validateUsername \n`);

    //Regex to validate username
    const usernameRegex: RegExp = /^[a-zA-Z0-9]+$/;
    console.log(`usernameRegex: ${usernameRegex}`);

    //Validate the username
    console.log(`Validating the username\n`)
    const usernameValidated: boolean = usernameRegex.test(username);
    console.log(`usernameValidated: ${usernameValidated}`);

    return usernameValidated

};


//Helper function to validate password to be longer than 8 characters
export const validatePasswordLength = (password: string): boolean => {

    console.log(`initiating validatePassword \n`);

    //Validate the password
    console.log(`Validating the password\n`)
    const passwordValidated: boolean = password.length >= 8;
    console.log(`passwordValidated: ${passwordValidated}`);

    return passwordValidated

};


//Helper function to validate password not to contain empty spaces
export const validatePasswordSpaces = (password: string): boolean => {

    console.log(`initiating validatePassword \n`);

    //Regex to validate password
    const passwordRegex: RegExp = /\s/;
    console.log(`passwordRegex: ${passwordRegex}`);

    //Validate the password
    console.log(`Validating the password\n`)
    const passwordValidated: boolean = passwordRegex.test(password);
    console.log(`passwordValidated: ${passwordValidated}`);

    return passwordValidated

};


//Helper function to validate password
export const validatePassword = (password: string): boolean => {

    if (password.length < 8) return false;

    console.log(`initiating validatePassword \n`);

    //Validate the password
    console.log(`Validating the password\n`)
    const passwordValidated: boolean = validatePasswordLength(password) && !validatePasswordSpaces(password);
    console.log(`passwordValidated: ${passwordValidated}`);

    return passwordValidated

};



//Helper function that takes in a date and validates that session is still active
export const validateSession = (lastLogin: string): boolean => {

    console.log(`initiating validateSession \n`);

    //Validate the session
    console.log(`Validating the session\n`)
    const lastLoginDate: Date = new Date(lastLogin);
    const currentDate: Date = new Date();
    const diff: number = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes: number = diff / (1000 * 60);
    const sessionValidated: boolean = diffInMinutes < 30;
    console.log(`sessionValidated: ${sessionValidated}`);

    return sessionValidated

};


//Helper function that validates refresh token is still valid
export const validateRefreshSession = (lastLogin: string): boolean => {

    console.log(`initiating validateSession \n`);

    //Validate the session
    console.log(`Validating the session\n`)
    const lastLoginDate: Date = new Date(lastLogin);
    const currentDate: Date = new Date();
    const diff: number = currentDate.getTime() - lastLoginDate.getTime();
    const diffInMinutes: number = diff / (1000 * 60);
    const sessionValidated: boolean = diffInMinutes < 240;
    console.log(`sessionValidated: ${sessionValidated}`);

    return sessionValidated

};

// Function to count occurrences of a word in a string
export const countOccurrences = (text: string, word: string, searchProximityStr: string, proximity: number): number => {
    // Escape special characters in the searchString to ensure they are treated as literals in regex
    const escapedSearchString = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Create a regex to find all instances of the searchString, case-insensitively
    const regex = new RegExp(escapedSearchString, 'gi');
    // Match the searchString against the text
    const matches = text.match(regex);
    // Return the number of matches, or 0 if no matches are found
    return matches ? matches.length : 0;
};

// Function to find sentences containing a word in a string
export const findSentences = (text: string, word: string, searchProximityStr: string, proximity: number): string[] => {
    const sentences: string[] = [];
    let currentSentence = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        currentSentence += char;

        // Check if the current character is one of ., !, or ?
        if (char === '.' || char === '!' || char === '?') {
            // Check if the next character is a space followed by a lowercase letter
            if (text[i + 1] === ' ' && /[a-z]/.test(text[i + 2])) {
                continue; // Not the end of a sentence
            }
            // Check if the current sentence contains the word
            if (currentSentence.toLowerCase().includes(word.toLowerCase())) {
                sentences.push(currentSentence.trim());
            }
            currentSentence = '';
        }
    }

    // Add the last sentence if there's anything left and it contains the word
    if (currentSentence.trim() !== '' && currentSentence.toLowerCase().includes(word.toLowerCase())) {
        sentences.push(currentSentence.trim());
    }

    return sentences;
};

// Function to format sentences for human readability
export const formatSentences = (sentences: string[]): string[] => {
    return sentences.map(sentence => `- ${sentence.replace(/\n/g, '').replace(/\s+/g, ' ').trim()}`);
};