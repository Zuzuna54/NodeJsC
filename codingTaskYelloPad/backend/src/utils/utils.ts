import jwt, { Secret } from 'jsonwebtoken';
import { USER } from './consts';


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


//Helper function to decode the JWT token
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


//Helper function to validate userType
export const validateUserType = (userType: string): boolean => {

    console.log(`initiating validateUserType \n`);

    //Validate the userType
    console.log(`Validating the userType\n`)
    const userTypeValidated: boolean = userType === USER;
    console.log(`userTypeValidated: ${userTypeValidated}`);

    return userTypeValidated

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