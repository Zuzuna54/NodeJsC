"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genericReturn_1 = __importDefault(require("../utils/genericReturn"));
const Logger_1 = __importDefault(require("../utils/Logger"));
class UserService {
    constructor(pool) {
        this.pool = pool;
    }
    async createUser(user) {
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
        try {
            const result = await this.pool.query(query, [user.username, user.email, user.password]);
            if (result.rowCount !== 1) {
                Logger_1.default.error('Failed to create user.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to create user.';
                return returnResult;
            }
            Logger_1.default.info('User created.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User created.';
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error creating user: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to create user.';
            return returnResult;
        }
    }
    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [email]);
            if (result.rows.length == 0) {
                Logger_1.default.error('Failed to fetch user by email.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch user by email.';
                return returnResult;
            }
            Logger_1.default.info('User fetched.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User fetched.';
            returnResult.data = result.rows[0];
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error fetching user by email:  ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch user by email.';
            return returnResult;
        }
    }
    async getUserById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [id]);
            if (result.rows.length == 0) {
                Logger_1.default.error('Failed to fetch user by ID.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch user by ID.';
                return returnResult;
            }
            Logger_1.default.info('User fetched.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User fetched.';
            returnResult.data = result.rows[0];
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error fetching user by ID: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch user by ID.';
            return returnResult;
        }
    }
    async getUserByUserName(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [username]);
            if (result.rows.length == 0) {
                Logger_1.default.error('Failed to fetch user by username.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to fetch user by username.';
                return returnResult;
            }
            Logger_1.default.info('User fetched.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User fetched.';
            returnResult.data = result.rows[0];
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error fetching user by username: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to fetch user by username.';
            return returnResult;
        }
    }
    async updateUser(user) {
        const query = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4';
        const returnResult = new genericReturn_1.default('', 0, '', '', '');
        try {
            const result = await this.pool.query(query, [user.username, user.email, user.password, user.id]);
            if (result.rowCount !== 1) {
                Logger_1.default.error('Failed to update user.');
                returnResult.result = 'Failed';
                returnResult.statusCode = 500;
                returnResult.message = 'Failed to update user.';
                return returnResult;
            }
            Logger_1.default.info('User updated.');
            returnResult.result = 'Success';
            returnResult.statusCode = 200;
            returnResult.message = 'User updated.';
            return returnResult;
        }
        catch (error) {
            Logger_1.default.error(`Error updating user: ${error}`);
            returnResult.result = 'Failed';
            returnResult.statusCode = 500;
            returnResult.message = 'Failed to update user.';
            return returnResult;
        }
    }
}
exports.default = UserService;
//# sourceMappingURL=userService.js.map